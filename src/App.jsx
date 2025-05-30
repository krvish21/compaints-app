import React, { lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from './contexts/UserContext';
import { ROLES, getCurrentUserRole } from './lib/supabaseClient';
import './App.css';

// Lazy load components
const Complaints = lazy(() => import('./components/Complaints'));
const ComplaintDetail = lazy(() => import('./components/ComplaintDetail'));
const Compensations = lazy(() => import('./components/Compensations'));
const Profile = lazy(() => import('./components/Profile'));

const Header = () => {
  const { setUser, isVishu, isSabaa } = useUser();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Love Notes 💌</h1>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-pink-600"
                name="user"
                checked={isSabaa}
                onChange={() => setUser('Sabaa')}
              />
              <span className="ml-2">Sabaa</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="user"
                checked={isVishu}
                onChange={() => setUser('Vishu')}
              />
              <span className="ml-2">Vishu</span>
            </label>
          </div>
        </div>
      </div>
    </header>
  );
};

const MainContent = ({ children }) => (
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="space-y-6">{children}</div>
  </main>
);

function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const role = await getCurrentUserRole();
        setUserRole(role);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-romance-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-romance-300 border-t-romance-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-romance-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link
                  to="/"
                  className="flex items-center px-4 text-romance-600 hover:text-romance-500 font-medium"
                >
                  💝 Love Notes
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/complaints"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-600 hover:text-romance-500"
                  >
                    Complaints
                  </Link>
                  {userRole === ROLES.GIRLFRIEND && (
                    <Link
                      to="/compensations"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-600 hover:text-romance-500"
                    >
                      Compensations
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-600 hover:text-romance-500"
                  >
                    Profile
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-romance-100 text-romance-700">
                  {userRole === ROLES.GIRLFRIEND ? '👑 Queen' : '🤴 King'}
                </span>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <React.Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-4 border-romance-300 border-t-romance-500 rounded-full"
                />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Complaints />} />
              <Route path="/complaints" element={<Complaints />} />
              <Route path="/complaints/:id" element={<ComplaintDetail />} />
              {userRole === ROLES.GIRLFRIEND && (
                <Route path="/compensations" element={<Compensations />} />
              )}
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </React.Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
