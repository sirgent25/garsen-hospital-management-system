import { auth, db } from "./config/firebase.js";

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
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ===============================
// Check Login
// ===============================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    await loadPatient(user);

    await loadDashboard(user);

});

// ===============================
// Load Patient Name
// ===============================

async function loadPatient(user) {

    try {

        const patientRef = doc(db, "patients", user.uid);

        const patientSnap = await getDoc(patientRef);

        if (patientSnap.exists()) {

            const patient = patientSnap.data();

            document.getElementById("userName").textContent =
                patient.fullName || patient.fullname;

        }

    }

    catch(error){

        console.error(error);

    }

}

// ===============================
// Dashboard
// ===============================

async function loadDashboard(user){

    try{

        const q = query(

            collection(db,"appointments"),

            where("patientId","==",user.uid),

            orderBy("createdAt","desc")

        );

        const snapshot = await getDocs(q);

        document.getElementById("totalAppointments").textContent =
            snapshot.size;

        const table = document.getElementById("activityTable");

        table.innerHTML="";

        if(snapshot.empty){

            table.innerHTML=`
                <tr>
                    <td colspan="4">
                        No appointments found.
                    </td>
                </tr>
            `;

            return;

        }

        let firstAppointment = true;

        snapshot.forEach((docSnap)=>{

            const appointment = docSnap.data();

            if(firstAppointment){

                document.getElementById("appointmentDate").textContent =
                    appointment.appointmentDate;

                document.getElementById("appointmentTime").textContent =
                    appointment.appointmentTime;

                document.getElementById("appointmentDepartment").textContent =
                    appointment.department;

                document.getElementById("doctorName").textContent =
                    appointment.doctorName;

                document.getElementById("doctorSpecialization").textContent =
                    appointment.specialization;

                document.getElementById("doctorStatus").textContent =
                    appointment.status;

                firstAppointment=false;

            }

            table.innerHTML += `

                <tr>

                    <td>${appointment.appointmentDate}</td>

                    <td>${appointment.doctorName}</td>

                    <td>${appointment.department}</td>

                    <td class="${appointment.status.toLowerCase()}">

                        ${appointment.status}

                    </td>

                </tr>

            `;

        });

    }

    catch(error){

        console.error(error);

    }

}

// ===============================
// Logout
// ===============================

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async(e)=>{

    e.preventDefault();

    if(confirm("Are you sure you want to logout?")){

        await signOut(auth);

        window.location.href="login.html";

    }

});