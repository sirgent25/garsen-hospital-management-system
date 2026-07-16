import { auth, db } from "../config/firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    getDocs,
    addDoc,
    query,
    where,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let doctorId = "";
let doctorName = "";

// =================================
// Check Login
// =================================
onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "doctor-login.html";
        return;
    }

    try {

        const doctorRef =
            doc(db, "doctorUsers", user.uid);

        const doctorSnap =
            await getDoc(doctorRef);

        if (!doctorSnap.exists()) {

            await signOut(auth);

            window.location.href =
                "doctor-login.html";

            return;
        }

        const doctor =
            doctorSnap.data();

        doctorId = doctor.doctorId;
        doctorName = doctor.fullName;

        await loadPatients();
        await loadMedicines();
        await loadPrescriptions();

    }
    catch (error) {

        console.error(error);

    }

});

// =================================
// Load Patients
// =================================
async function loadPatients() {

    const patientSelect =
        document.getElementById(
            "patientSelect"
        );

    patientSelect.innerHTML = `
        <option value="">
            Select Patient
        </option>
    `;

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

        const patients =
            new Map();

        appointments.forEach((doc) => {

            const data =
                doc.data();

            if (
                !patients.has(
                    data.patientId
                )
            ) {

                patients.set(
                    data.patientId,
                    data.patientName
                );

            }

        });

        patients.forEach(
            (name, id) => {

                patientSelect.innerHTML += `
                    <option value="${id}">
                        ${name}
                    </option>
                `;
            }
        );

    }
    catch (error) {

        console.error(error);

    }

}

// =================================
// Load Medicines
// =================================
async function loadMedicines() {

    const medicineSelect =
        document.getElementById(
            "medicineSelect"
        );

    medicineSelect.innerHTML = `
        <option value="">
            Select Medicine
        </option>
    `;

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "medicines"
                )
            );

        snapshot.forEach(
            (medicine) => {

                const data =
                    medicine.data();

                medicineSelect.innerHTML += `
                    <option
                        value="${medicine.id}"
                    >
                        ${data.medicineName}
                    </option>
                `;
            }
        );

    }
    catch (error) {

        console.error(error);

    }

}

// =================================
// Save Prescription
// =================================
document
.getElementById(
    "prescriptionForm"
)
.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        try {

            const patientId =
                document.getElementById(
                    "patientSelect"
                ).value;

            const medicineId =
                document.getElementById(
                    "medicineSelect"
                ).value;

            const dosage =
                document.getElementById(
                    "dosage"
                ).value;

            const instructions =
                document.getElementById(
                    "instructions"
                ).value;

            const patientRef =
                doc(
                    db,
                    "patients",
                    patientId
                );

            const patientSnap =
                await getDoc(
                    patientRef
                );

            const patient =
                patientSnap.data();

            const medicineRef =
                doc(
                    db,
                    "medicines",
                    medicineId
                );

            const medicineSnap =
                await getDoc(
                    medicineRef
                );

            const medicine =
                medicineSnap.data();

            await addDoc(
                collection(
                    db,
                    "prescriptions"
                ),
                {
                    patientId:
                        patientId,

                    patientName:
                        patient.fullName,

                    doctorId:
                        doctorId,

                    doctorName:
                        doctorName,

                    medicineId:
                        medicineId,

                    medicineName:
                        medicine.medicineName,

                    dosage:
                        dosage,

                    instructions:
                        instructions,

                    prescriptionDate:
                        new Date()
                        .toISOString()
                        .split("T")[0],

                    status:
                        "Active"
                }
            );

            alert(
                "Prescription saved successfully."
            );

            document
                .getElementById(
                    "prescriptionForm"
                )
                .reset();

            loadPrescriptions();

        }
        catch (error) {

            console.error(error);

            alert(error.message);

        }

    }
);

// =================================
// Load Prescriptions
// =================================
async function loadPrescriptions() {

    const table =
        document.getElementById(
            "prescriptionsTable"
        );

    table.innerHTML = "";

    try {

        const snapshot =
            await getDocs(
                query(
                    collection(
                        db,
                        "prescriptions"
                    ),
                    where(
                        "doctorId",
                        "==",
                        doctorId
                    )
                )
            );

        if (snapshot.empty) {

            table.innerHTML = `
                <tr>
                    <td colspan="4">
                        No prescriptions found.
                    </td>
                </tr>
            `;

            return;
        }

        snapshot.forEach(
            (prescription) => {

                const data =
                    prescription.data();

                table.innerHTML += `
                    <tr>

                        <td>
                            ${data.patientName}
                        </td>

                        <td>
                            ${data.medicineName}
                        </td>

                        <td>
                            ${data.dosage}
                        </td>

                        <td>
                            ${data.prescriptionDate}
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

// =================================
// Logout
// =================================
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