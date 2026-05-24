import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_STYLES = {
  'εκκρεμεί': { background: '#fff3e0', color: '#e65100' },
  'σε εξέλιξη': { background: '#e3f2fd', color: '#1565c0' },
  'ολοκληρώθηκε': { background: '#e8f5e9', color: '#2e7d32' },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString('el-GR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const badgeStyle = STATUS_STYLES[status] || {
    background: '#f5f5f5',
    color: '#333',
  };

  return (
    <span
      style={{
        ...styles.badge,
        background: badgeStyle.background,
        color: badgeStyle.color,
      }}
    >
      {status}
    </span>
  );
}

export default function MyReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await client.get('/api/reports');
        setReports(data);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            'Αποτυχία φόρτωσης αναφορών. Δοκιμάστε ξανά.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const myReports = useMemo(
    () => reports.filter((report) => Number(report.user_id) === Number(user?.id)),
    [reports, user?.id]
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Οι Αναφορές Μου</h1>
        <Link to="/reports/new" style={styles.newButton}>
          Νέα Αναφορά
        </Link>
      </div>

      {loading && <p style={styles.message}>Φόρτωση αναφορών...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && myReports.length === 0 && (
        <p style={styles.empty}>Δεν έχετε υποβάλει αναφορές ακόμα</p>
      )}

      {!loading && !error && myReports.length > 0 && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Τίτλος</th>
                <th style={styles.th}>Κατηγορία</th>
                <th style={styles.th}>Κατάσταση</th>
                <th style={styles.th}>Ημερομηνία</th>
              </tr>
            </thead>
            <tbody>
              {myReports.map((report) => (
                <tr key={report.id}>
                  <td style={styles.td}>{report.id}</td>
                  <td style={styles.td}>{report.title}</td>
                  <td style={styles.td}>{report.category}</td>
                  <td style={styles.td}>
                    <StatusBadge status={report.status} />
                  </td>
                  <td style={styles.td}>{formatDate(report.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '960px',
    margin: '1.5rem auto',
    padding: '0 1rem 2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  newButton: {
    padding: '0.5rem 1rem',
    background: '#1a5fb4',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '0.95rem',
  },
  message: {
    color: '#555',
  },
  error: {
    color: '#b00020',
  },
  empty: {
    color: '#555',
    fontSize: '1rem',
  },
  tableWrapper: {
    overflowX: 'auto',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    borderBottom: '2px solid #ddd',
    fontSize: '0.9rem',
    fontWeight: 600,
    background: '#f5f5f5',
  },
  td: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #eee',
    fontSize: '0.9rem',
    verticalAlign: 'middle',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
};
