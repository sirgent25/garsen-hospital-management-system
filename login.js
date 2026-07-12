import { auth, db } from "./config/firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;

        // Check if the user is an admin
        const adminRef = doc(
            db,
            "admins",
            user.uid
        );

        const adminSnap =
            await getDoc(adminRef);

        if (adminSnap.exists()) {

            alert("Admin login successful!");

            window.location.href =
                "admin/admin-dashboard.html";

        } else {

            alert("Login successful!");

            window.location.href =
                "dashboard.html";

        }

    }

    catch (error) {

        console.error(
            "Login Error:",
            error
        );

        alert(
            "Login failed: " +
            error.message
        );

    }

});