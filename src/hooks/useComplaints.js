import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useUser } from '../contexts/UserContext'

export const useComplaints = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, profile } = useUser()

  useEffect(() => {
    if (!user) return

    const fetchComplaints = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('complaints')
          .select(`
            *,
            created_by:user_profiles!complaints_created_by_fkey (
              name,
              role
            ),
            replies (
              *,
              user:user_profiles!replies_user_id_fkey (
                name,
                role
              )
            ),
            offered_compensations (
              *,
              compensation:compensations (
                title,
                description
              )
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        setComplaints(data || [])
      } catch (err) {
        console.error('Error fetching complaints:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchComplaints()

    // Subscribe to changes
    const subscription = supabase
      .channel('complaints_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'complaints' 
        }, 
        () => {
          fetchComplaints()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const createComplaint = async ({ title, description, mood }) => {
    try {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('complaints')
        .insert([
          {
            title,
            description,
            mood,
            created_by: user.id,
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error creating complaint:', err)
      throw err
    }
  }

  const updateComplaint = async (id, updates) => {
    try {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('complaints')
        .update(updates)
        .eq('complaint_id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error updating complaint:', err)
      throw err
    }
  }

  const escalateComplaint = async (id) => {
    if (profile?.role !== 'girlfriend') {
      throw new Error('Only girlfriends can escalate complaints')
    }
    return updateComplaint(id, { 
      escalated: true,
      escalated_by: user.id,
      escalated_at: new Date().toISOString()
    })
  }

  const resolveComplaint = async (id) => {
    if (profile?.role !== 'girlfriend') {
      throw new Error('Only girlfriends can resolve complaints')
    }
    return updateComplaint(id, { 
      resolved: true,
      status: 'resolved'
    })
  }

  return {
    complaints,
    loading,
    error,
    createComplaint,
    updateComplaint,
    escalateComplaint,
    resolveComplaint,
  }
} 