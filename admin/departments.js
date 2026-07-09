import { auth, db } from "../config/firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ===============================
// Elements
// ===============================

const form = document.getElementById("departmentForm");
const table = document.getElementById("departmentsTable");
const searchInput = document.getElementById("searchDepartment");

const departmentId = document.getElementById("departmentId");
const departmentName = document.getElementById("departmentName");
const description = document.getElementById("description");
const head = document.getElementById("head");
const formTitle = document.getElementById("formTitle");
const saveBtn = document.getElementById("saveBtn");

let departments = [];

// ===============================
// Authentication
// ===============================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "admin-login.html";
        return;

    }

    const adminRef = doc(db, "admins", user.uid);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {

        alert("Access denied.");

        await signOut(auth);

        window.location.href = "admin-login.html";

        return;

    }

    loadDepartments();

});

// ===============================
// Load Departments
// ===============================

async function loadDepartments() {

    table.innerHTML = `
        <tr>
            <td colspan="4">Loading departments...</td>
        </tr>
    `;

    departments = [];

    try {

        const snapshot = await getDocs(collection(db, "departments"));

        snapshot.forEach((document) => {

            departments.push({

                id: document.id,

                ...document.data()

            });

        });

        displayDepartments(departments);

    }

    catch (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    Failed to load departments.
                </td>
            </tr>
        `;

    }

}

// ===============================
// Display Departments
// ===============================

function displayDepartments(list) {

    table.innerHTML = "";

    if (list.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    No departments found.
                </td>
            </tr>
        `;

        return;

    }

    list.forEach((department) => {

        table.innerHTML += `

            <tr>

                <td>${department.name}</td>

                <td>${department.description}</td>

                <td>${department.head}</td>

                <td class="actions">

                    <button
                        class="edit-btn"
                        onclick="editDepartment('${department.id}')">

                        Edit

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteDepartment('${department.id}')">

                        Delete

                    </button>

                </td>

            </tr>

        `;

    });

}

// ===============================
// Add / Update Department
// ===============================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const departmentData = {

        name: departmentName.value.trim(),

        description: description.value.trim(),

        head: head.value.trim()

    };

    try {

        if (departmentId.value === "") {

            await addDoc(

                collection(db, "departments"),

                departmentData

            );

            alert("Department added successfully.");

        }

        else {

            await updateDoc(

                doc(db, "departments", departmentId.value),

                departmentData

            );

            alert("Department updated successfully.");

        }

        form.reset();

        departmentId.value = "";

        formTitle.textContent = "Add New Department";

        saveBtn.textContent = "Save Department";

        loadDepartments();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});

// ===============================
// Edit Department
// ===============================

window.editDepartment = function(id) {

    const department = departments.find(d => d.id === id);

    if (!department) return;

    departmentId.value = department.id;

    departmentName.value = department.name;

    description.value = department.description;

    head.value = department.head;

    formTitle.textContent = "Edit Department";

    saveBtn.textContent = "Update Department";

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

};

// ===============================
// Delete Department
// ===============================

window.deleteDepartment = async function(id) {

    const confirmDelete = confirm(

        "Delete this department?"

    );

    if (!confirmDelete) return;

    try {

        await deleteDoc(

            doc(db, "departments", id)

        );

        alert("Department deleted.");

        loadDepartments();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

};

// ===============================
// Search Departments
// ===============================

searchInput.addEventListener("input", () => {

    const keyword = searchInput.value.toLowerCase();

    const filtered = departments.filter((department) => {

        return (

            department.name.toLowerCase().includes(keyword) ||

            department.description.toLowerCase().includes(keyword) ||

            department.head.toLowerCase().includes(keyword)

        );

    });

    displayDepartments(filtered);

});

// ===============================
// Logout
// ===============================

document.getElementById("logoutBtn").addEventListener("click", async (e) => {

    e.preventDefault();

    if (confirm("Logout?")) {

        await signOut(auth);

        window.location.href = "admin-login.html";

    }

});