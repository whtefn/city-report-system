import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/database.js';
import { signToken } from '../utils/token.js';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const BCRYPT_ROUNDS = 10;

/**
 * Επικύρωση email και κωδικού για εγγραφή.
 */
function validateRegistration(email, password) {
  const errors = [];

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('Μη έγκυρο email');
  }

  if (
    !password ||
    typeof password !== 'string' ||
    password.length < MIN_PASSWORD_LENGTH
  ) {
    errors.push(
      `Ο κωδικός πρέπει να έχει τουλάχιστον ${MIN_PASSWORD_LENGTH} χαρακτήρες`
    );
  }

  return errors;
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const validationErrors = validateRegistration(email, password);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(', ') });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(normalizedEmail);

    if (existing) {
      return res.status(409).json({ error: 'Το email χρησιμοποιείται ήδη' });
    }

    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const result = db
      .prepare(
        'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)'
      )
      .run(normalizedEmail, password_hash, 'citizen');

    const user = {
      id: Number(result.lastInsertRowid),
      email: normalizedEmail,
      role: 'citizen',
    };

    const token = signToken(user);

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Απαιτούνται email και κωδικός' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = db
      .prepare(
        'SELECT id, email, password_hash, role FROM users WHERE email = ?'
      )
      .get(normalizedEmail);

    // Ίδιο μήνυμα για μη ύπαρξη χρήστη ή λάθος κωδικό
    if (!user) {
      return res.status(401).json({ error: 'Λάθος email ή κωδικός' });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({ error: 'Λάθος email ή κωδικός' });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
