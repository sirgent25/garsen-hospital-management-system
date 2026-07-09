import { auth, db } from "../config/firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const table = document.getElementById("appointmentsTable");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

let appointments = [];

// ==========================================
// CHECK LOGIN
// ==========================================

onAuthStateChanged(auth, async (user) => {

    console.log("Auth State Changed");

    if (!user) {

        console.log("No user logged in.");

        window.location.href = "admin-login.html";
        return;

    }

    console.log("Logged in UID:", user.uid);

    try {

        const adminRef = doc(db, "admins", user.uid);

        console.log("Checking admin document...");

        const adminSnap = await getDoc(adminRef);

        console.log("Admin document exists:", adminSnap.exists());

        if (!adminSnap.exists()) {

            alert("Access denied.");

            await signOut(auth);

            window.location.href = "admin-login.html";

            return;

        }

        console.log("Admin verified successfully.");

        await loadAppointments();

    }

    catch (error) {

        console.error("AUTH ERROR:", error);

    }

});

// ==========================================
// LOAD APPOINTMENTS
// ==========================================

async function loadAppointments() {

    console.log("Loading appointments...");

    table.innerHTML = `
        <tr>
            <td colspan="7">Loading appointments...</td>
        </tr>
    `;

    try {

        const snapshot = await getDocs(collection(db, "appointments"));

        console.log("Appointments loaded:", snapshot.size);

        appointments = [];

        snapshot.forEach((document) => {

            appointments.push({

                id: document.id,
                ...document.data()

            });

        });

        console.log(appointments);

        displayAppointments(appointments);

    }

    catch (error) {

        console.error("LOAD APPOINTMENTS ERROR:", error);

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    Failed to load appointments.
                </td>
            </tr>
        `;

    }

}

// ==========================================
// DISPLAY APPOINTMENTS
// ==========================================

function displayAppointments(list) {

    table.innerHTML = "";

    if (list.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7">No appointments found.</td>
            </tr>
        `;

        return;

    }

    list.forEach((appointment) => {

        let actions = "";

        if (appointment.status === "Pending") {

            actions = `
                <button class="btn approve-btn"
                onclick="updateStatus('${appointment.id}','Approved')">
                Approve
                </button>

                <button class="btn reject-btn"
                onclick="updateStatus('${appointment.id}','Rejected')">
                Reject
                </button>
            `;

        }

        else if (appointment.status === "Approved") {

            actions = `
                <button class="btn complete-btn"
                onclick="updateStatus('${appointment.id}','Completed')">
                Complete
                </button>
            `;

        }

        else {

            actions = `
                <button class="btn disabled-btn" disabled>
                ${appointment.status}
                </button>
            `;

        }

        table.innerHTML += `

        <tr>

            <td>${appointment.patientName}</td>

            <td>${appointment.doctorName}</td>

            <td>${appointment.department}</td>

            <td>${appointment.appointmentDate}</td>

            <td>${appointment.appointmentTime}</td>

            <td>
                <span class="status ${appointment.status.toLowerCase()}">
                ${appointment.status}
                </span>
            </td>

            <td class="actions">
                ${actions}
            </td>

        </tr>

        `;

    });

}

// ==========================================
// UPDATE STATUS
// ==========================================

window.updateStatus = async function(id, status){

    console.log("Updating:", id, status);

    try{

        await updateDoc(doc(db,"appointments",id),{

            status:status

        });

        console.log("Status updated.");

        loadAppointments();

    }

    catch(error){

        console.error("UPDATE ERROR:", error);

    }

}

// ==========================================
// SEARCH
// ==========================================

function filterAppointments(){

    const keyword = searchInput.value.toLowerCase();

    const status = statusFilter.value;

    const filtered = appointments.filter((appointment)=>{

        const matchesSearch =

            appointment.patientName.toLowerCase().includes(keyword) ||

            appointment.doctorName.toLowerCase().includes(keyword);

        const matchesStatus =

            status === "All" ||

            appointment.status === status;

        return matchesSearch && matchesStatus;

    });

    displayAppointments(filtered);

}

searchInput.addEventListener("input", filterAppointments);

statusFilter.addEventListener("change", filterAppointments);

// ==========================================
// LOGOUT
// ==========================================

document.getElementById("logoutBtn").addEventListener("click", async(e)=>{

    e.preventDefault();

    await signOut(auth);

    window.location.href="admin-login.html";

});