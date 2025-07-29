// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDM_h6nYttBxgNCeCwkirn0RGoIXm_taVE",
  authDomain: "fastapi-react-todos.firebaseapp.com",
  projectId: "fastapi-react-todos",
  storageBucket: "fastapi-react-todos.firebasestorage.app",
  messagingSenderId: "973828619875",
  appId: "1:973828619875:web:7cab6ee8cfbb74844e4256",
  measurementId: "G-YDFFWRV3X9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);