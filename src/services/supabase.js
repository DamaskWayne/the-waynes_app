import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uphcnbjehmckcjwxmhyh.supabase.co'
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaGNuYmplaG1ja2Nqd3htaHloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyMjIyNTMsImV4cCI6MjA0NTc5ODI1M30.xy6I9NYw6WaUlX48LNYDSpOkoPYFRnVJBa_kQsD3faU'

const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY)
export default supabase