import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { supabase, getCurrentUserRole, ROLES } from '../lib/supabase'

function CompensationForm({ onSubmit }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      await onSubmit({ title, description })
      setTitle('')
      setDescription('')
    } catch (error) {
      console.error('Error submitting compensation:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-2xl font-semibold text-muted-800 mb-4">New Compensation</h2>
      
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-muted-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-muted-300 shadow-sm focus:border-romance-500 focus:ring-romance-500"
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-muted-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-muted-300 shadow-sm focus:border-romance-500 focus:ring-romance-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-romance-600 hover:bg-romance-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-romance-500 ${
          submitting ? 'opacity-75 cursor-not-allowed' : ''
        }`}
      >
        {submitting ? 'Adding...' : 'Add Compensation'}
      </button>
    </form>
  )
}

function CompensationCard({ compensation, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-sm p-6 mb-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-muted-900">{compensation.title}</h3>
          <p className="mt-1 text-muted-600">{compensation.description}</p>
          <time className="text-sm text-muted-500">
            {format(new Date(compensation.created_at), 'MMM d, yyyy')}
          </time>
        </div>
        <button
          onClick={() => onDelete(compensation.id)}
          className="text-muted-400 hover:text-red-500 transition-colors"
        >
          <span className="sr-only">Delete</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

export default function Compensations() {
  const [compensations, setCompensations] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const fetchCompensations = async () => {
      try {
        const { data, error } = await supabase
          .from('compensations')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setCompensations(data)
      } catch (error) {
        console.error('Error fetching compensations:', error)
      } finally {
        setLoading(false)
      }
    }

    const checkUser = async () => {
      const role = await getCurrentUserRole()
      setUserRole(role)
    }

    fetchCompensations()
    checkUser()
  }, [])

  const handleSubmitCompensation = async (compensationData) => {
    try {
      const { data, error } = await supabase
        .from('compensations')
        .insert([compensationData])
        .select()

      if (error) throw error
      setCompensations([data[0], ...compensations])
    } catch (error) {
      console.error('Error creating compensation:', error)
      throw error
    }
  }

  const handleDeleteCompensation = async (id) => {
    try {
      const { error } = await supabase
        .from('compensations')
        .delete()
        .eq('id', id)

      if (error) throw error
      setCompensations(compensations.filter(comp => comp.id !== id))
    } catch (error) {
      console.error('Error deleting compensation:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-romance-300 border-t-romance-500 rounded-full"
        />
      </div>
    )
  }

  if (userRole !== ROLES.GIRLFRIEND) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-medium text-muted-900 mb-2">Access Denied</h2>
        <p className="text-muted-600">Only the queen can manage compensations 👑</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <CompensationForm onSubmit={handleSubmitCompensation} />
      
      <div className="space-y-4">
        <AnimatePresence>
          {compensations.map((compensation) => (
            <CompensationCard
              key={compensation.id}
              compensation={compensation}
              onDelete={handleDeleteCompensation}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
} 