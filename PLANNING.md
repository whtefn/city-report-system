# Architecture & Planning

## Database Schema

### users
- id, email, password_hash, role (citizen/admin), created_at

### reports
- id, title, description, category, status, lat, lng
- address, photo_url, user_id (FK), created_at, updated_at

### categories
- id, name

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Reports
- POST   /api/reports
- GET    /api/reports
- GET    /api/reports/:id
- PATCH  /api/reports/:id  (admin)
- DELETE /api/reports/:id  (admin)

### Upload
- POST /api/upload

## Frontend Pages
- /            → Χάρτης με αναφορές (public)
- /login
- /register
- /reports/new → Φόρμα υποβολής
- /my-reports  → Οι αναφορές μου
- /admin       → Dashboard διαχειριστή