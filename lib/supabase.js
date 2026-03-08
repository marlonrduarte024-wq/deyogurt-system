import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tuzsfvtopdynerebfuas.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1enNmdnRvcGR5bmVyZWJmdWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODkyNDUsImV4cCI6MjA4ODQ2NTI0NX0.Yj_pYRhkGGzvd6alPHHM3seanG2-h-1uzGoZOj68r3A'

export const supabase = createClient(supabaseUrl, supabaseKey)