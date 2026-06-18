import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage"; // Idagdag ito

const firebaseConfig = {
  apiKey: "AIzaSyDVEIReFbZQMfFhukIUU-7GgBxpHnXdqg0",
  authDomain: "hanapatient-33a76.firebaseapp.com",
  databaseURL: "https://hanapatient-33a76-default-rtdb.firebaseio.com",
  projectId: "hanapatient-33a76",
  storageBucket: "hanapatient-33a76.firebasestorage.app",
  messagingSenderId: "765355309586",
  appId: "1:765355309586:web:4a65af07fc4bc0113c36cb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app); // I-export ang storage