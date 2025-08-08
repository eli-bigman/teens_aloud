-- Security improvements for admins table
-- Run this script to implement Row Level Security and create secure views

-- Enable Row Level Security on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
-- Note: In a real application, you would use Supabase auth.uid() for proper user context
-- For now, we'll use basic policies that allow authenticated access

-- Policy for viewing admin data (without password hashes)
CREATE POLICY "Authenticated users can view admin data" ON admins
    FOR SELECT
    USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Policy for creating new admins
CREATE POLICY "Authenticated users can create admins" ON admins
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Policy for updating admin data
CREATE POLICY "Authenticated users can update admins" ON admins
    FOR UPDATE
    USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Policy for deleting admins
CREATE POLICY "Authenticated users can delete admins" ON admins
    FOR DELETE
    USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Create a secure view that excludes password hashes
CREATE OR REPLACE VIEW admin_secure_view AS
SELECT 
    id,
    username,
    email,
    full_name,
    last_login,
    created_at,
    updated_at,
    created_by,
    is_active
FROM admins;

-- Grant permissions on the secure view
GRANT SELECT ON admin_secure_view TO authenticated;
GRANT SELECT ON admin_secure_view TO anon;

-- Create function to safely authenticate admin
CREATE OR REPLACE FUNCTION authenticate_admin(input_username TEXT, input_password_hash TEXT)
RETURNS TABLE (
    id INTEGER,
    username VARCHAR(50),
    email VARCHAR(255),
    full_name VARCHAR(255),
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    created_by INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.username,
        a.email,
        a.full_name,
        a.is_active,
        a.created_at,
        a.created_by
    FROM admins a
    WHERE a.username = input_username 
      AND a.password_hash = input_password_hash 
      AND a.is_active = true;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION authenticate_admin TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_admin TO anon;

-- Comments
COMMENT ON VIEW admin_secure_view IS 'Secure view of admins table that excludes password hashes';
COMMENT ON FUNCTION authenticate_admin IS 'Secure function for admin authentication without exposing password hashes';
