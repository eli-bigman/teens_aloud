-- Create admins table for authentication
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES admins(id),
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);

-- Insert default admin account

-- Enable Row Level Security (optional - can be enabled later)
-- ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage other admins
-- CREATE POLICY "Admins can view all admins" ON admins
--     FOR SELECT USING (true);

-- CREATE POLICY "Admins can insert new admins" ON admins
--     FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Admins can update admin accounts" ON admins
--     FOR UPDATE USING (true);

COMMENT ON TABLE admins IS 'Administrator accounts for the Teens Aloud Foundation dashboard';
COMMENT ON COLUMN admins.username IS 'Unique username for login';
COMMENT ON COLUMN admins.email IS 'Email address of the administrator';
COMMENT ON COLUMN admins.full_name IS 'Full name of the administrator';
COMMENT ON COLUMN admins.password_hash IS 'Hashed password for authentication';
COMMENT ON COLUMN admins.last_login IS 'Timestamp of last successful login';
COMMENT ON COLUMN admins.created_by IS 'ID of the admin who created this account';
COMMENT ON COLUMN admins.is_active IS 'Whether the account is active and can login';
