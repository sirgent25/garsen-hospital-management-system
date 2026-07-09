import { auth, db } from "../config/firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ================================
// Check Login
// ================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "admin-login.html";
        return;

    }

    await loadAdmin(user);

    await loadStatistics();

    await loadAppointments();

    await loadDoctors();

});

// ================================
// Load Admin Name
// ================================

async function loadAdmin(user) {

    try {

        const adminRef = doc(db, "admins", user.uid);

        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {

            const admin = adminSnap.data();

            document.getElementById("adminName").textContent =
                admin.fullName;

        }

    }

    catch (error) {

        console.error(error);

    }

}

// ================================
// Statistics
// ================================

async function loadStatistics() {

    // Patients
    const patients = await getDocs(collection(db, "patients"));
    document.getElementById("patientsCount").textContent = patients.size;

    // Doctors
    const doctors = await getDocs(collection(db, "doctors"));
    document.getElementById("doctorsCount").textContent = doctors.size;

    // Appointments
    const appointments = await getDocs(collection(db, "appointments"));
    document.getElementById("appointmentsCount").textContent = appointments.size;

    // Departments
    const departments = new Set();

    doctors.forEach((doctor) => {

        const data = doctor.data();

        if (data.department) {

            departments.add(data.department);

        }

    });

    document.getElementById("departmentsCount").textContent =
        departments.size;

}

// ================================
// Today's Appointments
// ================================

async function loadAppointments() {

    const table = document.getElementById("appointmentsTable");

    table.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "appointments"));

        if (snapshot.empty) {

            table.innerHTML = `
                <tr>
                    <td colspan="5">
                        No appointments available.
                    </td>
                </tr>
            `;

            return;

        }

        snapshot.forEach((appointment) => {

            const data = appointment.data();

            table.innerHTML += `

                <tr>

                    <td>${data.patientName}</td>

                    <td>${data.doctorName}</td>

                    <td>${data.appointmentDate}</td>

                    <td>${data.appointmentTime}</td>

                    <td class="${data.status.toLowerCase()}">

                        ${data.status}

                    </td>

                </tr>

            `;

        });

    }

    catch (error) {

        console.error(error);

    }

}

// ================================
// Available Doctors
// ================================

async function loadDoctors() {

    const table = document.getElementById("doctorTable");

    table.innerHTML = "";

    try {

        const q = query(

            collection(db, "doctors"),

            where("status", "==", "Available")

        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {

            table.innerHTML = `
                <tr>
                    <td colspan="4">
                        No available doctors.
                    </td>
                </tr>
            `;

            return;

        }

        snapshot.forEach((doctor) => {

            const data = doctor.data();

            table.innerHTML += `

                <tr>

                    <td>${data.fullName}</td>

                    <td>${data.department}</td>

                    <td>${data.specialization}</td>

                    <td class="available">

                        ${data.status}

                    </td>

                </tr>

            `;

        });

    }

    catch (error) {

        console.error(error);

    }

}

// ================================
// Logout
// ================================

document.getElementById("logoutBtn").addEventListener("click", async (e) => {

    e.preventDefault();

    if (confirm("Are you sure you want to logout?")) {

        await signOut(auth);

        window.location.href = "admin-login.html";

    }

});