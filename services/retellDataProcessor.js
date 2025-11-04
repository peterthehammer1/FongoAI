const { logger } = require('./logger');

/**
 * Comprehensive Retell AI Data Processor
 * Handles all 30+ data fields from Retell AI webhooks
 */

class RetellDataProcessor {
  constructor() {
    this.supportedEvents = ['call_started', 'call_ended', 'call_analyzed'];
  }

  /**
   * Process webhook event and extract all Retell AI data
   * @param {Object} webhookPayload - Full webhook payload from Retell AI
   * @returns {Object} Processed data ready for database storage
   */
  processWebhookEvent(webhookPayload) {
    try {
      const { event, call, data } = webhookPayload;
      
      if (!this.supportedEvents.includes(event)) {
        logger.warn(`Unsupported webhook event: ${event}`);
        return null;
      }

      if (!call || !call.call_id) {
        logger.error('Invalid webhook payload: missing call object or call_id');
        return null;
      }

      const processedData = {
        // Core Call Information
        call_id: call.call_id,
        call_type: call.call_type,
        call_status: call.call_status,
        from_number: call.from_number,
        to_number: call.to_number,
        direction: call.direction,
        
        // Agent Information
        agent_id: call.agent_id,
        agent_name: call.agent_name,
        agent_version: call.agent_version,
        
        // Timing Information
        start_timestamp: call.start_timestamp,
        end_timestamp: call.end_timestamp,
        duration_ms: call.duration_ms,
        call_date: this.extractDate(call.start_timestamp),
        call_time: this.extractTime(call.start_timestamp),
        
        // Call Outcome
        disconnection_reason: call.disconnection_reason,
        
        // Transcript Data (Multiple Formats)
        transcript: call.transcript,
        transcript_object: this.safeStringify(call.transcript_object),
        transcript_with_tool_calls: this.safeStringify(call.transcript_with_tool_calls),
        scrubbed_transcript_with_tool_calls: this.safeStringify(call.scrubbed_transcript_with_tool_calls),
        
        // Recording URLs
        recording_url: call.recording_url,
        recording_multi_channel_url: call.recording_multi_channel_url,
        scrubbed_recording_url: call.scrubbed_recording_url,
        scrubbed_recording_multi_channel_url: call.scrubbed_recording_multi_channel_url,
        
        // Call Analysis (only available in call_analyzed event)
        call_analysis: this.safeStringify(call.call_analysis),
        call_summary: call.call_analysis?.call_summary,
        user_sentiment: call.call_analysis?.user_sentiment,
        call_successful: call.call_analysis?.call_successful,
        in_voicemail: call.call_analysis?.in_voicemail,
        custom_analysis_data: this.safeStringify(call.call_analysis?.custom_analysis_data),
        
        // Performance Metrics
        latency_data: this.safeStringify(call.latency),
        call_cost_data: this.safeStringify(call.call_cost),
        llm_token_usage: this.safeStringify(call.llm_token_usage),
        
        // Metadata and Configuration
        metadata: this.safeStringify(call.metadata),
        retell_llm_dynamic_variables: this.safeStringify(call.retell_llm_dynamic_variables),
        collected_dynamic_variables: this.safeStringify(call.collected_dynamic_variables),
        custom_sip_headers: this.safeStringify(call.custom_sip_headers),
        data_storage_setting: call.data_storage_setting,
        opt_in_signed_url: call.opt_in_signed_url,
        
        // Additional Resources
        public_log_url: call.public_log_url,
        knowledge_base_retrieved_contents_url: call.knowledge_base_retrieved_contents_url,
        
        // Webhook Data
        webhook_data: this.safeStringify(webhookPayload),
        webhook_events: this.safeStringify([{
          event_type: event,
          received_at: new Date().toISOString(),
          data: data
        }])
      };

      logger.info(`Processed ${event} event for call ${call.call_id}`, {
        hasTranscript: !!call.transcript,
        hasAnalysis: !!call.call_analysis,
        hasRecording: !!call.recording_url,
        duration: call.duration_ms
      });

      return processedData;

    } catch (error) {
      logger.error('Error processing Retell webhook event', {
        error: error.message,
        stack: error.stack,
        webhookPayload: webhookPayload
      });
      throw error;
    }
  }

