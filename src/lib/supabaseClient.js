import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const ROLES = {
  BOYFRIEND: 'boyfriend',
  GIRLFRIEND: 'girlfriend'
}

export const getCurrentUserRole = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const { data, error } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  if (error) throw error
  return data?.role
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 