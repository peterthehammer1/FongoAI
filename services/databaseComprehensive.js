const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { logger } = require('./logger');

/**
 * Comprehensive Database Service for Retell AI Data
 * Handles all 30+ data fields from Retell AI webhooks
 */

class DatabaseComprehensive {
  constructor() {
    this.dbPath = path.join(__dirname, '..', 'database', 'fongo_comprehensive.db');
    this.db = null;
    this.init();
  }

  init() {
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        logger.error('Error opening comprehensive database:', err);
      } else {
        logger.info('Connected to comprehensive SQLite database');
        this.createTables();
      }
    });
  }

  createTables() {
    const fs = require('fs');
    const schemaPath = path.join(__dirname, '..', 'database', 'retell-comprehensive-schema.sql');
    
    try {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      this.db.exec(schema, (err) => {
        if (err) {
          logger.error('Error creating comprehensive tables:', err);
        } else {
          logger.info('Comprehensive database tables created/verified');
        }
      });
    } catch (error) {
      logger.error('Error reading schema file:', error);
    }
  }

  /**
   * Store comprehensive call data from Retell AI webhook
   * @param {Object} callData - Processed call data from RetellDataProcessor
   * @returns {Promise<number>} Call ID
   */
  async storeComprehensiveCallData(callData) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT OR REPLACE INTO call_logs_comprehensive (
          call_id, call_type, call_status, from_number, to_number, direction,
          agent_id, agent_name, agent_version, start_timestamp, end_timestamp, duration_ms,
          call_date, call_time, disconnection_reason, transcript, transcript_object,
          transcript_with_tool_calls, scrubbed_transcript_with_tool_calls,
          recording_url, recording_multi_channel_url, scrubbed_recording_url, scrubbed_recording_multi_channel_url,
          call_analysis, call_summary, user_sentiment, call_successful, in_voicemail, custom_analysis_data,
          latency_data, call_cost_data, llm_token_usage, metadata, retell_llm_dynamic_variables,
          collected_dynamic_variables, custom_sip_headers, data_storage_setting, opt_in_signed_url,
          public_log_url, knowledge_base_retrieved_contents_url, webhook_data, webhook_events,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;

      const params = [
        callData.call_id, callData.call_type, callData.call_status, callData.from_number, callData.to_number, callData.direction,
        callData.agent_id, callData.agent_name, callData.agent_version, callData.start_timestamp, callData.end_timestamp, callData.duration_ms,
        callData.call_date, callData.call_time, callData.disconnection_reason, callData.transcript, callData.transcript_object,
        callData.transcript_with_tool_calls, callData.scrubbed_transcript_with_tool_calls,
        callData.recording_url, callData.recording_multi_channel_url, callData.scrubbed_recording_url, callData.scrubbed_recording_multi_channel_url,
        callData.call_analysis, callData.call_summary, callData.user_sentiment, callData.call_successful, callData.in_voicemail, callData.custom_analysis_data,
        callData.latency_data, callData.call_cost_data, callData.llm_token_usage, callData.metadata, callData.retell_llm_dynamic_variables,
        callData.collected_dynamic_variables, callData.custom_sip_headers, callData.data_storage_setting, callData.opt_in_signed_url,
        callData.public_log_url, callData.knowledge_base_retrieved_contents_url, callData.webhook_data, callData.webhook_events
      ];

      this.db.run(sql, params, function(err) {
        if (err) {
          logger.error('Error storing comprehensive call data:', err);
          reject(err);
        } else {
          logger.info(`Stored comprehensive data for call ${callData.call_id}`);
          resolve(callData.call_id);
        }
      });
    });
  }

  /**
   * Update credit card specific data
   * @param {string} callId - Call ID
   * @param {Object} cardData - Credit card data
   */
  async updateCreditCardData(callId, cardData) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE call_logs_comprehensive 
        SET card_type = ?, card_last_4 = ?, card_expiry_month = ?, card_expiry_year = ?,
            cardholder_name = ?, update_successful = ?, error_message = ?, language_used = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE call_id = ?
      `;

      const params = [
        cardData.cardType, cardData.cardLast4, cardData.expiryMonth, cardData.expiryYear,
        cardData.cardholderName, cardData.updateSuccessful, cardData.errorMessage, cardData.language,
        callId
      ];

      this.db.run(sql, params, function(err) {
        if (err) {
          logger.error('Error updating credit card data:', err);
          reject(err);
        } else {
          logger.info(`Updated credit card data for call ${callId}`);
          resolve(this.changes);
        }
      });
    });
  }

  /**
   * Get comprehensive call data by ID
   * @param {string} callId - Call ID
   * @returns {Promise<Object>} Complete call data
   */
  async getComprehensiveCallData(callId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM call_logs_comprehensive 
        WHERE call_id = ?
      `;

      this.db.get(sql, [callId], (err, row) => {
        if (err) {
          logger.error('Error getting comprehensive call data:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Get all calls with comprehensive data
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of call data
   */
  async getAllComprehensiveCalls(options = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          call_id, call_type, call_status, from_number, to_number, direction,
          agent_name, start_timestamp, end_timestamp, duration_ms, call_date, call_time,
          disconnection_reason, transcript, call_summary, user_sentiment, call_successful,
          card_type, card_last_4, card_expiry_month, card_expiry_year, cardholder_name,
          update_successful, error_message, language_used, created_at, updated_at
        FROM call_logs_comprehensive
      `;

      const params = [];
      const conditions = [];

      if (options.limit) {
        sql += ` ORDER BY created_at DESC LIMIT ?`;
        params.push(options.limit);
      } else {
        sql += ` ORDER BY created_at DESC`;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Error getting all comprehensive calls:', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Get comprehensive analytics data
   * @returns {Promise<Object>} Analytics summary
   */
  async getComprehensiveAnalytics() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_calls,
          COUNT(CASE WHEN call_successful = 1 THEN 1 END) as successful_calls,
          COUNT(CASE WHEN call_successful = 0 THEN 1 END) as failed_calls,
          COUNT(CASE WHEN update_successful = 1 THEN 1 END) as successful_updates,
          COUNT(CASE WHEN update_successful = 0 THEN 1 END) as failed_updates,
          COUNT(DISTINCT from_number) as unique_callers,
          AVG(duration_ms) as avg_duration_ms,
          COUNT(CASE WHEN user_sentiment = 'Positive' THEN 1 END) as positive_sentiment,
          COUNT(CASE WHEN user_sentiment = 'Negative' THEN 1 END) as negative_sentiment,
          COUNT(CASE WHEN disconnection_reason = 'agent_hangup' THEN 1 END) as agent_hangup,
          COUNT(CASE WHEN disconnection_reason = 'user_hangup' THEN 1 END) as user_hangup,
          COUNT(CASE WHEN disconnection_reason = 'dial_failed' THEN 1 END) as dial_failed
        FROM call_logs_comprehensive
      `;

      this.db.get(sql, [], (err, row) => {
        if (err) {
          logger.error('Error getting comprehensive analytics:', err);
          reject(err);
        } else {
          resolve(row || {});
        }
      });
    });
  }

  /**
   * Search calls with comprehensive filters
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>} Filtered call data
   */
  async searchComprehensiveCalls(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          call_id, call_type, call_status, from_number, to_number, direction,
          agent_name, start_timestamp, end_timestamp, duration_ms, call_date, call_time,
          disconnection_reason, transcript, call_summary, user_sentiment, call_successful,
          card_type, card_last_4, card_expiry_month, card_expiry_year, cardholder_name,
          update_successful, error_message, language_used, created_at, updated_at
        FROM call_logs_comprehensive
        WHERE 1=1
      `;

      const params = [];

      if (filters.fromNumber) {
        sql += ` AND from_number LIKE ?`;
        params.push(`%${filters.fromNumber}%`);
      }

      if (filters.callStatus) {
        sql += ` AND call_status = ?`;
        params.push(filters.callStatus);
      }

      if (filters.callSuccessful !== undefined) {
        sql += ` AND call_successful = ?`;
        params.push(filters.callSuccessful ? 1 : 0);
      }

      if (filters.updateSuccessful !== undefined) {
        sql += ` AND update_successful = ?`;
        params.push(filters.updateSuccessful ? 1 : 0);
      }

      if (filters.userSentiment) {
        sql += ` AND user_sentiment = ?`;
        params.push(filters.userSentiment);
      }

      if (filters.dateFrom) {
        sql += ` AND call_date >= ?`;
        params.push(filters.dateFrom);
      }

      if (filters.dateTo) {
        sql += ` AND call_date <= ?`;
        params.push(filters.dateTo);
      }

      sql += ` ORDER BY created_at DESC`;

      if (filters.limit) {
        sql += ` LIMIT ?`;
        params.push(filters.limit);
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Error searching comprehensive calls:', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Get failed calls with detailed error analysis
   * @returns {Promise<Array>} Failed calls with analysis
   */
  async getFailedCallsAnalysis() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          call_id, call_type, call_status, from_number, to_number, direction,
          agent_name, start_timestamp, end_timestamp, duration_ms, call_date, call_time,
          disconnection_reason, transcript, call_summary, user_sentiment, call_successful,
          card_type, card_last_4, card_expiry_month, card_expiry_year, cardholder_name,
          update_successful, error_message, language_used, created_at, updated_at
        FROM call_logs_comprehensive
        WHERE call_successful = 0 OR update_successful = 0
        ORDER BY created_at DESC
      `;

      this.db.all(sql, [], (err, rows) => {
        if (err) {
          logger.error('Error getting failed calls analysis:', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Store webhook event
   * @param {string} callId - Call ID
   * @param {string} eventType - Event type
   * @param {Object} eventData - Event data
   */
  async storeWebhookEvent(callId, eventType, eventData) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO webhook_events (call_id, event_type, event_data)
        VALUES (?, ?, ?)
      `;

      this.db.run(sql, [callId, eventType, JSON.stringify(eventData)], function(err) {
        if (err) {
          logger.error('Error storing webhook event:', err);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  /**
   * Get webhook events for a call
   * @param {string} callId - Call ID
   * @returns {Promise<Array>} Webhook events
   */
  async getWebhookEvents(callId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM webhook_events 
        WHERE call_id = ? 
        ORDER BY received_at ASC
      `;

      this.db.all(sql, [callId], (err, rows) => {
        if (err) {
          logger.error('Error getting webhook events:', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          logger.error('Error closing comprehensive database:', err);
        } else {
          logger.info('Comprehensive database connection closed');
        }
      });
    }
  }
}

module.exports = new DatabaseComprehensive();
