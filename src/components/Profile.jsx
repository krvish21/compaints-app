import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase, getCurrentUserRole, ROLES } from '../lib/supabase'

export default function Profile() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const role = await getCurrentUserRole()
        setUserRole(role)

        // Fetch complaints stats
        const { data: complaints, error: complaintsError } = await supabase
          .from('complaints')
          .select('*')

        if (complaintsError) throw complaintsError

        // Fetch compensations stats
        const { data: compensations, error: compensationsError } = await supabase
          .from('compensations')
          .select('*')

        if (compensationsError) throw compensationsError

        // Calculate stats
        const totalComplaints = complaints.length
        const resolvedComplaints = complaints.filter(c => c.resolved).length
        const escalatedComplaints = complaints.filter(c => c.escalated).length
        const totalCompensations = compensations.length

        setStats({
          totalComplaints,
          resolvedComplaints,
          escalatedComplaints,
          totalCompensations,
          resolutionRate: totalComplaints ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

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
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-romance-100 rounded-full p-4">
            <span className="text-3xl" role="img" aria-label="profile">
              {userRole === ROLES.GIRLFRIEND ? '👑' : '🤴'}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-muted-900">
              {userRole === ROLES.GIRLFRIEND ? 'Queen' : 'King'}
            </h2>
            <p className="text-muted-600">
              {userRole === ROLES.GIRLFRIEND ? 'The one who rules with love' : 'The one who serves with devotion'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-romance-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-muted-800 mb-4">Complaints Stats</h3>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-muted-600">Total Complaints</dt>
                <dd className="font-medium text-muted-900">{stats.totalComplaints}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-600">Resolved</dt>
                <dd className="font-medium text-green-600">{stats.resolvedComplaints}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-600">Escalated</dt>
                <dd className="font-medium text-red-600">{stats.escalatedComplaints}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-600">Resolution Rate</dt>
                <dd className="font-medium text-romance-600">{stats.resolutionRate}%</dd>
              </div>
            </dl>
          </div>

          <div className="bg-romance-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-muted-800 mb-4">Compensation Stats</h3>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-muted-600">Available Compensations</dt>
                <dd className="font-medium text-muted-900">{stats.totalCompensations}</dd>
              </div>
              {userRole === ROLES.GIRLFRIEND && (
                <div className="mt-4">
                  <p className="text-sm text-muted-600">
                    As the queen, you have full control over the compensation pool.
                    Add or remove items as you see fit! 👑
                  </p>
                </div>
              )}
              {userRole === ROLES.BOYFRIEND && (
                <div className="mt-4">
                  <p className="text-sm text-muted-600">
                    Choose your compensations wisely, dear king.
                    Your queen's happiness depends on it! 🎯
                  </p>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-500">
        <p>Made with love, for love 💝</p>
      </div>
    </div>
  )
} 