import { auth, db } from "./config/firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ===========================
// Check Login
// ===========================

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    await loadPrescriptions(user.uid);
});

// ===========================
// Load Prescriptions
// ===========================

async function loadPrescriptions(patientId) {

    const table =
        document.getElementById(
            "prescriptionsTable"
        );

    table.innerHTML = "";

    try {

        const q = query(
            collection(db, "prescriptions"),
            where("patientId", "==", patientId)
        );

        const snapshot =
            await getDocs(q);

        if (snapshot.empty) {

            table.innerHTML = `
                <tr>
                    <td colspan="6">
                        No prescriptions found.
                    </td>
                </tr>
            `;

            return;
        }

        snapshot.forEach((prescription) => {

            const data =
                prescription.data();

            const statusClass =
                `${data.status.toLowerCase()}-status`;

            table.innerHTML += `

                <tr>

                    <td>
                        ${data.doctorName}
                    </td>

                    <td>
                        ${data.medicineName}
                    </td>

                    <td>
                        ${data.dosage}
                    </td>

                    <td>
                        ${data.instructions}
                    </td>

                    <td>
                        ${data.prescriptionDate}
                    </td>

                    <td class="${statusClass}">
                        ${data.status}
                    </td>

                </tr>

            `;
        });

    }
    catch (error) {

        console.error(
            "Error loading prescriptions:",
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    Failed to load prescriptions.
                </td>
            </tr>
        `;
    }
}

// ===========================
// Logout
// ===========================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async (e) => {

            e.preventDefault();

            if (
                confirm(
                    "Are you sure you want to logout?"
                )
            ) {

                await signOut(auth);

                window.location.href =
                    "login.html";
            }
        }
    );
}