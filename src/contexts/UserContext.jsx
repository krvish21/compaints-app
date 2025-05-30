import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ROLES } from '../lib/supabaseClient'

const UserContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  setUser: () => {},
  isVishu: false,
  isSabaa: false,
})

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSetUser = async (name) => {
    try {
      // For demo purposes, we'll create or update the user profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('name', name)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (!existingProfile) {
        const { data, error } = await supabase
          .from('user_profiles')
          .insert([
            {
              user_id: crypto.randomUUID(),
              name,
              role: name === 'Sabaa' ? ROLES.GIRLFRIEND : ROLES.BOYFRIEND,
            },
          ])
          .select()
          .single()

        if (error) throw error
        setProfile(data)
      } else {
        setProfile(existingProfile)
      }
    } catch (error) {
      console.error('Error setting user:', error)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signOut,
    setUser: handleSetUser,
    isVishu: profile?.name === 'Vishu',
    isSabaa: profile?.name === 'Sabaa',
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
} 