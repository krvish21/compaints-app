import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { supabase, getCurrentUserRole, ROLES } from '../lib/supabase'

const MOODS = {
  angry: '😠',
  sad: '😢',
  disappointed: '😞',
  hurt: '💔',
  annoyed: '😤'
}

function ComplaintForm({ onSubmit }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mood, setMood] = useState('disappointed')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      await onSubmit({ title, description, mood })
      setTitle('')
      setDescription('')
      setMood('disappointed')
    } catch (error) {
      console.error('Error submitting complaint:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-2xl font-semibold text-muted-800 mb-4">New Complaint</h2>
      
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

      <div className="mb-4">
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

      <div className="mb-6">
        <label className="block text-sm font-medium text-muted-700 mb-2">
          Mood
        </label>
        <div className="flex space-x-4">
          {Object.entries(MOODS).map(([key, emoji]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMood(key)}
              className={`p-2 rounded-full transition-transform hover:scale-110 ${
                mood === key ? 'bg-romance-100 scale-110' : 'bg-muted-100'
              }`}
            >
              <span role="img" aria-label={key} className="text-2xl">
                {emoji}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-romance-600 hover:bg-romance-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-romance-500 ${
          submitting ? 'opacity-75 cursor-not-allowed' : ''
        }`}
      >
        {submitting ? 'Submitting...' : 'Submit Complaint'}
      </button>
    </form>
  )
}

function ComplaintCard({ complaint }) {
  const { title, description, mood, created_at, escalated, resolved } = complaint

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 mb-4"
    >
      <Link to={`/complaints/${complaint.id}`} className="block">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium text-muted-900">{title}</h3>
          <span className="text-2xl" role="img" aria-label={mood}>
            {MOODS[mood]}
          </span>
        </div>
        
        <p className="mt-2 text-muted-600">{description}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex space-x-2">
            {escalated && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Escalated 🔥
              </span>
            )}
            {resolved && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Resolved 💖
              </span>
            )}
          </div>
          <time className="text-sm text-muted-500">
            {format(new Date(created_at), 'MMM d, yyyy')}
          </time>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Complaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const { data, error } = await supabase
          .from('complaints')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setComplaints(data)
      } catch (error) {
        console.error('Error fetching complaints:', error)
      } finally {
        setLoading(false)
      }
    }

    const checkUser = async () => {
      const role = await getCurrentUserRole()
      setUserRole(role)
    }

    fetchComplaints()
    checkUser()
  }, [])

  const handleSubmitComplaint = async (complaintData) => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .insert([complaintData])
        .select()

      if (error) throw error

      setComplaints([data[0], ...complaints])
    } catch (error) {
      console.error('Error creating complaint:', error)
      throw error
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

  return (
    <div>
      <ComplaintForm onSubmit={handleSubmitComplaint} />
      
      <div className="space-y-4">
        <AnimatePresence>
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
} 