// Firebase app and Firestore setup
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyChl42qaukbryln0t0FX752e8_3oC5HTaQ",
  authDomain: "cyber-squid-game.firebaseapp.com",
  projectId: "cyber-squid-game",
  storageBucket: "cyber-squid-game.firebasestorage.app",
  messagingSenderId: "687304077321",
  appId: "1:687304077321:web:a30af47c4e2832bfdf88d8",
  measurementId: "G-2G8K46K3J4"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, analytics };
