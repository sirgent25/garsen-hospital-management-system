import { auth, db }
from "../config/firebase.js";

import {
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let doctorId = "";

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href =
            "doctor-login.html";
        return;
    }

    const doctorSnap =
        await getDoc(
            doc(
                db,
                "doctorUsers",
                user.uid
            )
        );

    if (!doctorSnap.exists()) {

        await signOut(auth);

        window.location.href =
            "doctor-login.html";

        return;
    }

    doctorId =
        doctorSnap.data().doctorId;

    loadPatients();
});

// ============================
// Load Patients
// ============================
async function loadPatients() {

    const table =
        document.getElementById(
            "patientsTable"
        );

    table.innerHTML = "";

    try {

        const appointments =
            await getDocs(
                query(
                    collection(
                        db,
                        "appointments"
                    ),
                    where(
                        "doctorId",
                        "==",
                        doctorId
                    )
                )
            );

        if (appointments.empty) {

            table.innerHTML = `
                <tr>
                    <td colspan="4">
                        No patients found.
                    </td>
                </tr>
            `;

            return;
        }

        const patientMap =
            new Map();

        appointments.forEach((doc) => {

            const data =
                doc.data();

            if (
                !patientMap.has(
                    data.patientId
                )
            ) {

                patientMap.set(
                    data.patientId,
                    {
                        name:
                            data.patientName,
                        email:
                            data.patientEmail,
                        phone:
                            data.patientPhone ||
                            "N/A",
                        appointments: 1
                    }
                );

            } else {

                patientMap.get(
                    data.patientId
                ).appointments++;

            }
        });

        patientMap.forEach(
            (patient) => {

                table.innerHTML += `
                    <tr>

                        <td>
                            ${patient.name}
                        </td>

                        <td>
                            ${patient.email}
                        </td>

                        <td>
                            ${patient.phone}
                        </td>

                        <td>
                            ${patient.appointments}
                        </td>

                    </tr>
                `;
            }
        );

    }
    catch (error) {

        console.error(error);

    }
}

// ============================
// Logout
// ============================
document
.getElementById(
    "logoutBtn"
)
.addEventListener(
    "click",
    async () => {

        await signOut(auth);

        window.location.href =
            "doctor-login.html";

    }
);