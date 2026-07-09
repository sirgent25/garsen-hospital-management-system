import { auth, db } from "../config/firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const form = document.getElementById("adminLoginForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    try {

        // Login with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;
        console.log("Logged in UID:", user.uid);
console.log("Logged in Email:", user.email);

        // Check if the user exists in the admins collection
        const adminRef = doc(db, "admins", user.uid);

        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {

            // Allow access
            window.location.href = "admin-dashboard.html";

        } else {

            // Not an admin
            await auth.signOut();

            alert("Access denied. You are not an administrator.");

        }

    }

    catch (error) {

        alert(error.message);

    }

});