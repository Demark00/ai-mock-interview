import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxDhBFPQl1_DZ8tBIPsPWb_F39ZgTpcfk",
  authDomain: "ai-mock-interview-f8c81.firebaseapp.com",
  projectId: "ai-mock-interview-f8c81",
  storageBucket: "ai-mock-interview-f8c81.firebasestorage.app",
  messagingSenderId: "378584700552",
  appId: "1:378584700552:web:5187185f2ac9ce0a30713d"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);