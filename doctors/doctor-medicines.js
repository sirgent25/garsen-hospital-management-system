import { auth, db }
from "../config/firebase.js";

import {
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    getDocs
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =======================
// Check Login
// =======================
onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href =
            "doctor-login.html";
        return;
    }

    loadMedicines();
});

// =======================
// Load Medicines
// =======================
async function loadMedicines() {

    const table =
        document.getElementById(
            "medicineTable"
        );

    table.innerHTML = "";

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "medicines"
                )
            );

        if (snapshot.empty) {

            table.innerHTML = `
                <tr>
                    <td colspan="5">
                        No medicines available.
                    </td>
                </tr>
            `;

            return;
        }

        snapshot.forEach((medicine) => {

            const data =
                medicine.data();

            table.innerHTML += `
                <tr>

                    <td>${data.medicineName}</td>

                    <td>${data.category}</td>

                    <td>${data.dosageForm}</td>

                    <td>${data.stock}</td>

                    <td>${data.expiryDate}</td>

                </tr>
            `;
        });

    }
    catch (error) {

        console.error(error);

    }
}

// =======================
// Search
// =======================
document
.getElementById(
    "searchMedicine"
)
.addEventListener(
    "keyup",
    function () {

        const search =
            this.value.toLowerCase();

        const rows =
            document.querySelectorAll(
                "#medicineTable tr"
            );

        rows.forEach((row) => {

            const text =
                row.innerText.toLowerCase();

            row.style.display =
                text.includes(search)
                    ? ""
                    : "none";
        });
    }
);

// =======================
// Logout
// =======================
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