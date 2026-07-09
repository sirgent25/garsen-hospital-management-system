console.log("Profile.js loaded");

import { auth, db } from "./config/firebase.js";

import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    try {

        const docRef = doc(db, "patients", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {

            const data = docSnap.data();

            // Supports both old and new field names
            const name = data.fullName || data.fullname;

            document.getElementById("userName").textContent = name;
            document.getElementById("fullName").textContent = name;
            document.getElementById("email").textContent = data.email;
            document.getElementById("phone").textContent = data.phone;

        } else {

            alert("Profile not found.");

        }

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

});