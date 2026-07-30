import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB7ovIOoUXrm7DJF2-IfsN9j3ZQkG9ysBI",
  authDomain: "todo-app-fb8e4.firebaseapp.com",
  projectId: "todo-app-fb8e4",
  storageBucket: "todo-app-fb8e4.firebasestorage.app",
  messagingSenderId: "892355894601",
  appId: "1:892355894601:web:4a629b69c5e220163dce98",
  measurementId: "G-9YB5K69V9Y"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
