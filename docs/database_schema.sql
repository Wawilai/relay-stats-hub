-- ============================================================================
-- Email Tracking and Monitoring System - Database Schema
-- ============================================================================
-- This schema defines the complete database structure for the email tracking
-- system including tables, indexes, functions, and triggers.
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. ENUMS
-- ============================================================================

-- Email recipient status
CREATE TYPE email_status AS ENUM ('sent', 'failed', 'pending', 'bounced');

-- Failure type classification
CREATE TYPE failure_type AS ENUM ('hard_bounce', 'soft_bounce', 'spam', 'rejected', 'timeout', 'other');

-- ============================================================================
-- 3. TABLES
-- ============================================================================

-- Users table
-- Stores user information for the system
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email activities table
-- Main table storing each email sending activity
CREATE TABLE email_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_date DATE NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    subject TEXT,
    total_recipients INTEGER DEFAULT 0,
    successful_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_counts CHECK (
        total_recipients >= 0 AND 
        successful_count >= 0 AND 
        failed_count >= 0 AND
        successful_count + failed_count <= total_recipients
    ),
    CONSTRAINT check_success_rate CHECK (success_rate >= 0 AND success_rate <= 100)
);

-- Email recipients table
-- Stores individual recipient information for each email activity
CREATE TABLE email_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES email_activities(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    status email_status NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email failures table
-- Stores detailed failure information for failed email sends
CREATE TABLE email_failures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES email_activities(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES email_recipients(id) ON DELETE SET NULL,
    error_code VARCHAR(50),
    error_message TEXT,
    failure_type failure_type NOT NULL DEFAULT 'other',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Daily report summary table
-- Aggregated daily statistics for reporting
CREATE TABLE daily_report_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_date DATE NOT NULL UNIQUE,
    total_emails INTEGER DEFAULT 0,
    successful_emails INTEGER DEFAULT 0,
    failed_emails INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    unique_senders INTEGER DEFAULT 0,
    unique_recipients INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_daily_counts CHECK (
        total_emails >= 0 AND 
        successful_emails >= 0 AND 
        failed_emails >= 0 AND
        successful_emails + failed_emails <= total_emails
    ),
    CONSTRAINT check_daily_success_rate CHECK (success_rate >= 0 AND success_rate <= 100)
);

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Email activities indexes
CREATE INDEX idx_activities_user_id ON email_activities(user_id);
CREATE INDEX idx_activities_email_date ON email_activities(email_date DESC);
CREATE INDEX idx_activities_sender_email ON email_activities(sender_email);
CREATE INDEX idx_activities_created_at ON email_activities(created_at DESC);
CREATE INDEX idx_activities_success_rate ON email_activities(success_rate);

-- Email recipients indexes
CREATE INDEX idx_recipients_activity_id ON email_recipients(activity_id);
CREATE INDEX idx_recipients_email ON email_recipients(recipient_email);
CREATE INDEX idx_recipients_status ON email_recipients(status);
CREATE INDEX idx_recipients_sent_at ON email_recipients(sent_at);

-- Email failures indexes
CREATE INDEX idx_failures_activity_id ON email_failures(activity_id);
CREATE INDEX idx_failures_recipient_id ON email_failures(recipient_id);
CREATE INDEX idx_failures_failure_type ON email_failures(failure_type);
CREATE INDEX idx_failures_error_code ON email_failures(error_code);
CREATE INDEX idx_failures_created_at ON email_failures(created_at DESC);

-- Daily report summary indexes
CREATE INDEX idx_daily_report_date ON daily_report_summary(report_date DESC);

-- ============================================================================
-- 5. FUNCTIONS
-- ============================================================================

-- Function to calculate success rate
CREATE OR REPLACE FUNCTION calculate_success_rate(
    successful INTEGER,
    total INTEGER
)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF total = 0 THEN
        RETURN 0.00;
    END IF;
    RETURN ROUND((successful::DECIMAL / total::DECIMAL) * 100, 2);
END;
$$;

-- Function to update activity counts
CREATE OR REPLACE FUNCTION update_activity_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE email_activities
    SET 
        total_recipients = (
            SELECT COUNT(*) 
            FROM email_recipients 
            WHERE activity_id = NEW.activity_id
        ),
        successful_count = (
            SELECT COUNT(*) 
            FROM email_recipients 
            WHERE activity_id = NEW.activity_id 
            AND status = 'sent'
        ),
        failed_count = (
            SELECT COUNT(*) 
            FROM email_recipients 
            WHERE activity_id = NEW.activity_id 
            AND status IN ('failed', 'bounced')
        )
    WHERE id = NEW.activity_id;
    
    -- Update success rate
    UPDATE email_activities
    SET success_rate = calculate_success_rate(successful_count, total_recipients)
    WHERE id = NEW.activity_id;
    
    RETURN NEW;
END;
$$;

-- Function to update user timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Trigger to update activity counts when recipients are added/updated
CREATE TRIGGER trigger_update_activity_counts
AFTER INSERT OR UPDATE ON email_recipients
FOR EACH ROW
EXECUTE FUNCTION update_activity_counts();

-- Trigger to update user updated_at timestamp
CREATE TRIGGER trigger_update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_report_summary ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Email activities policies
CREATE POLICY "Users can view their own activities"
    ON email_activities FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
    ON email_activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
    ON email_activities FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
    ON email_activities FOR DELETE
    USING (auth.uid() = user_id);

-- Email recipients policies
CREATE POLICY "Users can view recipients of their activities"
    ON email_recipients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM email_activities 
            WHERE email_activities.id = email_recipients.activity_id 
            AND email_activities.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert recipients for their activities"
    ON email_recipients FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM email_activities 
            WHERE email_activities.id = email_recipients.activity_id 
            AND email_activities.user_id = auth.uid()
        )
    );

-- Email failures policies
CREATE POLICY "Users can view failures of their activities"
    ON email_failures FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM email_activities 
            WHERE email_activities.id = email_failures.activity_id 
            AND email_activities.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert failures for their activities"
    ON email_failures FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM email_activities 
            WHERE email_activities.id = email_failures.activity_id 
            AND email_activities.user_id = auth.uid()
        )
    );

-- Daily report summary policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view daily reports"
    ON daily_report_summary FOR SELECT
    TO authenticated
    USING (true);

-- ============================================================================
-- 8. COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'Stores user information for the email tracking system';
COMMENT ON TABLE email_activities IS 'Main table storing each email sending activity with summary statistics';
COMMENT ON TABLE email_recipients IS 'Stores individual recipient information for each email activity';
COMMENT ON TABLE email_failures IS 'Stores detailed failure information for failed email sends';
COMMENT ON TABLE daily_report_summary IS 'Aggregated daily statistics for reporting and analytics';

COMMENT ON FUNCTION calculate_success_rate IS 'Calculates the success rate percentage from successful and total counts';
COMMENT ON FUNCTION update_activity_counts IS 'Automatically updates activity counts and success rate when recipients are modified';
COMMENT ON FUNCTION update_updated_at_column IS 'Updates the updated_at timestamp on row updates';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
