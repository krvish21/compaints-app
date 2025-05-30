import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get current user role (boyfriend/girlfriend)
export const getCurrentUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  return data?.role
}

// Constants for user roles
export const ROLES = {
  BOYFRIEND: 'boyfriend',
  GIRLFRIEND: 'girlfriend'
} 