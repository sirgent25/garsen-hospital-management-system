import { auth, db } from "../config/firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ===================================
// Elements
// ===================================


// ===================================
// Elements
// ===================================

const form = document.getElementById("doctorForm");

const doctorId = document.getElementById("doctorId");

const fullName = document.getElementById("fullName");

const email = document.getElementById("email");

const phone = document.getElementById("phone");

const departmentSelect = document.getElementById("department");

const specialization = document.getElementById("specialization");

const status = document.getElementById("status");

const saveBtn = document.getElementById("saveBtn");

const formTitle = document.getElementById("formTitle");

const doctorsTable = document.getElementById("doctorsTable");

const searchDoctor = document.getElementById("searchDoctor");

const logoutBtn = document.getElementById("logoutBtn");

let doctors = [];

// ===================================
// Authentication
// ===================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "admin-login.html";
        return;
    }

    try {

        console.log("Logged in:", user.uid);

        const adminRef = doc(db, "admins", user.uid);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {

            alert("Access denied.");

            await signOut(auth);

            window.location.href = "admin-login.html";

            return;

        }

        console.log("Admin authenticated.");

       await loadDepartments();
await loadDoctors();

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

});

// ===================================
// Load Departments
// ===================================

async function loadDepartments() {

    console.log("Loading departments...");

    try {

        departmentSelect.innerHTML = `
            <option value="">
                Select Department
            </option>
        `;

        const snapshot = await getDocs(
            collection(db, "departments")
        );

        console.log("Documents found:", snapshot.size);

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            console.log(data);

            const option = window.document.createElement("option");

            option.value = data.name;
            option.textContent = data.name;

            departmentSelect.appendChild(option);

        });

        console.log("Departments loaded successfully.");

    } catch (error) {

        console.error("Load Department Error:", error);

        alert(error.message);

    }

}
// ===================================
// Load Doctors
// ===================================

async function loadDoctors() {

    doctors = [];

    doctorsTable.innerHTML = `
        <tr>
            <td colspan="7">Loading doctors...</td>
        </tr>
    `;

    try {

        const snapshot = await getDocs(collection(db, "doctors"));

        doctorsTable.innerHTML = "";

        if (snapshot.empty) {

            doctorsTable.innerHTML = `
                <tr>
                    <td colspan="7">No doctors found.</td>
                </tr>
            `;

            return;

        }

        snapshot.forEach((docSnap) => {

            doctors.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });

        displayDoctors();

    }

    catch (error) {

        console.error(error);

    }

}
// ===================================
// Display Doctors
// ===================================
function displayDoctors(list = doctors) {

    doctorsTable.innerHTML = "";

    if (list.length === 0) {

        doctorsTable.innerHTML = `
        <tr>
            <td colspan="7">No doctors found.</td>
        </tr>
        `;

        return;

    }

    list.forEach((doctor) => {

        doctorsTable.innerHTML += `

        <tr>

            <td>${doctor.fullName}</td>

            <td>${doctor.department}</td>

            <td>${doctor.specialization}</td>

            <td>${doctor.email}</td>

            <td>${doctor.phone}</td>

            <td>

                <span class="status ${doctor.status.toLowerCase().replace(/\s/g,"-")}">

                    ${doctor.status}

                </span>

            </td>

            <td>

                <button class="edit-btn"
                        onclick="editDoctor('${doctor.id}')">

                    Edit

                </button>

                <button class="delete-btn"
                        onclick="deleteDoctor('${doctor.id}')">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}
window.editDoctor = async function(id){

    const doctor = doctors.find(d => d.id === id);

    if(!doctor) return;

    doctorId.value = doctor.id;

    fullName.value = doctor.fullName;

    email.value = doctor.email;

    phone.value = doctor.phone;

    departmentSelect.value = doctor.department;

    specialization.value = doctor.specialization;

    status.value = doctor.status;

    formTitle.textContent = "Edit Doctor";

    saveBtn.textContent = "Update Doctor";

}

// ===================================
// Save Doctor
// ===================================
form.addEventListener("submit", async(e)=>{

    e.preventDefault();

    try{

        const doctorData={

            fullName:fullName.value.trim(),

            email:email.value.trim(),

            phone:phone.value.trim(),

            department:departmentSelect.value,

            specialization:specialization.value.trim(),

            status:status.value

        };

        if(doctorId.value===""){

            doctorData.createdAt=serverTimestamp();

            await addDoc(collection(db,"doctors"),doctorData);

            alert("Doctor added successfully.");

        }

        else{

            await updateDoc(

                doc(db,"doctors",doctorId.value),

                doctorData

            );

            alert("Doctor updated successfully.");

        }

        form.reset();

        doctorId.value="";

        formTitle.textContent="Add New Doctor";

        saveBtn.textContent="Save Doctor";

        await loadDoctors();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

});
window.deleteDoctor = async function(id){

    if(!confirm("Delete this doctor?")) return;

    try{

        await deleteDoc(doc(db,"doctors",id));

        await loadDoctors();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}
searchDoctor.addEventListener("keyup",()=>{

    const keyword=searchDoctor.value.toLowerCase();

    const filtered=doctors.filter((doctor)=>{

        return(

            doctor.fullName.toLowerCase().includes(keyword)||

            doctor.department.toLowerCase().includes(keyword)||

            doctor.specialization.toLowerCase().includes(keyword)

        );

    });

    displayDoctors(filtered);

});


// ===================================
// Logout
// ===================================

logoutBtn.addEventListener("click", async (e) => {

    e.preventDefault();

    if (confirm("Logout?")) {

        await signOut(auth);

        window.location.href = "admin-login.html";

    }

});

