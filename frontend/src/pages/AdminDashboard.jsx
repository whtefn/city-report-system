import { useEffect, useMemo, useState } from 'react';
import client from '../api/client.js';

const STATUSES = ['εκκρεμεί', 'σε εξέλιξη', 'ολοκληρώθηκε'];

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

function escapeCsv(value) {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function exportToCsv(reports) {
  const headers = ['ID', 'Τίτλος', 'Κατηγορία', 'Κατάσταση', 'Ημερομηνία'];
  const rows = reports.map((report) =>
    [
      report.id,
      escapeCsv(report.title),
      escapeCsv(report.category),
      escapeCsv(report.status),
      escapeCsv(formatDate(report.created_at)),
    ].join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reports-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
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

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

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

  const categories = useMemo(() => {
    const unique = [...new Set(reports.map((r) => r.category).filter(Boolean))];
    return unique.sort((a, b) => a.localeCompare(b, 'el'));
  }, [reports]);

  const stats = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter((r) => r.status === 'εκκρεμεί').length,
      inProgress: reports.filter((r) => r.status === 'σε εξέλιξη').length,
      completed: reports.filter((r) => r.status === 'ολοκληρώθηκε').length,
    }),
    [reports]
  );

  const visibleReports = useMemo(() => {
    return reports.filter((report) => {
      if (categoryFilter && report.category !== categoryFilter) {
        return false;
      }
      if (statusFilter && report.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [reports, categoryFilter, statusFilter]);

  const handleStatusChange = async (reportId, newStatus) => {
    setActionError('');
    setUpdatingId(reportId);

    try {
      const { data } = await client.patch(`/api/reports/${reportId}`, {
        status: newStatus,
      });

      setReports((prev) =>
        prev.map((report) => (report.id === reportId ? data : report))
      );
    } catch (err) {
      setActionError(
        err.response?.data?.error ||
          'Αποτυχία ενημέρωσης κατάστασης. Δοκιμάστε ξανά.'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Διαχείριση Αναφορών</h1>

      {loading && <p style={styles.message}>Φόρτωση αναφορών...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {actionError && <p style={styles.error}>{actionError}</p>}

      {!loading && !error && (
        <>
          <div style={styles.statsBar}>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Σύνολο</span>
              <span style={styles.statValue}>{stats.total}</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Εκκρεμεί</span>
              <span style={{ ...styles.statValue, color: '#e65100' }}>
                {stats.pending}
              </span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Σε εξέλιξη</span>
              <span style={{ ...styles.statValue, color: '#1565c0' }}>
                {stats.inProgress}
              </span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Ολοκληρώθηκε</span>
              <span style={{ ...styles.statValue, color: '#2e7d32' }}>
                {stats.completed}
              </span>
            </div>
          </div>

          <div style={styles.filterBar}>
            <label style={styles.filterLabel}>
              Κατηγορία
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={styles.select}
              >
                <option value="">Όλες</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label style={styles.filterLabel}>
              Κατάσταση
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.select}
              >
                <option value="">Όλες</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => exportToCsv(visibleReports)}
              disabled={visibleReports.length === 0}
              style={styles.exportButton}
            >
              Εξαγωγή CSV
            </button>
          </div>

          {visibleReports.length === 0 ? (
            <p style={styles.empty}>Δεν βρέθηκαν αναφορές με τα επιλεγμένα φίλτρα.</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Τίτλος</th>
                    <th style={styles.th}>Κατηγορία</th>
                    <th style={styles.th}>Κατάσταση</th>
                    <th style={styles.th}>Χρήστης</th>
                    <th style={styles.th}>Ημερομηνία</th>
                    <th style={styles.th}>Ενέργειες</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleReports.map((report) => (
                    <tr key={report.id}>
                      <td style={styles.td}>{report.id}</td>
                      <td style={styles.td}>{report.title}</td>
                      <td style={styles.td}>{report.category}</td>
                      <td style={styles.td}>
                        <StatusBadge status={report.status} />
                      </td>
                      <td style={styles.td}>
                        {report.user_email || '—'}
                      </td>
                      <td style={styles.td}>
                        {formatDate(report.created_at)}
                      </td>
                      <td style={styles.td}>
                        <select
                          value={report.status}
                          onChange={(e) =>
                            handleStatusChange(report.id, e.target.value)
                          }
                          disabled={updatingId === report.id}
                          style={styles.statusSelect}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '1.5rem auto',
    padding: '0 1rem 2rem',
  },
  title: {
    margin: '0 0 1.25rem',
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  message: {
    color: '#555',
  },
  error: {
    color: '#b00020',
    marginBottom: '0.75rem',
  },
  empty: {
    color: '#555',
  },
  statsBar: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '1.25rem',
  },
  statCard: {
    flex: '1 1 140px',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#666',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#1a1a1a',
  },
  filterBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    alignItems: 'flex-end',
    marginBottom: '1rem',
    padding: '1rem',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '6px',
  },
  filterLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  select: {
    padding: '0.45rem 0.6rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '180px',
  },
  exportButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
    background: '#1a5fb4',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    marginLeft: 'auto',
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
  statusSelect: {
    padding: '0.35rem 0.5rem',
    fontSize: '0.85rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '140px',
  },
};
