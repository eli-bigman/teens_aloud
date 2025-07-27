-- Drop existing tables if they exist (in correct order due to dependencies)
DROP TABLE IF EXISTS children CASCADE;
DROP TABLE IF EXISTS spouses CASCADE;
DROP TABLE IF EXISTS associates CASCADE;

-- Create the associates table
CREATE TABLE associates (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  tertiary_education BOOLEAN NOT NULL DEFAULT false,
  school VARCHAR(255),
  year_of_completion VARCHAR(4),
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
  nationality VARCHAR(100) NOT NULL,
  active_phone_number VARCHAR(20) NOT NULL,
  other_phone_number VARCHAR(20),
  currently_employed BOOLEAN NOT NULL DEFAULT false,
  employer VARCHAR(255),
  looking_for_job BOOLEAN DEFAULT false,
  preferred_work_area VARCHAR(255),
  current_address TEXT NOT NULL,
  on_whatsapp BOOLEAN NOT NULL DEFAULT false,
  relationship_status VARCHAR(10) NOT NULL CHECK (relationship_status IN ('Single', 'Married')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the spouses table (no circular reference)
CREATE TABLE spouses (
  id SERIAL PRIMARY KEY,
  associate_id INTEGER NOT NULL REFERENCES associates(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  marriage_anniversary DATE NOT NULL,
  have_children BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(associate_id) -- Each associate can have only one spouse record
);

-- Create the children table
CREATE TABLE children (
  id SERIAL PRIMARY KEY,
  associate_id INTEGER NOT NULL REFERENCES associates(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_associates_date_of_birth ON associates(date_of_birth);
CREATE INDEX idx_associates_nationality ON associates(nationality);
CREATE INDEX idx_associates_employed ON associates(currently_employed);
CREATE INDEX idx_associates_whatsapp ON associates(on_whatsapp);
CREATE INDEX idx_associates_relationship_status ON associates(relationship_status);
CREATE INDEX idx_spouses_associate_id ON spouses(associate_id);
CREATE INDEX idx_spouses_anniversary ON spouses(marriage_anniversary);
CREATE INDEX idx_children_associate_id ON children(associate_id);
CREATE INDEX idx_children_date_of_birth ON children(date_of_birth);

-- Enable Row Level Security
ALTER TABLE associates ENABLE ROW LEVEL SECURITY;
ALTER TABLE spouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust based on your needs)
CREATE POLICY "Enable read access for all users" ON associates FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON associates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON associates FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON spouses FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON spouses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON spouses FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON children FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON children FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON children FOR UPDATE USING (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_associates_updated_at BEFORE UPDATE ON associates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spouses_updated_at BEFORE UPDATE ON spouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();




INSERT INTO associates (
  email, full_name, tertiary_education, school, year_of_completion, date_of_birth,
  gender, nationality, active_phone_number, other_phone_number, currently_employed,
  employer, looking_for_job, preferred_work_area, current_address, on_whatsapp,
  relationship_status
) VALUES
('kwame.addo@example.com', 'Kwame Addo', true, 'University of Ghana', '2017', '1993-06-21',
 'Male', 'Ghanaian', '+233244111222', '+233545111222', true, 'MTN Ghana', false, 'Telecoms', 'East Legon, Accra', true, 'Married'),
 
('ama.boakye@example.com', 'Ama Boakye', true, 'KNUST', '2019', '1995-02-11',
 'Female', 'Ghanaian', '+233207222333', NULL, false, NULL, true, 'Finance', 'Tanoso, Kumasi', true, 'Single'),
 
('kojo.danso@example.com', 'Kojo Danso', false, NULL, NULL, '1990-08-05',
 'Male', 'Ghanaian', '+233200333444', NULL, true, 'Ghana Health Service', false, 'Healthcare', 'Cape Coast', false, 'Married');


INSERT INTO spouses (
  associate_id, full_name, date_of_birth, marriage_anniversary, have_children
) VALUES
(1, 'Akosua Addo', '1994-03-15', '2020-12-20', true),
(3, 'Esi Danso', '1991-10-10', '2018-05-06', true);


INSERT INTO children (
  associate_id, full_name, date_of_birth
) VALUES
(1, 'Kofi Addo', '2021-03-25'),
(3, 'Abena Danso', '2019-07-12'),
(3, 'Yaw Danso', '2023-11-04');
