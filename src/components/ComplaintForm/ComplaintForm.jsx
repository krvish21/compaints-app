import { useState } from 'react'
import { useComplaints } from '../../hooks/useComplaints'

export const ComplaintForm = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mood, setMood] = useState('disappointed')
  const [submitting, setSubmitting] = useState(false)
  const { createComplaint } = useComplaints()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await createComplaint({ title, description, mood })
      setTitle('')
      setDescription('')
      setMood('disappointed')
    } catch (error) {
      console.error('Error creating complaint:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-romance-500 focus:ring-romance-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-romance-500 focus:ring-romance-500"
          required
        />
      </div>

      <div>
        <label htmlFor="mood" className="block text-sm font-medium text-gray-700">
          Mood
        </label>
        <select
          id="mood"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-romance-500 focus:ring-romance-500"
        >
          <option value="disappointed">Disappointed 😞</option>
          <option value="angry">Angry 😠</option>
          <option value="sad">Sad 😢</option>
          <option value="hurt">Hurt 💔</option>
          <option value="annoyed">Annoyed 😤</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-romance-600 hover:bg-romance-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-romance-500 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Complaint'}
      </button>
    </form>
  )
} 