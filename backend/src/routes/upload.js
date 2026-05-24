import { Router } from 'express';

const router = Router();

// POST /api/upload
router.post('/', async (req, res, next) => {
  try {
    res.status(501).json({ error: 'Το ανέβασμα αρχείων δεν έχει υλοποιηθεί ακόμα' });
  } catch (err) {
    next(err);
  }
});

export default router;
