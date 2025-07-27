// Test Supabase connection and RLS policies
// Run this in browser console or create a test component

import { createBrowserClient } from './lib/supabase/client'

export async function testSupabaseConnection() {
  const supabase = createBrowserClient()
  
  console.log('Testing Supabase connection...')
  
  try {
    // Test 1: Check if we can connect
    console.log('1. Testing basic connection...')
    const { data: result, error: connectionError } = await supabase
      .from('associates')
      .select('count(*)')
      .single()
    
    if (connectionError) {
      console.error('Connection error:', connectionError)
      return false
    }
    
    console.log('✅ Connection successful, row count:', result)
    
    // Test 2: Try to fetch data
    console.log('2. Testing data fetch...')
    const { data: associates, error: fetchError } = await supabase
      .from('associates')
      .select('*')
      .limit(5)
    
    if (fetchError) {
      console.error('Fetch error:', fetchError)
      if (fetchError.message.includes('RLS') || fetchError.message.includes('policy')) {
        console.log('❌ This is an RLS (Row Level Security) policy issue')
        console.log('You need to run the fix-rls-policies.sql script in your Supabase SQL editor')
      }
      return false
    }
    
    console.log('✅ Data fetch successful:', associates)
    
    // Test 3: Try to insert data
    console.log('3. Testing data insert...')
    const testData = {
      email: 'test@example.com',
      full_name: 'Test User',
      tertiary_education: false,
      date_of_birth: '1990-01-01',
      gender: 'Male',
      nationality: 'Ghanaian',
      active_phone_number: '+233200000000',
      current_address: 'Test Address',
      on_whatsapp: false,
      relationship_status: 'Single'
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('associates')
      .insert([testData])
      .select()
    
    if (insertError) {
      console.error('Insert error:', insertError)
      if (insertError.message.includes('RLS') || insertError.message.includes('policy')) {
        console.log('❌ This is an RLS (Row Level Security) policy issue')
        console.log('You need to run the fix-rls-policies.sql script in your Supabase SQL editor')
      }
      return false
    }
    
    console.log('✅ Data insert successful:', insertData)
    
    // Clean up test data
    if (insertData && insertData.length > 0) {
      await supabase
        .from('associates')
        .delete()
        .eq('email', 'test@example.com')
    }
    
    return true
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return false
  }
}

// Usage: Call testSupabaseConnection() in browser console
console.log('Run testSupabaseConnection() to test your database')
