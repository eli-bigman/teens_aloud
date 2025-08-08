#!/usr/bin/env python3
"""
CSV to SQL Converter for Teens Aloud Foundation Google Forms Data
Converts the Google Forms CSV export into PostgreSQL INSERT statements
"""

import csv
import re
from datetime import datetime
from typing import Optional, List, Dict, Any

def clean_text(text: str) -> Optional[str]:
    """Clean and escape text for SQL insertion"""
    if not text or text.strip() == '' or text.strip() == '-':
        return None
    
    # Remove extra whitespace and escape single quotes
    cleaned = text.strip().replace("'", "''")
    return cleaned

def parse_boolean(value: str) -> bool:
    """Convert text values to boolean"""
    if not value:
        return False
    
    value = value.strip().lower()
    return value in ['yes', 'true', '1', 'yeah', 'yh', 'sure', 'ok', 'i am', 'just joined', 'joined now']

def parse_date(date_str: str) -> Optional[str]:
    """Parse date string and return in SQL format"""
    if not date_str or date_str.strip() == '' or date_str.strip() == '-':
        return None
    
    date_str = date_str.strip()
    
    # Try different date formats
    formats = [
        '%d/%m/%Y',
        '%m/%d/%Y', 
        '%Y-%m-%d',
        '%d-%m-%Y',
        '%Y/%m/%d'
    ]
    
    for fmt in formats:
        try:
            parsed_date = datetime.strptime(date_str, fmt)
            return parsed_date.strftime('%Y-%m-%d')
        except ValueError:
            continue
    
    return None

def parse_timestamp(timestamp_str: str) -> Optional[str]:
    """Parse timestamp string and return in SQL format"""
    if not timestamp_str:
        return None
    
    try:
        # Google Forms timestamp format: DD/MM/YYYY HH:MM:SS
        parsed_ts = datetime.strptime(timestamp_str.strip(), '%d/%m/%Y %H:%M:%S')
        return parsed_ts.strftime('%Y-%m-%d %H:%M:%S')
    except ValueError:
        return None

def escape_sql_value(value: Any) -> str:
    """Escape a value for SQL insertion"""
    if value is None:
        return 'NULL'
    elif isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    elif isinstance(value, (int, float)):
        return str(value)
    else:
        return f"'{clean_text(str(value))}'"

def process_csv_to_sql(csv_file: str, batch_size: int = 100) -> List[str]:
    """Process CSV file and generate SQL files for each batch"""
    
    sql_files = []
    
    with open(csv_file, 'r', encoding='utf-8') as file:
        # Read CSV
        csv_reader = csv.DictReader(file)
        rows = list(csv_reader)
        
        # Process in batches
        total_batches = (len(rows) + batch_size - 1) // batch_size
        
        for batch_num in range(total_batches):
            start_idx = batch_num * batch_size
            end_idx = min(start_idx + batch_size, len(rows))
            batch_rows = rows[start_idx:end_idx]
            
            # Generate SQL file for this batch
            sql_filename = f'google_forms_batch_{batch_num + 1}.sql'
            generate_sql_file(batch_rows, sql_filename, batch_num + 1, start_idx + 1, end_idx)
            sql_files.append(sql_filename)
    
    return sql_files

