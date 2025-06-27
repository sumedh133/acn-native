import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "@react-native-firebase/analytics"
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

// const firebaseConfig = {
//   apiKey: "AIzaSyCh-fYz6w3SrZA4XC85rbrFOv4b5TQCLXo",
//   authDomain: "acn-resale-inventories-dde03.firebaseapp.com",
//   databaseURL:
//     "https://acn-resale-inventories-dde03-default-rtdb.firebaseio.com",
//   projectId: "acn-resale-inventories-dde03",
//   storageBucket: "acn-resale-inventories-dde03.firebasestorage.app",
//   messagingSenderId: "727649873733",
//   appId: "1:727649873733:web:31c6731000428aebf3982c",
//   measurementId: "G-PF5GCHFMTW",
// };

const firebaseConfig = {
  apiKey: "AIzaSyDenhyiV6Gt1LpIb0I2z9A9OkuPxEYVv7Y",
  authDomain: "iqol-crm.firebaseapp.com",
  // databaseURL: ""
  projectId: "iqol-crm",
  storageBucket: "iqol-crm.firebasestorage.app",
  messagingSenderId: "695268023939",
  appId: "1:695268023939:web:c0100eb97b384c0f1e05b6",
  measurementId: "G-PF5GCHFMTW",
}

// VITE_FIREBASE_API_KEY=AIzaSyDenhyiV6Gt1LpIb0I2z9A9OkuPxEYVv7Y
// VITE_FIREBASE_AUTH_DOMAIN=iqol-crm.firebaseapp.com
// VITE_FIREBASE_PROJECT_ID=iqol-crm
// VITE_FIREBASE_STORAGE_BUCKET=iqol-crm.firebasestorage.app
// VITE_FIREBASE_MESSAGING_SENDER_ID=695268023939
// VITE_FIREBASE_APP_ID=1:695268023939:web:c0100eb97b384c0f1e05b6
// VITE_FIREBASE_MEASUREMENT_ID=G-KXYQDNJC8R

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
const db = getFirestore(app);
// import analytics
const analytics = getAnalytics();

export { db, app, analytics };
