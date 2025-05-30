import { Link } from 'react-router-dom'
import { useComplaints } from '../../hooks/useComplaints'
import { useUser } from '../../contexts/UserContext'
import { ROLES } from '../../lib/supabaseClient'

const MoodEmoji = ({ mood }) => {
  const emojis = {
    disappointed: '😞',
    angry: '😠',
    sad: '😢',
    hurt: '💔',
    annoyed: '😤',
  }
  return emojis[mood] || '😐'
}

const StatusBadge = ({ status }) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    upheld: 'bg-green-100 text-green-800',
    resolved: 'bg-blue-100 text-blue-800',
    ok: 'bg-gray-100 text-gray-800',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export const ComplaintFeed = () => {
  const { complaints, loading, error, escalateComplaint, resolveComplaint } = useComplaints()
  const { profile } = useUser()

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="w-8 h-8 border-4 border-romance-300 border-t-romance-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Error loading complaints: {error}
      </div>
    )
  }

  if (!complaints.length) {
    return (
      <div className="text-center text-gray-500">
        No complaints yet. All is well in paradise! 🌸
      </div>
    )
  }

  const handleEscalate = async (id) => {
    try {
      await escalateComplaint(id)
    } catch (error) {
      console.error('Error escalating complaint:', error)
    }
  }

  const handleResolve = async (id) => {
    try {
      await resolveComplaint(id)
    } catch (error) {
      console.error('Error resolving complaint:', error)
    }
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <div
          key={complaint.complaint_id}
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link
                to={`/complaints/${complaint.complaint_id}`}
                className="text-lg font-medium text-gray-900 hover:text-romance-600"
              >
                {complaint.title}
              </Link>
              <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                <MoodEmoji mood={complaint.mood} />
                <span>•</span>
                <span>By {complaint.created_by.name}</span>
                <span>•</span>
                <StatusBadge status={complaint.status} />
              </div>
            </div>
            {profile?.role === ROLES.GIRLFRIEND && !complaint.resolved && (
              <div className="ml-4 flex items-center space-x-2">
                {!complaint.escalated && (
                  <button
                    onClick={() => handleEscalate(complaint.complaint_id)}
                    className="text-yellow-600 hover:text-yellow-700"
                    title="Escalate"
                  >
                    ⚡
                  </button>
                )}
                <button
                  onClick={() => handleResolve(complaint.complaint_id)}
                  className="text-green-600 hover:text-green-700"
                  title="Resolve"
                >
                  ✅
                </button>
              </div>
            )}
          </div>
          <p className="mt-2 text-gray-600">{complaint.description}</p>
          {complaint.replies?.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              {complaint.replies.length} {complaint.replies.length === 1 ? 'reply' : 'replies'}
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 