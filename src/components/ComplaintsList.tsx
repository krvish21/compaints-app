import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabase, type Complaint } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ComplaintDetails } from './ComplaintDetails';

export function ComplaintsList() {
  const { currentUser } = useUser();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    mood: '😔',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching complaints:', error);
      return;
    }

    setComplaints(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (currentUser !== 'Sabaa') {
      alert('Only Sabaa can create complaints!');
      return;
    }

    const { error } = await supabase.from('complaints').insert([
      {
        user_name: currentUser,
        title: newComplaint.title,
        description: newComplaint.description,
        mood: newComplaint.mood,
        escalated: false,
        resolved: false,
      },
    ]);

    if (error) {
      console.error('Error creating complaint:', error);
      return;
    }

    setNewComplaint({ title: '', description: '', mood: '😔' });
    setIsCreating(false);
    fetchComplaints();
  }

  const moodOptions = ['😔', '😢', '😡', '😤', '🥺'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Complaints</h2>
        {currentUser === 'Sabaa' && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary"
          >
            New Complaint
          </button>
        )}
      </div>

      {isCreating && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card space-y-4"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mood
            </label>
            <div className="flex space-x-2 mt-1">
              {moodOptions.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setNewComplaint(prev => ({ ...prev, mood }))}
                  className={`text-2xl p-2 rounded-full ${
                    newComplaint.mood === mood
                      ? 'bg-primary-100 ring-2 ring-primary-500'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={newComplaint.title}
              onChange={(e) =>
                setNewComplaint(prev => ({ ...prev, title: e.target.value }))
              }
              className="input mt-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={newComplaint.description}
              onChange={(e) =>
                setNewComplaint(prev => ({ ...prev, description: e.target.value }))
              }
              className="input mt-1"
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit
            </button>
          </div>
        </motion.form>
      )}

      <div className="space-y-4">
        {complaints.map((complaint) => (
          <motion.div
            key={complaint.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedComplaint(complaint)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{complaint.mood}</span>
                  <h3 className="text-lg font-medium text-gray-900">
                    {complaint.title}
                  </h3>
                </div>
                <p className="text-gray-600">{complaint.description}</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className="text-sm text-gray-500">
                  by {complaint.user_name}
                </span>
                {complaint.escalated && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Escalated
                  </span>
                )}
                {complaint.resolved && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Resolved
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedComplaint && (
          <ComplaintDetails
            complaint={selectedComplaint}
            onClose={() => setSelectedComplaint(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 