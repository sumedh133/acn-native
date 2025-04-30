import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_DATABASE_URL, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID, FIREBASE_MEASUREMENT_ID } from '@env';

// const firebaseConfig = {
//   apiKey: FIREBASE_API_KEY,
//   authDomain: FIREBASE_AUTH_DOMAIN,
//   databaseURL: FIREBASE_DATABASE_URL,
//   projectId: FIREBASE_PROJECT_ID,
//   storageBucket: FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
//   appId: FIREBASE_APP_ID,
//   measurementId: FIREBASE_MEASUREMENT_ID,
// };

const firebaseConfig = {
  apiKey: "AIzaSyCh-fYz6w3SrZA4XC85rbrFOv4b5TQCLXo",
  authDomain: "acn-resale-inventories-dde03.firebaseapp.com",
  databaseURL:
    "https://acn-resale-inventories-dde03-default-rtdb.firebaseio.com",
  projectId: "acn-resale-inventories-dde03",
  storageBucket: "acn-resale-inventories-dde03.firebasestorage.app",
  messagingSenderId: "727649873733",
  appId: "1:727649873733:web:31c6731000428aebf3982c",
  measurementId: "G-PF5GCHFMTW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
const db = getFirestore(app);

export { db, app };
