import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDI4PfWuC1VeHPdhxYbnMO8JQ3MK0vtS-M",
  authDomain: "splendid-yeti-137722.firebaseapp.com",
  projectId: "splendid-yeti-137722",
  storageBucket: "splendid-yeti-137722.firebasestorage.app",
  messagingSenderId: "3132035455",
  appId: "1:3132035455:web:5890e372aac390e1a80a4a"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with our specific database ID
export const db = getFirestore(app, "ai-studio-84899bc3-e76b-467e-8f0d-8498c43bf9e0");
