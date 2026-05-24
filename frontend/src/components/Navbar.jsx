import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>
          Χάρτης
        </Link>
        <Link to="/reports/new" style={styles.link}>
          Νέα Αναφορά
        </Link>
        <Link to="/my-reports" style={styles.link}>
          Οι Αναφορές Μου
        </Link>
        {isAdmin && (
          <Link to="/admin" style={styles.link}>
            Διαχείριση
          </Link>
        )}
      </div>

      <div style={styles.auth}>
        {isAuthenticated ? (
          <>
            <span style={styles.email}>{user?.email}</span>
            <button type="button" onClick={handleLogout} style={styles.button}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>
              Login
            </Link>
            <Link to="/register" style={styles.link}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    borderBottom: '1px solid #ddd',
    gap: '1rem',
  },
  links: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  auth: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  link: {
    textDecoration: 'none',
    color: '#1a5fb4',
  },
  email: {
    color: '#333',
    fontSize: '0.9rem',
  },
  button: {
    cursor: 'pointer',
    padding: '0.35rem 0.75rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    background: '#fff',
  },
};
