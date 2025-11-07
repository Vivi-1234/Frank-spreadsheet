import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xqlzhvfqibkgdgcycnel.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxbHpodmZxaWJrZ2RnY3ljbmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMjIwMTQsImV4cCI6MjA2NjY5ODAxNH0.CcYZW2TixQQS5TkJ4zr4CGLBEZKx7MGtI4cFg1H2tc0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

