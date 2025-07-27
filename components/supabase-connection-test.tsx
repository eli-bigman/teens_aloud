/* Test Supabase connection directly */
import { createBrowserClient } from '@/lib/supabase/client'

async function testConnection() {
  const supabase = createBrowserClient()
  
  console.log('=== SUPABASE CONNECTION TEST ===')
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('associates')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('Supabase error:', error)
      return
    }
    
    console.log('SUCCESS: Fetched', data?.length, 'associates')
    console.log('Data:', data)
    
  } catch (err) {
    console.error('Connection failed:', err)
  }
}

// Auto-run test when component loads
if (typeof window !== 'undefined') {
  setTimeout(testConnection, 1000)
}

export default function SupabaseTest() {
  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px' }}>
      <h3>Supabase Connection Test</h3>
      <p>Check browser console for results...</p>
      <button onClick={testConnection}>Test Again</button>
    </div>
  )
}
