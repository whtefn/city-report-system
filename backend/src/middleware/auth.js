import { verifyToken } from '../utils/token.js';

/**
 * Middleware επαλήθευσης JWT από Authorization: Bearer <token>.
 * Τοποθετεί το req.user με { id, email, role }.
 */
export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Απαιτείται έλεγχος ταυτότητας' });
    }

    const token = header.slice(7);
    const payload = verifyToken(token);

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Το token έληξε' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Μη έγκυρο token' });
    }
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

export default authenticate;
