import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { supabase, getCurrentUserRole, ROLES } from '../lib/supabase'

const REACTIONS = ['❤️', '😢', '😡', '🤗', '🙏', '💝']

function ScratchCard({ compensation, onSelect, isSelected }) {
  const [isScratched, setIsScratched] = useState(false)

  const handleScratch = async () => {
    if (isScratched) return
    
    try {
      const { error } = await supabase
        .from('offered_compensations')
        .update({ scratched: true })
        .eq('id', compensation.id)

      if (error) throw error
      setIsScratched(true)
    } catch (error) {
      console.error('Error updating scratch status:', error)
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-lg shadow-md ${
        isSelected ? 'ring-2 ring-romance-500' : ''
      }`}
    >
      <div className="bg-white p-4">
        <h4 className="font-medium text-muted-900">{compensation.title}</h4>
        <p className="text-sm text-muted-600 mt-1">{compensation.description}</p>
      </div>

      {!isScratched && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-romance-400 to-romance-600 cursor-pointer"
          onClick={handleScratch}
          whileHover={{ opacity: 0.9 }}
        >
          <div className="flex items-center justify-center h-full text-white">
            <span className="text-lg">Scratch to reveal! ✨</span>
          </div>
        </motion.div>
      )}

      {isScratched && !isSelected && (
        <button
          onClick={() => onSelect(compensation.id)}
          className="absolute bottom-0 left-0 right-0 bg-romance-500 text-white py-2 text-sm font-medium hover:bg-romance-600 transition-colors"
        >
          Choose this compensation
        </button>
      )}
    </motion.div>
  )
}

function Reply({ reply, onReact }) {
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const checkUser = async () => {
      const role = await getCurrentUserRole()
      setUserRole(role)
    }
    checkUser()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-sm p-4 mb-4"
    >
      <p className="text-muted-800">{reply.text}</p>
      
      <div className="mt-3 flex items-center justify-between">
        <div className="flex space-x-2">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact(reply.id, emoji)}
              className="p-1.5 hover:bg-romance-100 rounded-full transition-colors"
            >
              <span role="img" aria-label={`react with ${emoji}`}>
                {emoji}
              </span>
            </button>
          ))}
        </div>
        <time className="text-sm text-muted-500">
          {format(new Date(reply.created_at), 'MMM d, yyyy')}
        </time>
      </div>

      {reply.reactions?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {reply.reactions.map((reaction) => (
            <span
              key={`${reaction.emoji}-${reaction.user_id}`}
              className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-muted-100"
            >
              {reaction.emoji}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function ComplaintDetail() {
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null)
  const [replies, setReplies] = useState([])
  const [compensations, setCompensations] = useState([])
  const [selectedCompensation, setSelectedCompensation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [newReply, setNewReply] = useState('')

  useEffect(() => {
    const fetchComplaintDetails = async () => {
      try {
        // Fetch complaint
        const { data: complaintData, error: complaintError } = await supabase
          .from('complaints')
          .select('*')
          .eq('id', id)
          .single()

        if (complaintError) throw complaintError
        setComplaint(complaintData)

        // Fetch replies with reactions
        const { data: repliesData, error: repliesError } = await supabase
          .from('replies')
          .select(`
            *,
            reactions (*)
          `)
          .eq('complaint_id', id)
          .order('created_at', { ascending: true })

        if (repliesError) throw repliesError
        setReplies(repliesData)

        // Fetch offered compensations
        const { data: compensationsData, error: compensationsError } = await supabase
          .from('offered_compensations')
          .select(`
            *,
            compensation:compensations (*)
          `)
          .eq('complaint_id', id)

        if (compensationsError) throw compensationsError
        setCompensations(compensationsData)

        const role = await getCurrentUserRole()
        setUserRole(role)
      } catch (error) {
        console.error('Error fetching complaint details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComplaintDetails()
  }, [id])

  const handleSubmitReply = async (e) => {
    e.preventDefault()
    if (!newReply.trim()) return

    try {
      const { data, error } = await supabase
        .from('replies')
        .insert([{
          complaint_id: id,
          text: newReply,
        }])
        .select()

      if (error) throw error

      setReplies([...replies, data[0]])
      setNewReply('')
    } catch (error) {
      console.error('Error submitting reply:', error)
    }
  }

  const handleReact = async (replyId, emoji) => {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .upsert([{
          reply_id: replyId,
          emoji,
        }])
        .select()

      if (error) throw error

      // Update local state
      setReplies(replies.map(reply => {
        if (reply.id === replyId) {
          return {
            ...reply,
            reactions: [...(reply.reactions || []), data[0]]
          }
        }
        return reply
      }))
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  const handleSelectCompensation = async (compensationId) => {
    try {
      // Update all compensations to not selected
      await supabase
        .from('offered_compensations')
        .update({ selected: false })
        .eq('complaint_id', id)

      // Set the chosen one as selected
      const { error } = await supabase
        .from('offered_compensations')
        .update({ selected: true })
        .eq('id', compensationId)

      if (error) throw error

      setSelectedCompensation(compensationId)
    } catch (error) {
      console.error('Error selecting compensation:', error)
    }
  }

  const handleEscalate = async () => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ escalated: true })
        .eq('id', id)

      if (error) throw error
      setComplaint({ ...complaint, escalated: true })
    } catch (error) {
      console.error('Error escalating complaint:', error)
    }
  }

  const handleResolve = async () => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ resolved: true, escalated: false })
        .eq('id', id)

      if (error) throw error
      setComplaint({ ...complaint, resolved: true, escalated: false })
    } catch (error) {
      console.error('Error resolving complaint:', error)
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
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-semibold text-muted-900">{complaint.title}</h1>
          <span className="text-3xl" role="img" aria-label={complaint.mood}>
            {complaint.mood}
          </span>
        </div>

        <p className="text-muted-700 mb-6">{complaint.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {userRole === ROLES.GIRLFRIEND && !complaint.resolved && (
              <>
                <button
                  onClick={handleEscalate}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    complaint.escalated
                      ? 'bg-red-100 text-red-800'
                      : 'bg-muted-100 text-muted-700 hover:bg-muted-200'
                  }`}
                >
                  {complaint.escalated ? 'Escalated 🔥' : 'Escalate 😤'}
                </button>
                {selectedCompensation && (
                  <button
                    onClick={handleResolve}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200"
                  >
                    Resolve 💖
                  </button>
                )}
              </>
            )}
          </div>
          <time className="text-sm text-muted-500">
            {format(new Date(complaint.created_at), 'MMM d, yyyy')}
          </time>
        </div>
      </div>

      {userRole === ROLES.BOYFRIEND && !complaint.resolved && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-muted-800 mb-4">Offer Compensations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {compensations.map((comp) => (
              <ScratchCard
                key={comp.id}
                compensation={comp.compensation}
                onSelect={handleSelectCompensation}
                isSelected={selectedCompensation === comp.id}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-lg font-medium text-muted-800">Replies</h3>
        
        <form onSubmit={handleSubmitReply} className="mb-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 rounded-md border-muted-300 shadow-sm focus:border-romance-500 focus:ring-romance-500"
            />
            <button
              type="submit"
              disabled={!newReply.trim()}
              className="px-4 py-2 bg-romance-600 text-white rounded-md hover:bg-romance-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-romance-500 disabled:opacity-50"
            >
              Reply
            </button>
          </div>
        </form>

        <AnimatePresence>
          {replies.map((reply) => (
            <Reply
              key={reply.id}
              reply={reply}
              onReact={handleReact}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
} 