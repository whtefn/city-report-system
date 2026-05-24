/**
 * Επιτρέπει πρόσβαση μόνο σε χρήστες με ρόλο admin.
 * Πρέπει να εκτελείται μετά το authenticate middleware.
 */
export function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Απαιτείται έλεγχος ταυτότητας' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Δεν έχετε δικαιώματα διαχειριστή' });
  }

  next();
}

export default adminOnly;
