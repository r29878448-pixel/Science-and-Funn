import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { onAuthChange, isAdmin, ADMIN_EMAIL } from '../src/services/authService';
import AdminDashboard from '../src/components/AdminDashboard';

const AdminPage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Access denied
  if (!loading && (!currentUser || !isAdmin(currentUser.email))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-6">🚫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-2">
            This admin panel is restricted to authorized personnel only.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Only <span className="font-mono bg-gray-200 px-2 py-1 rounded">{ADMIN_EMAIL}</span> can access this page.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show advanced admin dashboard
  return <AdminDashboard />;
};

export default AdminPage;
