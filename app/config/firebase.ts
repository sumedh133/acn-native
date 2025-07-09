import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "@react-native-firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyDenhyiV6Gt1LpIb0I2z9A9OkuPxEYVv7Y",
  authDomain: "iqol-crm.firebaseapp.com",
  projectId: "iqol-crm",
  storageBucket: "iqol-crm.firebasestorage.app",
  messagingSenderId: "695268023939",
  appId: "1:695268023939:web:c0100eb97b384c0f1e05b6",
  measurementId: "G-PF5GCHFMTW",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
const db = getFirestore(app);
// import analytics
const analytics = getAnalytics();

export { db, app, analytics };
