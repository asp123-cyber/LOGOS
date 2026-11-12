import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fsLimit,
  startAfter,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyCj-K1vAZ8mKRTZ3bkC4_o62jFZ2qc1re8",
  authDomain: "logos-d9a68.firebaseapp.com",
  projectId: "logos-d9a68",
  storageBucket: "logos-d9a68.firebasestorage.app",
  messagingSenderId: "1081424828646",
  appId: "1:1081424828646:web:00fa35c357c0c8583dc327",
  measurementId: "G-MJGLKELQQX",
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  fbSignOut,
  onAuthStateChanged,
  type FirebaseUser,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  fsLimit,
  startAfter,
  serverTimestamp,
  type DocumentData,
  storageRef,
  uploadBytes,
  getDownloadURL,
};
