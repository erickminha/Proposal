import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUserOrganization(session.user.id);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserOrganization(session.user.id);
      } else {
        setOrganization(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserOrganization = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*, organizations(*)')
        .eq('id', userId)
        .single();
      
      if (data?.organizations) {
        setOrganization(data.organizations);
      }
    } catch (err) {
      console.error('Error fetching organization:', err);
    }
  };

  const addNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    if (duration) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    return { ok: !error, error };
  };

  const value = {
    user,
    organization,
    setOrganization,
    loading,
    notifications,
    addNotification,
    logout
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {/* Simple notification container */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {notifications.map(n => (
          <div key={n.id} style={{ 
            padding: '12px 20px', 
            borderRadius: 8, 
            backgroundColor: n.type === 'success' ? '#10b981' : n.type === 'error' ? '#ef4444' : '#3b82f6',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: 14,
            fontWeight: 600,
            minWidth: 200
          }}>
            {n.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
