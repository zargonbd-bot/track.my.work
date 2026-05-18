// src/lib/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from './firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = authService.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    // Also check localStorage for demo mode
    const current = authService.getCurrentUser();
    if (current) setUser(current);
    setLoading(false);
    return unsub;
  }, []);

  const login = async (email, password) => {
    const u = await authService.login(email, password);
    setUser(u);
    return u;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
