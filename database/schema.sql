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
    update_successful BOOLEAN DEFAULT 0,
    error_message TEXT,
    language_used TEXT DEFAULT 'en',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_call_date ON call_logs(call_date DESC);
CREATE INDEX IF NOT EXISTS idx_caller_number ON call_logs(caller_number);
CREATE INDEX IF NOT EXISTS idx_update_successful ON call_logs(update_successful);

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

