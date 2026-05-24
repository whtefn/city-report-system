import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ανάκτηση συνεδρίας από localStorage κατά την εκκίνηση (κλειδί: 'token')
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem(AUTH_USER_KEY);

    if (storedToken) {
      setToken(storedToken);

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem(AUTH_USER_KEY);
        }
      }
    }

    setLoading(false);
  }, []);

  const login = useCallback(({ token: newToken, user: newUser }) => {
    if (!newToken) {
      console.warn('login(): λείπει token από την απάντηση του API');
      return;
    }

    localStorage.setItem('token', newToken);

    if (newUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
    }

    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === 'admin',
      login,
      logout,
    }),
    [user, token, loading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('Το useAuth πρέπει να χρησιμοποιείται μέσα σε AuthProvider');
  }

  return context;
}

export default AuthContext;
