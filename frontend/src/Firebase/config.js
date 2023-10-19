import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { firebaseConfig } from "./firebaseConfig.js";

// Initialize Firebase
initializeApp(firebaseConfig);

// Initialize Firebase Auth, Firestore
const auth = getAuth();
const db = getFirestore();

export { auth, db };
