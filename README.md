# Σύστημα Αναφοράς Προβλημάτων Πόλης

Web εφαρμογή που επιτρέπει στους πολίτες να αναφέρουν προβλήματα της πόλης (λακκούβες, φανάρια, καθαριότητα κ.λπ.) σε διαδραστικό χάρτη, και στους διαχειριστές να παρακολουθούν και να ενημερώνουν την κατάσταση των αναφορών.

## Tech Stack

- **Frontend:** React, React Router, Axios, Leaflet.js
- **Backend:** Node.js, Express
- **Database:** SQLite
- **Auth:** JWT (JSON Web Tokens)

## Prerequisites

- [Node.js](https://nodejs.org/) v22+
- [Git](https://git-scm.com/)

## Installation & Run

### 1. Clone the repository

```bash
git clone <repository-url>
cd city-report-system
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
PORT=8080
JWT_SECRET=your-secret-key-here
```

Start the server:

```bash
node src/server.js
```

The API will be available at `http://localhost:8080`.

Optional — initialize the database:

```bash
npm run db:init
```

### 3. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite (typically `http://localhost:5173`). The frontend proxies `/api` and `/uploads` to the backend on port 8080.

## Default Accounts

| Role | How to access |
|------|----------------|
| **Citizen** | Register a new account at `/register` |
| **Admin** | `admin@test.com` / `admin123` |

> **Note:** Create the admin user manually in the database or via registration if it does not exist yet.

## Features

- Υποβολή αναφοράς με τίτλο, περιγραφή, κατηγορία, τοποθεσία στον χάρτη και φωτογραφία
- Δημόσιος χάρτης με markers όλων των αναφορών
- Σύνδεση / εγγραφή πολιτών (JWT)
- Σελίδα «Οι Αναφορές Μου» για τον συνδεδεμένο χρήστη
- Admin dashboard με στατιστικά, φίλτρα και αλλαγή κατάστασης
- Εξαγωγή φιλτραρισμένων αναφορών σε CSV

## Screenshots

<!-- Προσθέστε screenshots εδώ -->

| Χάρτης | Νέα Αναφορά |
|--------|-------------|
| _screenshot-map.png_ | _screenshot-new-report.png_ |

| Οι Αναφορές Μου | Admin Dashboard |
|-----------------|-----------------|
| _screenshot-my-reports.png_ | _screenshot-admin.png_ |
