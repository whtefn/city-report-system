import { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from 'react-leaflet';
import client from '../api/client.js';
import { ATHENS_CENTER, DEFAULT_ZOOM } from '../utils/leafletIcons.js';

const CATEGORIES = [
  'Δρόμοι και Πεζοδρόμια',
  'Φωτισμός',
  'Πάρκα και Πλατείες',
  'Αποχέτευση',
  'Άλλο',
];

function LocationPicker({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function NewReport() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessId(null);

    if (!location) {
      setError('Επιλέξτε τοποθεσία στον χάρτη κάνοντας κλικ.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('lat', String(location.lat));
      formData.append('lng', String(location.lng));

      if (photo) {
        formData.append('photo', photo);
      }

      const { data } = await client.post('/api/reports', formData);

      setSuccessId(data.id);
      setTitle('');
      setDescription('');
      setCategory(CATEGORIES[0]);
      setLocation(null);
      setPhoto(null);
      e.target.reset();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Η υποβολή της αναφοράς απέτυχε. Δοκιμάστε ξανά.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Νέα Αναφορά</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Τίτλος
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Περιγραφή
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={styles.textarea}
          />
        </label>

        <label style={styles.label}>
          Κατηγορία
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={styles.input}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <div>
          <p style={styles.mapHint}>
            Κάντε κλικ στον χάρτη για να ορίσετε την τοποθεσία του προβλήματος
          </p>
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
              <LocationPicker onSelect={setLocation} />
              {location && (
                <Marker position={[location.lat, location.lng]} />
              )}
            </MapContainer>
          </div>
          {location ? (
            <p style={styles.coords}>
              Συντεταγμένες: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </p>
          ) : (
            <p style={styles.coordsMuted}>Δεν έχει επιλεγεί τοποθεσία</p>
          )}
        </div>

        <label style={styles.label}>
          Φωτογραφία
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            style={styles.fileInput}
          />
        </label>

        {error && <p style={styles.error}>{error}</p>}
        {successId && (
          <p style={styles.success}>
            Η αναφορά καταχωρήθηκε επιτυχώς. Αριθμός αναφοράς: {successId}
          </p>
        )}

        <button type="submit" disabled={submitting} style={styles.button}>
          {submitting ? 'Υποβολή...' : 'Υποβολή αναφοράς'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '720px',
    margin: '1.5rem auto',
    padding: '0 1rem 2rem',
  },
  title: {
    marginBottom: '1.25rem',
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  input: {
    padding: '0.5rem 0.75rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  textarea: {
    padding: '0.5rem 0.75rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  fileInput: {
    fontSize: '0.9rem',
  },
  mapHint: {
    margin: '0 0 0.5rem',
    fontSize: '0.9rem',
    color: '#555',
  },
  mapWrapper: {
    border: '1px solid #ccc',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  map: {
    height: '320px',
    width: '100%',
  },
  coords: {
    margin: '0.5rem 0 0',
    fontSize: '0.85rem',
    color: '#333',
  },
  coordsMuted: {
    margin: '0.5rem 0 0',
    fontSize: '0.85rem',
    color: '#888',
  },
  error: {
    margin: 0,
    color: '#b00020',
    fontSize: '0.9rem',
  },
  success: {
    margin: 0,
    color: '#0d652d',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  button: {
    marginTop: '0.5rem',
    padding: '0.6rem 1rem',
    fontSize: '1rem',
    cursor: 'pointer',
    background: '#1a5fb4',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
  },
};