def generate_sql_file(rows: List[Dict], filename: str, batch_num: int, start_record: int, end_record: int):
    """Generate SQL file for a batch of records"""
    
    with open(filename, 'w', encoding='utf-8') as sql_file:
        # Write header
        sql_file.write(f"""-- Google Forms Data Batch {batch_num} (Records {start_record}-{end_record})
-- Teens Aloud Foundation Member Registration Data
-- Generated from Google Forms CSV export

BEGIN;

""")
        
        # Prepare member inserts
        member_inserts = []
        spouse_inserts = []
        children_inserts = []
        
        for i, row in enumerate(rows, start=start_record):
            # Process member data
            member_data = {
                'timestamp': parse_timestamp(row.get('Timestamp')),
                'full_name': clean_text(row.get('full_name')),
                'email': clean_text(row.get('email')),
                'second_email': clean_text(row.get('second_email')),
                'active_email': clean_text(row.get('active_email')),
                'year_of_completion': clean_text(row.get('year_of_completion')),
                'date_of_birth': parse_date(row.get('date_of_birth')),
                'active_phone_number': clean_text(row.get('active_phone_number')),
                'other_phone_number': clean_text(row.get('other_phone_number')),
                'currently_employed': parse_boolean(row.get('currently_employed', '')),
                'current_address': clean_text(row.get('current_address')),
                'relationship_status': clean_text(row.get('relationship_status')),
                'has_children': parse_boolean(row.get('has_children', '')),
                'number_of_children': clean_text(row.get('number_of _children')),
                'gender': clean_text(row.get('gender')),
                'nationality': clean_text(row.get('nationality')),
                'postgrad_year_of_completion': clean_text(row.get('postgrad_year_of_completion')),
                'completed_tertiary': parse_boolean(row.get('completed_tertiary', '')),
                'tertiary_institution_name': clean_text(row.get('tertiary_institution_name')),
                'current_employer': clean_text(row.get('prefered_work_industry')),  # Using as current employer
                'prefered_work_industry': clean_text(row.get('prefered_work_industry')),
                'area_of_work': clean_text(row.get('area_of_work')),
                'on_associate_whatsapp': parse_boolean(row.get('on_associate_whatsapp', ''))
            }
            
            # Create member insert
            values = [
                escape_sql_value(member_data['timestamp']),
                escape_sql_value(member_data['full_name']),
                escape_sql_value(member_data['email']),
                escape_sql_value(member_data['second_email']),
                escape_sql_value(member_data['active_email']),
                escape_sql_value(member_data['year_of_completion']),
                f"safe_parse_date('{member_data['date_of_birth']}')" if member_data['date_of_birth'] else 'NULL',
                escape_sql_value(member_data['active_phone_number']),
                escape_sql_value(member_data['other_phone_number']),
                escape_sql_value(member_data['currently_employed']),
                escape_sql_value(member_data['current_address']),
                escape_sql_value(member_data['relationship_status']),
                escape_sql_value(member_data['has_children']),
                escape_sql_value(member_data['number_of_children']),
                escape_sql_value(member_data['gender']),
                escape_sql_value(member_data['nationality']),
                escape_sql_value(member_data['postgrad_year_of_completion']),
                escape_sql_value(member_data['completed_tertiary']),
                escape_sql_value(member_data['tertiary_institution_name']),
                escape_sql_value(member_data['current_employer']),
                escape_sql_value(member_data['prefered_work_industry']),
                escape_sql_value(member_data['area_of_work']),
                escape_sql_value(member_data['on_associate_whatsapp'])
            ]
            
            member_insert = f"    ({', '.join(values)})"
            member_inserts.append(f"-- Record {i}: {member_data['full_name']}\n    {member_insert}")
            
            # Process spouse data if married
            if member_data['relationship_status'] == 'Married':
                spouse_name = clean_text(row.get('full_name_of_spouse'))
                spouse_dob = parse_date(row.get('spouse_date_of_birth'))
                marriage_date = parse_date(row.get('marriage_anniversary_date'))
                
                if spouse_name:
                    spouse_insert = f"""
-- Spouse for {member_data['full_name']}
INSERT INTO member_spouses (member_id, full_name, date_of_birth, marriage_anniversary_date)
SELECT id, {escape_sql_value(spouse_name)}, 
       {f"safe_parse_date('{spouse_dob}')" if spouse_dob else 'NULL'}, 
       {f"safe_parse_date('{marriage_date}')" if marriage_date else 'NULL'}
FROM members WHERE full_name = {escape_sql_value(member_data['full_name'])} 
AND email = {escape_sql_value(member_data['email']) if member_data['email'] else 'NULL'};"""
                    spouse_inserts.append(spouse_insert)
            
            # Process children data
            if member_data['has_children']:
                children_data = []
                
                # Check for children in various fields
                for child_num in range(1, 6):  # Up to 5 children
                    child_name = None
                    child_dob = None
                    
                    # Try different field naming patterns
                    if child_num == 1:
                        child_name = clean_text(row.get('first_child_name') or row.get('full_name_of_first_child'))
                        child_dob = parse_date(row.get('dob_first_child') or row.get('DoB_of_first_child'))
                    elif child_num == 2:
                        child_name = clean_text(row.get('full_name_of_second_child'))
                        child_dob = parse_date(row.get('dob_second_child') or row.get('DoB_of_second_child'))
                    elif child_num == 3:
                        child_name = clean_text(row.get('full_name_of_third_child'))
                        child_dob = parse_date(row.get('dob_3_child') or row.get('dob_third_child') or row.get('DoB_of_third_child'))
                    elif child_num == 4:
                        child_name = clean_text(row.get('full_name_of_fourth_child'))
                        child_dob = parse_date(row.get('DoB_of_fourth_child'))
                    elif child_num == 5:
                        child_dob = parse_date(row.get('dob_fifth_child') or row.get('DoB_of_fifth_child'))
                    
                    if child_name or child_dob:
                        children_data.append((child_name, child_dob, child_num))
                
                if children_data:
                    for child_name, child_dob, child_order in children_data:
                        child_insert = f"""
-- Child {child_order} for {member_data['full_name']}
INSERT INTO member_children (member_id, full_name, date_of_birth, child_order)
SELECT id, {escape_sql_value(child_name)}, 
       {f"safe_parse_date('{child_dob}')" if child_dob else 'NULL'}, 
       {child_order}
FROM members WHERE full_name = {escape_sql_value(member_data['full_name'])} 
AND email = {escape_sql_value(member_data['email']) if member_data['email'] else 'NULL'};"""
                        children_inserts.append(child_insert)
        
        # Write member inserts
        sql_file.write("""-- Insert Members
INSERT INTO members (
    timestamp, full_name, email, second_email, active_email,
    year_of_completion, date_of_birth, active_phone_number, other_phone_number,
    currently_employed, current_address, relationship_status,
    has_children, number_of_children, gender, nationality,
    postgrad_year_of_completion, completed_tertiary,
    tertiary_institution_name, current_employer, prefered_work_industry, 
    area_of_work, on_associate_whatsapp
) VALUES\n""")
        
        sql_file.write(',\n'.join(member_inserts))
        sql_file.write(';\n\n')
        
        # Write spouse inserts
        if spouse_inserts:
            sql_file.write('-- Insert Spouses\n')
            sql_file.write('\n'.join(spouse_inserts))
            sql_file.write('\n\n')
        
        # Write children inserts
        if children_inserts:
            sql_file.write('-- Insert Children\n')
            sql_file.write('\n'.join(children_inserts))
            sql_file.write('\n\n')
        
        # Write verification queries
        sql_file.write("""COMMIT;

-- Verification queries for this batch
SELECT 
    COUNT(*) as members_in_batch,
    COUNT(CASE WHEN relationship_status = 'Married' THEN 1 END) as married_count,
    COUNT(CASE WHEN has_children = TRUE THEN 1 END) as with_children_count
FROM members 
WHERE timestamp >= (SELECT MIN(timestamp) FROM members WHERE timestamp IS NOT NULL)
ORDER BY timestamp DESC
LIMIT """ + str(len(rows)) + """;

-- Overall statistics
SELECT 
    'Total Import Status' as status,
    COUNT(*) as total_members,
    (SELECT COUNT(*) FROM member_spouses) as total_spouses,
    (SELECT COUNT(*) FROM member_children) as total_children
FROM members;
""")

if __name__ == "__main__":
    # Generate SQL files from CSV
    csv_file = "Data.csv"
    sql_files = process_csv_to_sql(csv_file, batch_size=100)
    
    print(f"Generated {len(sql_files)} SQL batch files:")
    for filename in sql_files:
        print(f"  - {filename}")
    
    print("\nTo import the data:")
    print("1. First run: google_forms_schema.sql")
    for i, filename in enumerate(sql_files, 1):
        print(f"{i+1}. Then run: {filename}")
