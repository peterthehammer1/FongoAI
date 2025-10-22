-- Fongo Credit Card Update Call Logs Database Schema

CREATE TABLE IF NOT EXISTS call_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    call_id TEXT UNIQUE NOT NULL,
    caller_name TEXT,
    caller_number TEXT NOT NULL,
    call_date DATE NOT NULL,
    call_time TIME NOT NULL,
    call_duration INTEGER, -- in seconds
    card_type TEXT, -- visa, mastercard, amex
    card_last_4 TEXT, -- last 4 digits only
    card_expiry_month TEXT,
    card_expiry_year TEXT,
    cardholder_name TEXT, -- name on credit card
    update_successful BOOLEAN DEFAULT 0,
    error_message TEXT,
    language_used TEXT DEFAULT 'en',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_call_date ON call_logs(call_date DESC);
CREATE INDEX IF NOT EXISTS idx_caller_number ON call_logs(caller_number);
CREATE INDEX IF NOT EXISTS idx_update_successful ON call_logs(update_successful);

-- SMS tracking table
CREATE TABLE IF NOT EXISTS sms_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    call_id TEXT NOT NULL,
    caller_number TEXT NOT NULL,
    sms_number TEXT NOT NULL,
    sms_sent BOOLEAN DEFAULT 0,
    sms_message_id TEXT, -- Twilio message ID
    sms_provider TEXT, -- twilio, vonage, etc.
    sms_error TEXT,
    link_clicked BOOLEAN DEFAULT 0,
    payment_updated_after_sms BOOLEAN DEFAULT 0,
    payment_updated_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (call_id) REFERENCES call_logs(call_id)
);

CREATE INDEX IF NOT EXISTS idx_sms_call_id ON sms_logs(call_id);
CREATE INDEX IF NOT EXISTS idx_sms_number ON sms_logs(sms_number);
CREATE INDEX IF NOT EXISTS idx_sms_sent ON sms_logs(sms_sent);
CREATE INDEX IF NOT EXISTS idx_sms_created ON sms_logs(created_at DESC);

-- View for dashboard summary statistics
CREATE VIEW IF NOT EXISTS call_summary AS
SELECT 
    COUNT(*) as total_calls,
    SUM(CASE WHEN update_successful = 1 THEN 1 ELSE 0 END) as successful_updates,
    SUM(CASE WHEN update_successful = 0 THEN 1 ELSE 0 END) as failed_updates,
    AVG(call_duration) as avg_duration,
    COUNT(DISTINCT caller_number) as unique_callers,
    COUNT(CASE WHEN card_type = 'visa' THEN 1 END) as visa_count,
    COUNT(CASE WHEN card_type = 'mastercard' THEN 1 END) as mastercard_count,
    COUNT(CASE WHEN card_type = 'amex' THEN 1 END) as amex_count
FROM call_logs;

