import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { supabase, type Complaint, type Reply, type Reaction } from '../lib/supabase';
import { OfferedCompensations } from './OfferedCompensations';

interface ComplaintDetailsProps {
  complaint: Complaint;
  onClose: () => void;
}

export function ComplaintDetails({ complaint, onClose }: ComplaintDetailsProps) {
  const { currentUser } = useUser();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [newReply, setNewReply] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('❤️');

  useEffect(() => {
    fetchRepliesAndReactions();
  }, [complaint.id]);

  async function fetchRepliesAndReactions() {
    const [repliesResponse, reactionsResponse] = await Promise.all([
      supabase
        .from('replies')
        .select('*')
        .eq('complaint_id', complaint.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('reactions')
        .select('*')
        .in(
          'reply_id',
          replies.map((r) => r.id)
        ),
    ]);

    if (repliesResponse.error) {
      console.error('Error fetching replies:', repliesResponse.error);
      return;
    }

    if (reactionsResponse.error) {
      console.error('Error fetching reactions:', reactionsResponse.error);
      return;
    }

    setReplies(repliesResponse.data || []);
    setReactions(reactionsResponse.data || []);
  }

  async function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from('replies').insert([
      {
        complaint_id: complaint.id,
        user_name: currentUser,
        text: newReply,
      },
    ]);

    if (error) {
      console.error('Error creating reply:', error);
      return;
    }

    setNewReply('');
    fetchRepliesAndReactions();
  }

  async function handleReaction(replyId: number) {
    const existingReaction = reactions.find(
      (r) => r.reply_id === replyId && r.user_name === currentUser
    );

    if (existingReaction) {
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (error) {
        console.error('Error removing reaction:', error);
        return;
      }
    } else {
      const { error } = await supabase.from('reactions').insert([
        {
          reply_id: replyId,
          user_name: currentUser,
          emoji: selectedEmoji,
        },
      ]);

      if (error) {
        console.error('Error adding reaction:', error);
        return;
      }
    }

    fetchRepliesAndReactions();
  }

  async function handleEscalate() {
    if (currentUser !== 'Sabaa') {
      alert('Only Sabaa can escalate complaints!');
      return;
    }

    const { error } = await supabase
      .from('complaints')
      .update({ escalated: !complaint.escalated })
      .eq('id', complaint.id);

    if (error) {
      console.error('Error updating complaint:', error);
      return;
    }

    complaint.escalated = !complaint.escalated;
  }

  async function handleResolve() {
    if (currentUser !== 'Sabaa') {
      alert('Only Sabaa can resolve complaints!');
      return;
    }

    const { error } = await supabase
      .from('complaints')
      .update({ resolved: true })
      .eq('id', complaint.id);

    if (error) {
      console.error('Error updating complaint:', error);
      return;
    }

    complaint.resolved = true;
  }

  const emojiOptions = ['❤️', '👍', '😊', '🙏', '🌟'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{complaint.mood}</span>
                <h2 className="text-xl font-semibold text-gray-900">
                  {complaint.title}
                </h2>
              </div>
              <p className="mt-2 text-gray-600">{complaint.description}</p>
              <div className="mt-4 flex space-x-2">
                {currentUser === 'Sabaa' && !complaint.resolved && (
                  <>
                    <button
                      onClick={handleEscalate}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        complaint.escalated
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                    >
                      {complaint.escalated ? 'De-escalate' : 'Escalate'}
                    </button>
                    <button
                      onClick={handleResolve}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200"
                    >
                      Resolve
                    </button>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              ✕
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <OfferedCompensations
              complaintId={complaint.id}
              onCompensationSelected={fetchRepliesAndReactions}
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Discussion</h3>
            <div className="space-y-4">
              {replies.map((reply) => (
                <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">
                      {reply.user_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(reply.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{reply.text}</p>
                  <div className="mt-3 flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {emojiOptions.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setSelectedEmoji(emoji);
                            handleReaction(reply.id);
                          }}
                          className={`p-1 rounded hover:bg-gray-100 ${
                            reactions.some(
                              (r) =>
                                r.reply_id === reply.id &&
                                r.user_name === currentUser &&
                                r.emoji === emoji
                            )
                              ? 'bg-primary-100'
                              : ''
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">
                      {reactions
                        .filter((r) => r.reply_id === reply.id)
                        .map((r) => r.emoji)
                        .join(' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleReplySubmit} className="mt-6 space-y-3">
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Write a reply..."
                className="input"
                rows={3}
                required
              />
              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 