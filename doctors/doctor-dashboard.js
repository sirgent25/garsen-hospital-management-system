import { auth, db } from "../config/firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ================================
// Global Variable
// ================================
let doctorId = "";

// ================================
// Check Login
// ================================
onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "doctor-login.html";
        return;
    }

    try {

        // Check if user is a doctor
        const doctorRef = doc(
            db,
            "doctorUsers",
            user.uid
        );

        const doctorSnap = await getDoc(doctorRef);

        if (!doctorSnap.exists()) {

            await signOut(auth);

            alert("Access denied.");

            window.location.href =
                "doctor-login.html";

            return;
        }

        const doctor = doctorSnap.data();

        doctorId = doctor.doctorId;

        document.getElementById(
            "doctorName"
        ).textContent =
            `Welcome  ${doctor.fullName}`;

        await loadStatistics();

        await loadAppointments();

    }
    catch (error) {
        console.error(error);
    }

});

// ================================
// Load Statistics
// ================================
async function loadStatistics() {

    try {

        const q = query(
            collection(db, "appointments"),
            where("doctorId", "==", doctorId)
        );

        const snapshot = await getDocs(q);

        let pending = 0;
        let completed = 0;

        const patients = new Set();

        snapshot.forEach((appointment) => {

            const data = appointment.data();

            if (data.patientId) {
                patients.add(data.patientId);
            }

            if (data.status === "Pending") {
                pending++;
            }

            if (data.status === "Completed") {
                completed++;
            }

        });

        document.getElementById(
            "appointmentsCount"
        ).textContent = snapshot.size;

        document.getElementById(
            "pendingCount"
        ).textContent = pending;

        document.getElementById(
            "completedCount"
        ).textContent = completed;

        document.getElementById(
            "patientsCount"
        ).textContent = patients.size;

    }
    catch (error) {

        console.error(
            "Error loading statistics:",
            error
        );

    }

}

// ================================
// Load Appointments
// ================================
async function loadAppointments() {

    const table =
        document.getElementById(
            "appointmentsTable"
        );

    table.innerHTML = "";

    try {

        const q = query(
            collection(db, "appointments"),
            where("doctorId", "==", doctorId)
        );

        const snapshot =
            await getDocs(q);

        if (snapshot.empty) {

            table.innerHTML = `
                <tr>
                    <td colspan="4">
                        No appointments found.
                    </td>
                </tr>
            `;

            return;
        }

        snapshot.forEach((appointment) => {

            const data =
                appointment.data();

            table.innerHTML += `
                <tr>

                    <td>
                        ${data.patientName}
                    </td>

                    <td>
                        ${data.appointmentDate}
                    </td>

                    <td>
                        ${data.appointmentTime}
                    </td>

                    <td class="${data.status.toLowerCase()}">
                        ${data.status}
                    </td>

                </tr>
            `;
        });

    }
    catch (error) {

        console.error(
            "Error loading appointments:",
            error
        );

    }

}

// ================================
// Logout
// ================================
document
.getElementById("logoutBtn")
.addEventListener(
    "click",
    async () => {

        if (
            confirm(
                "Are you sure you want to logout?"
            )
        ) {

            await signOut(auth);

            window.location.href =
                "doctor-login.html";

        }

    }
);