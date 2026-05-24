import { Navigate } from 'react-router-dom';
import { AUTH_TOKEN_KEY } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Προστατεύει routes που απαιτούν σύνδεση.
 * Ανακατευθύνει στο /login αν δεν υπάρχει token στο localStorage.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { loading, isAdmin } = useAuth();
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (loading) {
    return <div>Φόρτωση...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
