-- Google Forms Data Schema for Teens Aloud Foundation
-- This schema handles the complex member registration data from Google Forms

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS member_children CASCADE;
DROP TABLE IF EXISTS member_spouses CASCADE;
DROP TABLE IF EXISTS members CASCADE;

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Main Members Table
CREATE TABLE members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    second_email VARCHAR(255),
    active_email VARCHAR(255),
    
    -- Personal Information
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
    nationality VARCHAR(100),
    relationship_status VARCHAR(20) CHECK (relationship_status IN ('Single', 'Married', 'Divorced', 'Widowed')),
    
    -- Contact Information
    active_phone_number VARCHAR(50),
    other_phone_number VARCHAR(50),
    current_address TEXT,
    
    -- Employment Status
    currently_employed BOOLEAN DEFAULT FALSE,
    current_employer TEXT,
    prefered_work_industry TEXT,
    area_of_work TEXT,
    looking_for_job BOOLEAN DEFAULT FALSE,
    
    -- Education
    year_of_completion INTEGER,
    postgrad_year_of_completion INTEGER,
    tertiary_institution_name TEXT,
    completed_tertiary BOOLEAN DEFAULT FALSE,
    
    -- Family Information
    has_children BOOLEAN DEFAULT FALSE,
    number_of_children INTEGER DEFAULT 0,
    
    -- WhatsApp Association
    on_associate_whatsapp BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spouses Table (for married members)
CREATE TABLE member_spouses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    marriage_anniversary_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(member_id) -- One spouse per member
);

-- Children Table
CREATE TABLE member_children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    date_of_birth DATE,
    child_order INTEGER NOT NULL CHECK (child_order BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(member_id, child_order) -- Ensures unique ordering per member
);

-- Indexes for better performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_active_email ON members(active_email);
CREATE INDEX idx_members_phone ON members(active_phone_number);
CREATE INDEX idx_members_name ON members(full_name);
CREATE INDEX idx_members_timestamp ON members(timestamp);
CREATE INDEX idx_members_year_completion ON members(year_of_completion);
CREATE INDEX idx_members_institution ON members(tertiary_institution_name);
CREATE INDEX idx_members_relationship_status ON members(relationship_status);
CREATE INDEX idx_member_spouses_member_id ON member_spouses(member_id);
CREATE INDEX idx_member_children_member_id ON member_children(member_id);

-- Row Level Security Policies
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_spouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_children ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all members
CREATE POLICY "Members are viewable by authenticated users" ON members
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for authenticated users to insert members
CREATE POLICY "Members can be inserted by authenticated users" ON members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for authenticated users to update members
CREATE POLICY "Members can be updated by authenticated users" ON members
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy for spouses
CREATE POLICY "Spouses are viewable by authenticated users" ON member_spouses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Spouses can be inserted by authenticated users" ON member_spouses
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Spouses can be updated by authenticated users" ON member_spouses
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy for children
CREATE POLICY "Children are viewable by authenticated users" ON member_children
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Children can be inserted by authenticated users" ON member_children
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Children can be updated by authenticated users" ON member_children
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_members_updated_at 
    BEFORE UPDATE ON members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for easy member overview with counts
CREATE OR REPLACE VIEW member_overview AS
SELECT 
    m.id,
    m.full_name,
    m.email,
    m.active_email,
    m.date_of_birth,
    m.gender,
    m.nationality,
    m.relationship_status,
    m.active_phone_number,
    m.current_address,
    m.currently_employed,
    m.current_employer,
    m.year_of_completion,
    m.tertiary_institution_name,
    m.has_children,
    m.number_of_children,
    CASE WHEN s.id IS NOT NULL THEN s.full_name ELSE NULL END as spouse_name,
    s.marriage_anniversary_date,
    (SELECT COUNT(*) FROM member_children c WHERE c.member_id = m.id) as actual_children_count,
    m.on_associate_whatsapp,
    m.created_at,
    m.updated_at
FROM members m
LEFT JOIN member_spouses s ON m.id = s.member_id
ORDER BY m.created_at DESC;

-- Create a function to safely parse dates
CREATE OR REPLACE FUNCTION safe_parse_date(date_string TEXT)
RETURNS DATE AS $$
BEGIN
    -- Handle various date formats and return NULL for invalid dates
    IF date_string IS NULL OR date_string = '' OR date_string = '-' THEN
        RETURN NULL;
    END IF;
    
    -- Try DD/MM/YYYY format first
    BEGIN
        RETURN TO_DATE(date_string, 'DD/MM/YYYY');
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    -- Try MM/DD/YYYY format
    BEGIN
        RETURN TO_DATE(date_string, 'MM/DD/YYYY');
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    -- Try YYYY-MM-DD format
    BEGIN
        RETURN DATE(date_string);
    EXCEPTION WHEN OTHERS THEN
        RETURN NULL;
    END;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a function to safely parse timestamp
CREATE OR REPLACE FUNCTION safe_parse_timestamp(timestamp_string TEXT)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    IF timestamp_string IS NULL OR timestamp_string = '' THEN
        RETURN NULL;
    END IF;
    
    -- Try DD/MM/YYYY HH24:MI:SS format
    BEGIN
        RETURN TO_TIMESTAMP(timestamp_string, 'DD/MM/YYYY HH24:MI:SS');
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    -- Try other common formats
    BEGIN
        RETURN timestamp_string::TIMESTAMP WITH TIME ZONE;
    EXCEPTION WHEN OTHERS THEN
        RETURN NOW(); -- Fallback to current time
    END;
    
    RETURN NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for authenticated users
GRANT ALL ON members TO authenticated;
GRANT ALL ON member_spouses TO authenticated;
GRANT ALL ON member_children TO authenticated;
GRANT ALL ON member_overview TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON TABLE members IS 'Main table storing member registration information from Google Forms';
COMMENT ON TABLE member_spouses IS 'Spouse information for married members';
COMMENT ON TABLE member_children IS 'Children information for members with families';
COMMENT ON VIEW member_overview IS 'Comprehensive view of members with related information';
