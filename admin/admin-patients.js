

import { auth, db } from "../config/firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    getDocs,
    getDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ======================
// Elements
// ======================

const patientsTable = document.getElementById("patientsTable");
const totalPatients = document.getElementById("totalPatients");
const searchPatient = document.getElementById("searchPatient");
const logoutBtn = document.getElementById("logoutBtn");

let patients = [];

// ======================
// Authentication
// ======================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "admin-login.html";
        return;

    }

    try {

        const adminRef = doc(db, "admins", user.uid);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {

            alert("Access denied.");

            await signOut(auth);

            window.location.href = "admin-login.html";

            return;

        }

        await loadPatients();

    }

    catch (error) {

        console.error(error);
        alert(error.message);

    }

});

// ======================
// Load Patients
// ======================

async function loadPatients() {

    patients = [];

    patientsTable.innerHTML = `
        <tr>
            <td colspan="5">
                Loading patients...
            </td>
        </tr>
    `;

    try {

        const snapshot = await getDocs(
            collection(db, "patients")
        );

        patientsTable.innerHTML = "";

        snapshot.forEach((docSnap) => {

            patients.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });

        totalPatients.textContent = patients.length;

        displayPatients();

    }

    catch (error) {

        console.error(error);

        patientsTable.innerHTML = `
            <tr>
                <td colspan="5">
                    Failed to load patients.
                </td>
            </tr>
        `;

    }

}

// ======================
// Display Patients
// ======================

function displayPatients(list = patients) {

    patientsTable.innerHTML = "";

    if (list.length === 0) {

        patientsTable.innerHTML = `
            <tr>
                <td colspan="5">
                    No patients found.
                </td>
            </tr>
        `;

        return;

    }

    list.forEach((patient) => {

        patientsTable.innerHTML += `

            <tr>

                <td>${patient.fullName || patient.fullname || "-"}</td>

                <td>${patient.email || "-"}</td>

                <td>${patient.phone || "-"}</td>

                <td>${patient.gender || "-"}</td>

                <td>

                    <button
                        class="btn view-btn"
                        onclick="viewPatient('${patient.id}')">

                        View

                    </button>

                    <button
                        class="btn delete-btn"
                        onclick="deletePatient('${patient.id}')">

                        Delete

                    </button>

                </td>

            </tr>

        `;

    });

}

// ======================
// View Patient
// ======================

window.viewPatient = function(id) {

    const patient = patients.find(
        p => p.id === id
    );

    if (!patient) return;

    alert(

        `Name: ${patient.fullName || patient.fullname || "-"}

Email: ${patient.email || "-"}

Phone: ${patient.phone || "-"}

Gender: ${patient.gender || "-"}`

    );

};

// ======================
// Delete Patient
// ======================

window.deletePatient = async function(id) {

    if (!confirm(
        "Delete this patient?"
    )) return;

    try {

        await deleteDoc(
            doc(db, "patients", id)
        );

        await loadPatients();

        alert("Patient deleted.");

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

};

// ======================
// Search
// ======================

searchPatient.addEventListener("keyup", () => {

    const keyword =
        searchPatient.value.toLowerCase();

    const filtered = patients.filter(
        (patient) => {

            return (

                (patient.fullName || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                (patient.fullname || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                (patient.email || "")
                    .toLowerCase()
                    .includes(keyword)

            );

        }
    );

    displayPatients(filtered);

});

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

