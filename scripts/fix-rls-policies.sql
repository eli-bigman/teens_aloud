-- Fix RLS Policies for Public Access
-- Run this if you want to allow public access without authentication

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON associates;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON associates;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON spouses;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON spouses;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON children;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON children;

-- Create permissive policies for public access
-- ASSOCIATES table policies
CREATE POLICY "Enable all operations for all users" ON associates FOR ALL USING (true) WITH CHECK (true);

-- SPOUSES table policies  
CREATE POLICY "Enable all operations for all users" ON spouses FOR ALL USING (true) WITH CHECK (true);

-- CHILDREN table policies
CREATE POLICY "Enable all operations for all users" ON children FOR ALL USING (true) WITH CHECK (true);

-- Alternative: If you want to disable RLS entirely (less secure but simpler)
-- Uncomment the lines below instead of using the policies above:

-- ALTER TABLE associates DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE spouses DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE children DISABLE ROW LEVEL SECURITY;
