import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { supabase, type Compensation } from '../lib/supabase';

export function CompensationsList() {
  const { currentUser } = useUser();
  const [compensations, setCompensations] = useState<Compensation[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCompensation, setNewCompensation] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchCompensations();
  }, []);

  async function fetchCompensations() {
    const { data, error } = await supabase
      .from('compensations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching compensations:', error);
      return;
    }

    setCompensations(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (currentUser !== 'Sabaa') {
      alert('Only Sabaa can create compensations!');
      return;
    }

    const { error } = await supabase.from('compensations').insert([
      {
        title: newCompensation.title,
        description: newCompensation.description,
        created_by: 'Sabaa',
      },
    ]);

    if (error) {
      console.error('Error creating compensation:', error);
      return;
    }

    setNewCompensation({ title: '', description: '' });
    setIsCreating(false);
    fetchCompensations();
  }

  async function handleDelete(id: number) {
    if (currentUser !== 'Sabaa') {
      alert('Only Sabaa can delete compensations!');
      return;
    }

    const { error } = await supabase.from('compensations').delete().eq('id', id);

    if (error) {
      console.error('Error deleting compensation:', error);
      return;
    }

    fetchCompensations();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Compensations</h2>
        {currentUser === 'Sabaa' && (
          <button onClick={() => setIsCreating(true)} className="btn-primary">
            New Compensation
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
              Title
            </label>
            <input
              type="text"
              value={newCompensation.title}
              onChange={(e) =>
                setNewCompensation((prev) => ({ ...prev, title: e.target.value }))
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
              value={newCompensation.description}
              onChange={(e) =>
                setNewCompensation((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {compensations.map((compensation) => (
          <motion.div
            key={compensation.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
          >
            <div className="flex justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {compensation.title}
                </h3>
                <p className="text-gray-600">{compensation.description}</p>
              </div>
              {currentUser === 'Sabaa' && (
                <button
                  onClick={() => handleDelete(compensation.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 