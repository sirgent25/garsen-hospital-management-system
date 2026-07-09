
import { auth, db } from "../config/firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    getDocs,
    getDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ======================
// Elements
// ======================

const totalPatients = document.getElementById("totalPatients");
const totalDoctors = document.getElementById("totalDoctors");
const totalDepartments = document.getElementById("totalDepartments");
const totalAppointments = document.getElementById("totalAppointments");

const pendingAppointments =
    document.getElementById("pendingAppointments");

const completedAppointments =
    document.getElementById("completedAppointments");

const rejectedAppointments =
    document.getElementById("rejectedAppointments");

const recentAppointments =
    document.getElementById("recentAppointments");

const downloadPdfBtn =
    document.getElementById("downloadPdfBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

let reportData = {};

// ======================
// Authentication
// ======================

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "admin-login.html";
        return;
    }

    try {

        const adminRef =
            doc(db, "admins", user.uid);

        const adminSnap =
            await getDoc(adminRef);

        if (!adminSnap.exists()) {

            alert("Access denied.");

            await signOut(auth);

            window.location.href =
                "admin-login.html";

            return;
        }

        await loadStatistics();
        await loadRecentAppointments();

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

});

// ======================
// Statistics
// ======================

async function loadStatistics() {

    try {

        const patientsSnap =
            await getDocs(collection(db, "patients"));

        const doctorsSnap =
            await getDocs(collection(db, "doctors"));

        const departmentsSnap =
            await getDocs(collection(db, "departments"));

        const appointmentsSnap =
            await getDocs(collection(db, "appointments"));

        totalPatients.textContent =
            patientsSnap.size;

        totalDoctors.textContent =
            doctorsSnap.size;

        totalDepartments.textContent =
            departmentsSnap.size;

        totalAppointments.textContent =
            appointmentsSnap.size;

        let pending = 0;
        let completed = 0;
        let rejected = 0;

        appointmentsSnap.forEach((docSnap) => {

            const appointment =
                docSnap.data();

            if (appointment.status === "Pending") {
                pending++;
            }

            if (appointment.status === "Completed") {
                completed++;
            }

            if (appointment.status === "Rejected") {
                rejected++;
            }

        });

        pendingAppointments.textContent =
            pending;

        completedAppointments.textContent =
            completed;

        rejectedAppointments.textContent =
            rejected;

        reportData = {
            patients: patientsSnap.size,
            doctors: doctorsSnap.size,
            departments: departmentsSnap.size,
            appointments: appointmentsSnap.size,
            pending,
            completed,
            rejected
        };

    } catch (error) {

        console.error(error);

    }

}

// ======================
// Recent Appointments
// ======================

async function loadRecentAppointments() {

    recentAppointments.innerHTML = `
        <tr>
            <td colspan="4">
                Loading...
            </td>
        </tr>
    `;

    try {

        const snapshot =
            await getDocs(
                collection(db, "appointments")
            );

        recentAppointments.innerHTML = "";

        if (snapshot.empty) {

            recentAppointments.innerHTML = `
                <tr>
                    <td colspan="4">
                        No appointments found.
                    </td>
                </tr>
            `;

            return;
        }

        let count = 0;

        snapshot.forEach((docSnap) => {

            if (count >= 5) return;

            const appointment =
                docSnap.data();

            recentAppointments.innerHTML += `
                <tr>

                    <td>
                        ${appointment.patientName || "-"}
                    </td>

                    <td>
                        ${appointment.doctorName || "-"}
                    </td>

                    <td>
                        ${appointment.appointmentDate || "-"}
                    </td>

                    <td class="${(appointment.status || '').toLowerCase()}">

                        ${appointment.status || "-"}

                    </td>

                </tr>
            `;

            count++;

        });

    } catch (error) {

        console.error(error);

        recentAppointments.innerHTML = `
            <tr>
                <td colspan="4">
                    Failed to load appointments.
                </td>
            </tr>
        `;

    }

}

// ======================
// Download PDF
// ======================

downloadPdfBtn.addEventListener(
    "click",
    () => {

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF();

        pdf.setFontSize(20);
        pdf.text(
            "Garsen Hospital Report",
            20,
            20
        );

        pdf.setFontSize(12);

        pdf.text(
            `Date: ${new Date().toLocaleString()}`,
            20,
            40
        );

        pdf.text(
            `Total Patients: ${reportData.patients}`,
            20,
            60
        );

        pdf.text(
            `Total Doctors: ${reportData.doctors}`,
            20,
            75
        );

        pdf.text(
            `Total Departments: ${reportData.departments}`,
            20,
            90
        );

        pdf.text(
            `Total Appointments: ${reportData.appointments}`,
            20,
            105
        );

        pdf.text(
            `Pending Appointments: ${reportData.pending}`,
            20,
            120
        );

        pdf.text(
            `Completed Appointments: ${reportData.completed}`,
            20,
            135
        );

        pdf.text(
            `Rejected Appointments: ${reportData.rejected}`,
            20,
            150
        );

        pdf.save(
            "Garsen_Hospital_Report.pdf"
        );

    }
);

// ======================
// Logout
// ======================

logoutBtn.addEventListener(
    "click",
    async (e) => {

        e.preventDefault();

        if (confirm("Logout?")) {

            await signOut(auth);

            window.location.href =
                "admin-login.html";

        }

    }
);



