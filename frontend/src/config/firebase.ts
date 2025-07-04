// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // ✅ Add this

const firebaseConfig = {
  apiKey: "AIzaSyCKZEURWV-Nq6apeudIKkgzYczbM_7yHdQ",
  authDomain: "eduverse-24404.firebaseapp.com",
  projectId: "eduverse-24404",
  storageBucket: "eduverse-24404.appspot.com", // ✅ fix typo (.app → .app**spot**.com)
  messagingSenderId: "804912737188",
  appId: "1:804912737188:web:7f4600aa77450d69906f31",
  measurementId: "G-92CKPK54XJ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Add this to fix the error
const auth = getAuth(app);

export { app, auth };
