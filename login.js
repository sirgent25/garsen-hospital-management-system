import { auth } from "./config/firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    try {

        await signInWithEmailAndPassword(auth, email, password);

        alert("Login successful!");

        window.location.href = "dashboard.html";

    } catch (error) {

        console.error("Login Error:", error);

        alert("Login failed: " + error.message);

    }

});