
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDWgeJDKN9QPC9fAcFdHNvOfg3inPfZY3Q",
  authDomain: "hospital-management-g25.firebaseapp.com",
  projectId: "hospital-management-g25",
  storageBucket: "hospital-management-g25.firebasestorage.app",
  messagingSenderId: "942298986706",
  appId: "1:942298986706:web:6ed72a28f59668a7a0150b",
  measurementId: "G-FDX9RML0ZW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app,auth,db };