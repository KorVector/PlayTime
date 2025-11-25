// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD9ZgvZhSICT1AjJQ661x-6PHO8ixeJLec",
  authDomain: "playtime-7e21b.firebaseapp.com",
  projectId: "playtime-7e21b",
  storageBucket: "playtime-7e21b.firebasestorage.app",
  messagingSenderId: "283746356866",
  appId: "1:283746356866:web:029b3574aed0d2e0caee9b",
  measurementId: "G-QKGGKCHX02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);