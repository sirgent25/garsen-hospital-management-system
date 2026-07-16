import {
    auth,
    db
} from "../config/firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const form =
    document.getElementById(
        "doctorLoginForm"
    );

form.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;

        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user =
                userCredential.user;

            const doctorRef =
                doc(
                    db,
                    "doctorUsers",
                    user.uid
                );

            const doctorSnap =
                await getDoc(
                    doctorRef
                );

            if (
                doctorSnap.exists()
            ) {

                alert(
                    "Doctor login successful!"
                );

                window.location.href =
                    "doctor-dashboard.html";

            }

            else {

                await auth.signOut();

                alert(
                    "Access denied. You are not a doctor."
                );

            }

        }

        catch (error) {

            console.error(error);

            alert(
                "Login failed: " +
                error.message
            );

        }

    }
);