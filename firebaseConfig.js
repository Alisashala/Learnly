// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChcmTR07uwnF2jWUpYN0TxSMfjsAkwz8s",
  authDomain: "learnly-21247.firebaseapp.com",
  projectId: "learnly-21247",
  storageBucket: "learnly-21247.firebasestorage.app",
  messagingSenderId: "509858054076",
  appId: "1:509858054076:web:f83d79bdd73eb42e8c75b9",
  measurementId: "G-WQT42VMJNF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);