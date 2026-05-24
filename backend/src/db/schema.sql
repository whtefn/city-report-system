-- Χρήστες συστήματος (πολίτες και διαχειριστές)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Κατηγορίες αναφορών
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

-- Αναφορές προβλημάτων πόλης
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'εκκρεμεί' CHECK (status IN ('εκκρεμεί', 'σε εξέλιξη', 'ολοκληρώθηκε')),
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  address TEXT,
  photo_url TEXT,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports (user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);

-- Προεπιλεγμένες κατηγορίες
INSERT OR IGNORE INTO categories (name) VALUES
  ('Λακκούβες'),
  ('Φανάρια'),
  ('Καθαριότητα'),
  ('Πράσινο'),
  ('Άλλο');
