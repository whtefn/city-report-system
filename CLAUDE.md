# City Report System - Agent Instructions

## Project Overview
Σύστημα αναφοράς προβλημάτων πόλης. Πολίτες υποβάλλουν αναφορές
(λακκούβες, φανάρια κ.λπ.), διαχειριστές τις διαχειρίζονται.

## Tech Stack
- Frontend: React 18, React Router, Leaflet.js, Axios
- Backend: Node.js, Express, SQLite (dev)
- Auth: JWT tokens
- Email: Nodemailer

## Code Style
- ES Modules (import/export)
- async/await παντού, όχι callbacks
- Σχόλια στα ελληνικά για business logic
- Error handling σε κάθε endpoint

## Architecture
- REST API στο backend (port 5000)
- React SPA στο frontend (port 3000)
- JWT σε Authorization header

## Key Constraints
- Κάθε αναφορά έχει: τίτλο, κατηγορία, συντεταγμένες, κατάσταση, φωτογραφία
- Καταστάσεις: "εκκρεμεί" | "σε εξέλιξη" | "ολοκληρώθηκε"
- Ρόλοι: citizen | admin