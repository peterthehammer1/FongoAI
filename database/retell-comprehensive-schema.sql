-- Comprehensive Retell AI Data Storage Schema
-- This schema captures ALL data fields from Retell AI webhooks

-- Enhanced call_logs table with all Retell AI fields
CREATE TABLE IF NOT EXISTS call_logs_comprehensive (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Core Call Information
    call_id TEXT UNIQUE NOT NULL,
    call_type TEXT, -- 'phone_call' or 'web_call'
    call_status TEXT, -- 'registered', 'ongoing', 'ended', etc.
    from_number TEXT,
    to_number TEXT,
    direction TEXT, -- 'inbound' or 'outbound'
    
    -- Agent Information
    agent_id TEXT,
    agent_name TEXT,
    agent_version INTEGER,
    
    -- Timing Information
    start_timestamp INTEGER, -- Unix timestamp in milliseconds
    end_timestamp INTEGER, -- Unix timestamp in milliseconds
    duration_ms INTEGER, -- Duration in milliseconds
    call_date DATE, -- Extracted from start_timestamp
    call_time TIME, -- Extracted from start_timestamp
    
    -- Call Outcome
    disconnection_reason TEXT, -- 'agent_hangup', 'user_hangup', 'dial_failed', etc.
    
    -- Transcript Data (Multiple Formats)
    transcript TEXT, -- Plain text transcript
    transcript_object TEXT, -- JSON array of structured transcript
    transcript_with_tool_calls TEXT, -- JSON with function calls integrated
    scrubbed_transcript_with_tool_calls TEXT, -- PII-scrubbed version
    
    -- Recording URLs
    recording_url TEXT,
    recording_multi_channel_url TEXT,
    scrubbed_recording_url TEXT,
    scrubbed_recording_multi_channel_url TEXT,
    
    -- Call Analysis
    call_analysis TEXT, -- JSON object with analysis results
    call_summary TEXT,
    user_sentiment TEXT, -- 'Positive', 'Negative', 'Neutral'
    call_successful BOOLEAN,
    in_voicemail BOOLEAN,
    custom_analysis_data TEXT, -- JSON object
    
    -- Performance Metrics (JSON objects)
    latency_data TEXT, -- JSON with e2e, llm, tts, etc. metrics
    call_cost_data TEXT, -- JSON with cost breakdown
    llm_token_usage TEXT, -- JSON with token usage stats
    
    -- Metadata and Configuration
    metadata TEXT, -- JSON object
    retell_llm_dynamic_variables TEXT, -- JSON object
    collected_dynamic_variables TEXT, -- JSON object
    custom_sip_headers TEXT, -- JSON object
    data_storage_setting TEXT,
    opt_in_signed_url BOOLEAN,
    
    -- Additional Resources
    public_log_url TEXT,
    knowledge_base_retrieved_contents_url TEXT,
    
    -- Credit Card Update Specific (from our existing system)
    card_type TEXT,
    card_last_4 TEXT,
    card_expiry_month TEXT,
    card_expiry_year TEXT,
    cardholder_name TEXT,
    update_successful BOOLEAN,
    error_message TEXT,
    language_used TEXT DEFAULT 'en',
    
    -- Webhook Data
    webhook_data TEXT, -- Full JSON webhook payload
    webhook_events TEXT, -- JSON array of all webhook events received
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_id ON call_logs_comprehensive(call_id);
CREATE INDEX IF NOT EXISTS idx_call_date ON call_logs_comprehensive(call_date DESC);
CREATE INDEX IF NOT EXISTS idx_from_number ON call_logs_comprehensive(from_number);
CREATE INDEX IF NOT EXISTS idx_agent_id ON call_logs_comprehensive(agent_id);
CREATE INDEX IF NOT EXISTS idx_call_status ON call_logs_comprehensive(call_status);
CREATE INDEX IF NOT EXISTS idx_call_successful ON call_logs_comprehensive(call_successful);
CREATE INDEX IF NOT EXISTS idx_user_sentiment ON call_logs_comprehensive(user_sentiment);
CREATE INDEX IF NOT EXISTS idx_disconnection_reason ON call_logs_comprehensive(disconnection_reason);

-- View for dashboard summary
CREATE VIEW IF NOT EXISTS call_summary_comprehensive AS
SELECT 
    COUNT(*) as total_calls,
    COUNT(CASE WHEN call_successful = 1 THEN 1 END) as successful_calls,
    COUNT(CASE WHEN call_successful = 0 THEN 1 END) as failed_calls,
    COUNT(CASE WHEN update_successful = 1 THEN 1 END) as successful_updates,
    COUNT(CASE WHEN update_successful = 0 THEN 1 END) as failed_updates,
    COUNT(DISTINCT from_number) as unique_callers,
    AVG(duration_ms) as avg_duration_ms,
    AVG(CASE WHEN call_successful = 1 THEN duration_ms END) as avg_successful_duration_ms,
    COUNT(CASE WHEN user_sentiment = 'Positive' THEN 1 END) as positive_sentiment,
    COUNT(CASE WHEN user_sentiment = 'Negative' THEN 1 END) as negative_sentiment,
    COUNT(CASE WHEN disconnection_reason = 'agent_hangup' THEN 1 END) as agent_hangup,
    COUNT(CASE WHEN disconnection_reason = 'user_hangup' THEN 1 END) as user_hangup,
    COUNT(CASE WHEN disconnection_reason = 'dial_failed' THEN 1 END) as dial_failed
FROM call_logs_comprehensive;

-- Webhook events tracking table
CREATE TABLE IF NOT EXISTS webhook_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    call_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'call_started', 'call_ended', 'call_analyzed'
    event_data TEXT, -- JSON payload for this specific event
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (call_id) REFERENCES call_logs_comprehensive(call_id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_call_id ON webhook_events(call_id);
CREATE INDEX IF NOT EXISTS idx_webhook_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_received_at ON webhook_events(received_at DESC);
