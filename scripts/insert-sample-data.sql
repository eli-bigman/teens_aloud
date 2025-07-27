-- Add sample data after tables are created
-- Run this AFTER create-tables-only.sql

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
