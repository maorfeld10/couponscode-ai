import React, { useState, useEffect, createContext, useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getAdminUserByEmail } from '../../services/supabaseService';
import { AdminUser } from '../../types/database';
import { Loader2, ShieldAlert } from 'lucide-react';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setAuthenticated(false);
          setAdminUser(null);
          setLoading(false);
          return;
        }

        setAuthenticated(true);
        const email = session.user.email;
        if (email) {
          const adminData = await getAdminUserByEmail(email);
          if (adminData && adminData.status === 'active') {
            setAdminUser(adminData);
          } else {
            setAdminUser(null);
          }
        }
      } catch (error) {
        console.error('Error checking admin auth:', error);
        setAdminUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuthenticated(false);
        setAdminUser(null);
      } else {
        checkAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-sky-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Verifying administrative access...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your account does not have administrative privileges or has been deactivated. 
            Please contact the system administrator if you believe this is an error.
          </p>
          <button 
            onClick={signOut}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-black hover:bg-gray-800 transition-all shadow-lg"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ adminUser, loading, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
