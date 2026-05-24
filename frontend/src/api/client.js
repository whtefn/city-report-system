import axios from 'axios';

export const AUTH_TOKEN_KEY = 'token';
export const AUTH_USER_KEY = 'user';

const client = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Προσθήκη JWT σε κάθε αίτημα όταν υπάρχει token στο localStorage
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  console.log('API token:', token || '(none)');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // FormData: αφήνουμε τον browser να ορίσει το multipart boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

export default client;
