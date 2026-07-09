import { auth, db } from "./config/firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    doc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const form = document.getElementById("appointmentForm");
const table = document.getElementById("appointmentsTable");

let currentUser = null;

// ===============================
// Check Login
// ===============================

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    await loadPatient();

    loadSelectedDoctor();

    await loadAppointments();

});

// ===============================
// Load Patient Details
// ===============================

async function loadPatient() {

    try {

        const patientRef = doc(db, "patients", currentUser.uid);

        const patientSnap = await getDoc(patientRef);

        if (!patientSnap.exists()) return;

        const patient = patientSnap.data();

        document.getElementById("fullName").value =
            patient.fullName || patient.fullname;

        document.getElementById("email").value =
            patient.email;

    }

    catch (error) {

        console.error(error);

    }

}

// ===============================
// Load Selected Doctor
// ===============================

function loadSelectedDoctor() {

    document.getElementById("doctorName").textContent =
        localStorage.getItem("selectedDoctorName") || "No doctor selected";

    document.getElementById("doctorDepartment").textContent =
        localStorage.getItem("selectedDepartment") || "-";

    document.getElementById("doctorSpecialization").textContent =
        localStorage.getItem("selectedSpecialization") || "-";

    document.getElementById("doctorEmail").textContent =
        localStorage.getItem("selectedDoctorEmail") || "-";

    document.getElementById("doctorPhone").textContent =
        localStorage.getItem("selectedDoctorPhone") || "-";

    document.getElementById("doctorStatus").textContent =
        localStorage.getItem("selectedDoctorStatus") || "-";

}

// ===============================
// Book Appointment
// ===============================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const doctorId = localStorage.getItem("selectedDoctorId");

    if (!doctorId) {

        alert("Please select a doctor first.");

        window.location.href = "doctors.html";

        return;

    }

    try {

        await addDoc(collection(db, "appointments"), {

            patientId: currentUser.uid,

            patientName: document.getElementById("fullName").value,

            patientEmail: document.getElementById("email").value,

            doctorId: doctorId,

            doctorName: localStorage.getItem("selectedDoctorName"),

            department: localStorage.getItem("selectedDepartment"),

            specialization: localStorage.getItem("selectedSpecialization"),

            doctorEmail: localStorage.getItem("selectedDoctorEmail"),

            doctorPhone: localStorage.getItem("selectedDoctorPhone"),

            appointmentDate: document.getElementById("date").value,

            appointmentTime: document.getElementById("time").value,

            reason: document.getElementById("reason").value,

            status: "Pending",

            createdAt: serverTimestamp()

        });

        alert("Appointment booked successfully!");

        form.reset();

        await loadPatient();

        loadSelectedDoctor();

        await loadAppointments();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});

// ===============================
// Load Appointment History
// ===============================

async function loadAppointments() {

    table.innerHTML = "";

    try {

        const q = query(

            collection(db, "appointments"),

            where("patientId", "==", currentUser.uid),

            orderBy("createdAt", "desc")

        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {

            table.innerHTML = `
                <tr>
                    <td colspan="5">No appointments found.</td>
                </tr>
            `;

            return;

        }

        snapshot.forEach((doc) => {

            const appointment = doc.data();

            table.innerHTML += `

                <tr>

                    <td>${appointment.appointmentDate}</td>

                    <td>${appointment.appointmentTime}</td>

                    <td>${appointment.doctorName}</td>

                    <td>${appointment.department}</td>

                    <td>${appointment.status}</td>

                </tr>

            `;

        });

    }

    catch (error) {

        console.error(error);

    }

}