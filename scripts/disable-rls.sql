-- Simple fix: Disable Row Level Security entirely
-- This allows full public access to your tables (less secure but works for development)

ALTER TABLE associates DISABLE ROW LEVEL SECURITY;
ALTER TABLE spouses DISABLE ROW LEVEL SECURITY;
ALTER TABLE children DISABLE ROW LEVEL SECURITY;
