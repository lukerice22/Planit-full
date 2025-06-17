require('dotenv').config();

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('./serviceAccountKey.json'); // Make sure this file exists

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('PlanIt backend is running!');
});

// Firebase config for frontend
app.get('/api/firebase-config', (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  });
});

// MapTiler key
app.get('/api/maptiler-key', (req, res) => {
  const key = process.env.MAPTILER_API_KEY;

  if (!key) {
    console.error('MapTiler key is undefined in env');
    return res.status(500).json({ error: 'MapTiler key missing' });
  }

  res.status(200).json({ key });
});

// Check if username is available
app.get('/api/check-username', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username.toLowerCase()).get();
    const available = snapshot.empty;
    res.status(200).json({ available });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});