  /**
   * Extract structured transcript for chat bubble display
   * @param {string|Object} transcriptData - Transcript in various formats
   * @returns {Array} Array of message objects for chat display
   */
  parseTranscriptForChat(transcriptData) {
    try {
      let transcript = transcriptData;
      
      // If it's a string, try to parse as JSON first
      if (typeof transcriptData === 'string') {
        try {
          transcript = JSON.parse(transcriptData);
        } catch (e) {
          // If not JSON, treat as plain text
          return this.parsePlainTextTranscript(transcriptData);
        }
      }

      // Handle transcript_object format (structured with timestamps)
      if (Array.isArray(transcript)) {
        return transcript.map(msg => ({
          speaker: msg.role === 'agent' ? 'agent' : 'customer',
          text: msg.content,
          timestamp: msg.words?.[0]?.start || null,
          words: msg.words || []
        }));
      }

      // Handle transcript_with_tool_calls format
      if (transcript && typeof transcript === 'object' && transcript.transcript) {
        return this.parseTranscriptForChat(transcript.transcript);
      }

      // Fallback to plain text parsing
      return this.parsePlainTextTranscript(transcriptData);

    } catch (error) {
      logger.error('Error parsing transcript for chat display', {
        error: error.message,
        transcriptData: typeof transcriptData === 'string' ? transcriptData.substring(0, 100) : transcriptData
      });
      return [];
    }
  }

  /**
   * Parse plain text transcript into chat messages
   * @param {string} transcriptText - Plain text transcript
   * @returns {Array} Array of message objects
   */
  parsePlainTextTranscript(transcriptText) {
    if (!transcriptText || typeof transcriptText !== 'string') {
      return [];
    }

    const messages = [];
    const lines = transcriptText.split('\n').filter(line => line.trim());

    let currentSpeaker = null;
    let currentText = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Check for speaker labels
      const agentMatch = trimmedLine.match(/^(Agent|Nova|Fona|AI|Assistant):\s*(.+)/i);
      const userMatch = trimmedLine.match(/^(User|Caller|Customer):\s*(.+)/i);
      
      if (agentMatch) {
        // Save previous message
        if (currentSpeaker && currentText.length > 0) {
          messages.push({
            speaker: currentSpeaker,
            text: currentText.join(' ').trim(),
            timestamp: null
          });
        }
        currentSpeaker = 'agent';
        currentText = [agentMatch[2]];
      } else if (userMatch) {
        // Save previous message
        if (currentSpeaker && currentText.length > 0) {
          messages.push({
            speaker: currentSpeaker,
            text: currentText.join(' ').trim(),
            timestamp: null
          });
        }
        currentSpeaker = 'customer';
        currentText = [userMatch[2]];
      } else {
        // Continuation of current message
        if (currentSpeaker) {
          currentText.push(trimmedLine);
        } else {
          // Default to agent if no speaker identified
          currentSpeaker = 'agent';
          currentText = [trimmedLine];
        }
      }
    });

    // Don't forget the last message
    if (currentSpeaker && currentText.length > 0) {
      messages.push({
        speaker: currentSpeaker,
        text: currentText.join(' ').trim(),
        timestamp: null
      });
    }

    return messages;
  }

  /**
   * Extract call analysis insights
   * @param {Object} callAnalysis - Call analysis object from Retell
   * @returns {Object} Structured analysis insights
   */
  extractAnalysisInsights(callAnalysis) {
    if (!callAnalysis) return {};

    return {
      summary: callAnalysis.call_summary,
      sentiment: callAnalysis.user_sentiment,
      successful: callAnalysis.call_successful,
      inVoicemail: callAnalysis.in_voicemail,
      customData: callAnalysis.custom_analysis_data || {},
      // Add more insights as needed
    };
  }

  /**
   * Extract performance metrics
   * @param {Object} latencyData - Latency data from Retell
   * @returns {Object} Structured performance metrics
   */
  extractPerformanceMetrics(latencyData) {
    if (!latencyData) return {};

    return {
      e2e: latencyData.e2e || {},
      llm: latencyData.llm || {},
      tts: latencyData.tts || {},
      knowledgeBase: latencyData.knowledge_base || {},
      s2s: latencyData.s2s || {}
    };
  }

  /**
   * Safe JSON stringify with error handling
   * @param {any} data - Data to stringify
   * @returns {string|null} JSON string or null
   */
  safeStringify(data) {
    if (data === null || data === undefined) return null;
    try {
      return JSON.stringify(data);
    } catch (error) {
      logger.warn('Failed to stringify data', { error: error.message, data });
      return null;
    }
  }

  /**
   * Extract date from timestamp
   * @param {number} timestamp - Unix timestamp in milliseconds
   * @returns {string} Date in YYYY-MM-DD format
   */
  extractDate(timestamp) {
    if (!timestamp) return null;
    return new Date(timestamp).toISOString().split('T')[0];
  }

  /**
   * Extract time from timestamp
   * @param {number} timestamp - Unix timestamp in milliseconds
   * @returns {string} Time in HH:MM:SS format
   */
  extractTime(timestamp) {
    if (!timestamp) return null;
    return new Date(timestamp).toISOString().split('T')[1].split('.')[0];
  }

  /**
   * Format duration for display
   * @param {number} durationMs - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  formatDuration(durationMs) {
    if (!durationMs) return '0:00';
    
    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }
}

module.exports = new RetellDataProcessor();
