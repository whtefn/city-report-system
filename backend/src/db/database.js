import { initDatabase } from './init.js';

// Singleton σύνδεση στη βάση για όλη την εφαρμογή
const db = initDatabase();

export default db;
