const express = require('express');
const WebSocket = require('ws');
const conversationState = require('../services/conversationState');

const router = express.Router();

// Store active WebSocket connections
const activeConnections = new Map();

// WebSocket server for NUCLEUS AI LLM communication (will be initialized by main server)
let wss = null;

function initializeWebSocketServer(server) {
  wss = new WebSocket.Server({ 
    server: server,
    path: '/llm-websocket'
  });
  
  setupWebSocketHandlers();
}

function setupWebSocketHandlers() {
  wss.on('connection', (ws, req) => {
    console.log('🤖 New LLM WebSocket connection established');
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        console.log('📨 Received LLM message:', data);
        
        // Handle different message types
        switch (data.message_type) {
          case 'ping':
            ws.send(JSON.stringify({ message_type: 'pong' }));
            break;
            
          case 'response':
            await handleLLMResponse(ws, data);
            break;
            
          case 'call_started':
            handleCallStarted(ws, data);
            break;
            
          case 'call_ended':
            handleCallEnded(ws, data);
            break;
            
          default:
            console.log('Unknown message type:', data.message_type);
        }
      } catch (error) {
        console.error('Error processing LLM message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('🤖 LLM WebSocket connection closed');
    });
    
    ws.on('error', (error) => {
      console.error('🤖 LLM WebSocket error:', error);
    });
  });
}

async function handleLLMResponse(ws, data) {
  const { call_id, response } = data;
  
  console.log(`🤖 Processing response for call ${call_id}: ${response}`);
  
  // Extract caller ID from the call data
  const callerId = data.call?.from_number;
  
  if (!callerId) {
    console.error('No caller ID found');
    return;
  }
  
  // Process the response using conversation state manager
  const result = conversationState.processResponse(call_id, response);
  
  // Send response back to Retell AI
  ws.send(JSON.stringify({
    message_type: 'response',
    call_id: call_id,
    response: result.response
  }));
  
  // If next step is to end call, clean up state
  if (result.nextStep === 'end_call') {
    conversationState.endCall(call_id);
  }
}

function handleCallStarted(ws, data) {
  const { call_id, call } = data;
  console.log(`📞 Call started: ${call_id} from ${call.from_number}`);
  console.log(`📞 Caller name: ${call.from_name || 'Not provided'}`);
  
  // Store connection for this call
  activeConnections.set(call_id, ws);
  
  // Initialize conversation state
  conversationState.initializeCall(call_id, call.from_number, call.from_name);
  
  // Create personalized greeting
  const callerName = call.from_name ? `, ${call.from_name}` : '';
  const greeting = `Hello${callerName}! This is Nova from Fongo. I'm here to help you update your credit card information. I can see you're calling from ${call.from_number}. Is this the correct phone number for your Fongo account?`;
  
  ws.send(JSON.stringify({
    message_type: 'response',
    call_id: call_id,
    response: greeting
  }));
}

function handleCallEnded(ws, data) {
  const { call_id } = data;
  console.log(`📞 Call ended: ${call_id}`);
  
  // Clean up connection and conversation state
  activeConnections.delete(call_id);
  conversationState.endCall(call_id);
}


module.exports = { router, initializeWebSocketServer };
