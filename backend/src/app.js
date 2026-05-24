import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import './db/database.js';
import authRoutes from './routes/auth.js';
import reportsRoutes from './routes/reports.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = join(__dirname, '../uploads');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/upload', uploadRoutes);

// Διαχείριση 404 για μη καταχωρημένα API endpoints
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Το endpoint δεν βρέθηκε' });
});

// Κεντρικός χειριστής σφαλμάτων
app.use((err, req, res, next) => {
  console.error(err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Το αρχείο είναι πολύ μεγάλο (μέγ. 5MB)' });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Εσωτερικό σφάλμα διακομιστή',
  });
});

export default app;
