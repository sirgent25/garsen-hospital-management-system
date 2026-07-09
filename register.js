import { auth, db } from "./config/firebase.js";

import { createUserWithEmailAndPassword }
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { doc, setDoc }
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const fullName = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {

        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        await setDoc(doc(db, "patients", user.uid), {

            fullName: fullName,
            email: email,
            phone: phone,
            createdAt: new Date()

        });

        alert("Registration successful!");

        window.location.href = "dashboard.html";

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

});