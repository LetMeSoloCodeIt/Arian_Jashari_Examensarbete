import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  Timestamp,
  serverTimestamp 
} from "firebase/firestore";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


const servicesCollection = collection(db, "services");
const bookingsCollection = collection(db, "bookings");
const businessHoursCollection = collection(db, "businessHours");
const bookingLinksCollection = collection(db, "bookingLinks");


console.log("Firebase initialized with collections:", {
  services: servicesCollection.path,
  bookings: bookingsCollection.path,
  businessHours: businessHoursCollection.path,
  bookingLinks: bookingLinksCollection.path
});

export { 
  auth, 
  db, 
  onAuthStateChanged,
  servicesCollection,
  bookingsCollection,
  businessHoursCollection,
  bookingLinksCollection,
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  serverTimestamp
}; 