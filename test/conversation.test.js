const conversationState = require('../services/conversationState');

describe('Conversation State Manager', () => {
  beforeEach(() => {
    // Clean up any existing state
    conversationState.states.clear();
  });

  test('should initialize call state', () => {
    const callId = 'test-call-123';
    const callerId = '15195551234';
    
    conversationState.initializeCall(callId, callerId);
    
    const state = conversationState.getState(callId);
    expect(state).toBeDefined();
    expect(state.step).toBe('greeting');
    expect(state.callerId).toBe(callerId);
    expect(state.cardNumber).toBeNull();
    expect(state.expirationMonth).toBeNull();
    expect(state.expirationYear).toBeNull();
  });

  test('should handle greeting response', () => {
    const callId = 'test-call-123';
    const callerId = '15195551234';
    
    conversationState.initializeCall(callId, callerId);
    
    // Test positive response
    const result = conversationState.processResponse(callId, 'yes');
    expect(result.response).toContain('Great! I\'ll need to collect');
    expect(result.nextStep).toBe('continue');
    
    // The state should be updated after processing the response
    const state = conversationState.getState(callId);
    expect(state.step).toBe('collecting_card');
  });

  test('should validate credit card numbers', () => {
    // Test valid card numbers
    expect(conversationState.validateCreditCard('4111111111111111')).toBe(true);
    expect(conversationState.validateCreditCard('5555555555554444')).toBe(true);
    
    // Test invalid card numbers
    expect(conversationState.validateCreditCard('1234567890123456')).toBe(false);
    expect(conversationState.validateCreditCard('4111111111111112')).toBe(false);
  });

  test('should handle card number collection', () => {
    const callId = 'test-call-123';
    const callerId = '15195551234';
    
    conversationState.initializeCall(callId, callerId);
    conversationState.updateState(callId, { step: 'collecting_card' });
    
    const result = conversationState.processResponse(callId, '4111111111111111');
    expect(result.response).toContain('Thank you. What month');
    expect(result.nextStep).toBe('continue');
    
    const state = conversationState.getState(callId);
    expect(state.step).toBe('collecting_month');
    expect(state.cardNumber).toBe('4111111111111111');
  });

  test('should handle expiration month collection', () => {
    const callId = 'test-call-123';
    const callerId = '15195551234';
    
    conversationState.initializeCall(callId, callerId);
    conversationState.updateState(callId, { 
      step: 'collecting_month',
      cardNumber: '4111111111111111'
    });
    
    const result = conversationState.processResponse(callId, '12');
    expect(result.response).toContain('And what year');
    expect(result.nextStep).toBe('continue');
    
    const state = conversationState.getState(callId);
    expect(state.step).toBe('collecting_year');
    expect(state.expirationMonth).toBe('12');
  });

  test('should handle expiration year collection', () => {
    const callId = 'test-call-123';
    const callerId = '15195551234';
    
    conversationState.initializeCall(callId, callerId);
    conversationState.updateState(callId, { 
      step: 'collecting_year',
      cardNumber: '4111111111111111',
      expirationMonth: '12'
    });
    
    const result = conversationState.processResponse(callId, '2028');
    expect(result.response).toContain('Let me confirm');
    expect(result.nextStep).toBe('continue');
    
    const state = conversationState.getState(callId);
    expect(state.step).toBe('confirming');
    expect(state.expirationYear).toBe('2028');
  });

  test('should clean up state on call end', () => {
    const callId = 'test-call-123';
    const callerId = '15195551234';
    
    conversationState.initializeCall(callId, callerId);
    expect(conversationState.getState(callId)).toBeDefined();
    
    conversationState.endCall(callId);
    expect(conversationState.getState(callId)).toBeUndefined();
  });
});
