import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import client from '../api/client.js';
import '../utils/leafletIcons.js';
import { ATHENS_CENTER, DEFAULT_ZOOM } from '../utils/leafletIcons.js';

export default function MapView() {
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

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Χάρτης Αναφορών</h1>

      {loading && <p style={styles.message}>Φόρτωση αναφορών...</p>}
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.mapWrapper}>
        <MapContainer
          center={ATHENS_CENTER}
          zoom={DEFAULT_ZOOM}
          style={styles.map}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {reports.map((report) => (
            <Marker
              key={report.id}
              position={[report.lat, report.lng]}
            >
              <Popup>
                <div style={styles.popup}>
                  <strong>{report.title}</strong>
                  <p style={styles.popupLine}>
                    <span>Κατηγορία:</span> {report.category}
                  </p>
                  <p style={styles.popupLine}>
                    <span>Κατάσταση:</span> {report.status}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {!loading && !error && (
        <p style={styles.count}>
          {reports.length === 0
            ? 'Δεν υπάρχουν αναφορές στον χάρτη.'
            : `${reports.length} αναφορές στον χάρτη`}
        </p>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '1rem',
  },
  title: {
    margin: '0 0 1rem',
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  message: {
    margin: '0 0 0.75rem',
    color: '#555',
  },
  error: {
    margin: '0 0 0.75rem',
    color: '#b00020',
  },
  mapWrapper: {
    border: '1px solid #ccc',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  map: {
    height: 'calc(100vh - 180px)',
    minHeight: '400px',
    width: '100%',
  },
  count: {
    marginTop: '0.75rem',
    fontSize: '0.9rem',
    color: '#555',
  },
  popup: {
    margin: 0,
    fontSize: '0.9rem',
    lineHeight: 1.4,
  },
  popupLine: {
    margin: '0.35rem 0 0',
  },
};
