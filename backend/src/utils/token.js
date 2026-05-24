import jwt from 'jsonwebtoken';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error('JWT_SECRET δεν έχει ρυθμιστεί');
    err.status = 500;
    throw err;
  }
  return secret;
}

/**
 * Εκδίδει JWT με id, email και ρόλο χρήστη.
 */
export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Επαληθεύει JWT και επιστρέφει το payload.
 */
export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}
