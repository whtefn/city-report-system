import { Router } from 'express';
import multer from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import db from '../db/database.js';
import authenticate from '../middleware/auth.js';
import adminOnly from '../middleware/adminOnly.js';

const router = Router();

const VALID_STATUSES = ['εκκρεμεί', 'σε εξέλιξη', 'ολοκληρώθηκε'];

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = join(__dirname, '../../uploads');

if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = file.originalname.includes('.')
      ? file.originalname.slice(file.originalname.lastIndexOf('.'))
      : '';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Μόνο εικόνες επιτρέπονται'));
    }
  },
});

const REPORT_SELECT = `
  SELECT r.id, r.title, r.description, r.category, r.status,
         r.lat, r.lng, r.address, r.photo_url, r.user_id,
         r.created_at, r.updated_at, u.email AS user_email
  FROM reports r
  JOIN users u ON r.user_id = u.id
`;

function getReportById(id) {
  return db.prepare(`${REPORT_SELECT} WHERE r.id = ?`).get(id);
}

// Προαιρετικό upload φωτογραφίας (FormData από frontend)
function optionalPhotoUpload(req, res, next) {
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    return upload.single('photo')(req, res, next);
  }

  next();
}

// GET /api/reports — δημόσιο, φίλτρα category / status
router.get('/', async (req, res, next) => {
  try {
    const { category, status } = req.query;

    let sql = `${REPORT_SELECT} WHERE 1 = 1`;
    const params = [];

    if (category) {
      sql += ' AND r.category = ?';
      params.push(category);
    }

    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY r.created_at DESC';

    const reports = db.prepare(sql).all(...params);
    res.json(reports);
  } catch (err) {
    next(err);
  }
});

// POST /api/reports — απαιτείται JWT
router.post(
  '/',
  authenticate,
  optionalPhotoUpload,
  async (req, res, next) => {
    try {
      const { title, description, category, lat, lng, address, photo_url } =
        req.body;

      if (!title?.trim() || !category) {
        return res
          .status(400)
          .json({ error: 'Απαιτούνται τίτλος και κατηγορία' });
      }

      if (lat === undefined || lng === undefined || lat === '' || lng === '') {
        return res
          .status(400)
          .json({ error: 'Απαιτούνται συντεταγμένες (lat, lng)' });
      }

      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);

      if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
        return res.status(400).json({ error: 'Μη έγκυρες συντεταγμένες' });
      }

      // photo_url από body ή από ανεβασμένο αρχείο
      let resolvedPhotoUrl = photo_url?.trim() || null;
      if (req.file) {
        resolvedPhotoUrl = `/uploads/${req.file.filename}`;
      }

      const result = db
        .prepare(
          `INSERT INTO reports (
             title, description, category, status, lat, lng,
             address, photo_url, user_id, updated_at
           )
           VALUES (?, ?, ?, 'εκκρεμεί', ?, ?, ?, ?, ?, datetime('now'))`
        )
        .run(
          title.trim(),
          description?.trim() || null,
          category,
          latNum,
          lngNum,
          address?.trim() || null,
          resolvedPhotoUrl,
          req.user.id
        );

      const report = getReportById(Number(result.lastInsertRowid));

      res.status(201).json(report);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/reports/:id — δημόσιο
router.get('/:id', async (req, res, next) => {
  try {
    const report = getReportById(req.params.id);

    if (!report) {
      return res.status(404).json({ error: 'Η αναφορά δεν βρέθηκε' });
    }

    res.json(report);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/reports/:id — μόνο admin, ενημέρωση κατάστασης
router.patch('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Η κατάσταση πρέπει να είναι: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const existing = db
      .prepare('SELECT id FROM reports WHERE id = ?')
      .get(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'Η αναφορά δεν βρέθηκε' });
    }

    db.prepare(
      `UPDATE reports
       SET status = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(status, req.params.id);

    const report = getReportById(req.params.id);
    res.json(report);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/reports/:id — μόνο admin
router.delete('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    const result = db
      .prepare('DELETE FROM reports WHERE id = ?')
      .run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Η αναφορά δεν βρέθηκε' });
    }

    res.json({ message: 'Η αναφορά διαγράφηκε' });
  } catch (err) {
    next(err);
  }
});

export default router;
