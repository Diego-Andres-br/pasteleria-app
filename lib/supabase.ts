import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
'https://edcbxbunmutgfxpnxxob.supabase.co',
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkY2J4YnVubXV0Z2Z4cG54eG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NTUxMjUsImV4cCI6MjA5NjMzMTEyNX0.1JjgEBsacXGyYhZ0q-oE3qwJUrk8LZ5GAFVspdtKTgU'  
)