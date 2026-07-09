import { db } from "./config/firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const doctorContainer = document.getElementById("doctorContainer");
const searchInput = document.getElementById("searchDoctor");

let doctors = [];

// ===============================
// Load Doctors
// ===============================

async function loadDoctors() {

    doctorContainer.innerHTML = "<p>Loading doctors...</p>";

    try {

        const snapshot = await getDocs(collection(db, "doctors"));

        doctors = [];

        snapshot.forEach((doc) => {

            doctors.push({
                id: doc.id,
                ...doc.data()
            });

        });

        displayDoctors(doctors);

    } catch (error) {

        console.error("Error loading doctors:", error);

        doctorContainer.innerHTML = `
            <p style="color:red;">
                Failed to load doctors.
            </p>
        `;

    }

}

// ===============================
// Display Doctors
// ===============================

function displayDoctors(list) {

    doctorContainer.innerHTML = "";

    if (list.length === 0) {

        doctorContainer.innerHTML = "<p>No doctors found.</p>";
        return;

    }

    list.forEach((doctor) => {

        let statusClass = "off-duty";

        if (doctor.status === "Available") {

            statusClass = "available";

        } else if (doctor.status === "Busy") {

            statusClass = "busy";

        }

        const card = document.createElement("div");

        card.className = "doctor-card";

        card.innerHTML = `

            <div class="doctor-image">

                <img
                    src="https://cdn-icons-png.flaticon.com/512/387/387561.png"
                    alt="Doctor"
                >

            </div>

            <h2>${doctor.fullName}</h2>

            <p><strong>Department:</strong> ${doctor.department}</p>

            <p><strong>Specialization:</strong> ${doctor.specialization}</p>

            <p><strong>Email:</strong> ${doctor.email}</p>

            <p><strong>Phone:</strong> ${doctor.phone}</p>

            <span class="status ${statusClass}">
                ${doctor.status}
            </span>

            <button
                class="book-btn"
                data-id="${doctor.id}">
                Book Appointment
            </button>

        `;

        doctorContainer.appendChild(card);

    });

    attachBookButtons();

}

// ===============================
// Book Appointment
// ===============================

function attachBookButtons() {

    const buttons = document.querySelectorAll(".book-btn");

    buttons.forEach((button) => {

        button.addEventListener("click", () => {

            const doctorId = button.dataset.id;

            const doctor = doctors.find(d => d.id === doctorId);

            if (!doctor) return;

            localStorage.setItem("selectedDoctorId", doctor.id);
            localStorage.setItem("selectedDoctorName", doctor.fullName);
            localStorage.setItem("selectedDepartment", doctor.department);
            localStorage.setItem("selectedSpecialization", doctor.specialization);
            localStorage.setItem("selectedDoctorEmail", doctor.email);
            localStorage.setItem("selectedDoctorPhone", doctor.phone);
            localStorage.setItem("selectedDoctorStatus", doctor.status);

            window.location.href = "appointments.html";

        });

    });

}

// ===============================
// Search
// ===============================

searchInput.addEventListener("input", () => {

    const keyword = searchInput.value.toLowerCase();

    const filteredDoctors = doctors.filter((doctor) => {

        return (

            doctor.fullName.toLowerCase().includes(keyword) ||

            doctor.specialization.toLowerCase().includes(keyword) ||

            doctor.department.toLowerCase().includes(keyword)

        );

    });

    displayDoctors(filteredDoctors);

});

// ===============================
// Start
// ===============================

loadDoctors();