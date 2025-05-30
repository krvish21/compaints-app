import type { ReactNode } from 'react';
import { useUser } from '../contexts/UserContext';

export function Layout({ children }: { children: ReactNode }) {
  const { currentUser, setCurrentUser } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-primary-600">
              Love & Complaints
            </h1>
            <div className="flex items-center space-x-4">
              <label htmlFor="user-switch" className="text-gray-600">
                Current User:
              </label>
              <select
                id="user-switch"
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value as 'Vish' | 'Sabaa')}
                className="input py-1"
              >
                <option value="Sabaa">Sabaa</option>
                <option value="Vish">Vish</option>
              </select>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
} 