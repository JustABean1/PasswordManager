// ---------------------------
// SWITCH LOGIN/SIGNUP FORMS
// ---------------------------
function showSignup() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "block";
    document.getElementById("form-title").innerText = "Sign Up";
}

function showLogin() {
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("login-form").style.display = "block";
    document.getElementById("form-title").innerText = "Sign In";
}

// ---------------------------
// LOGIN
// ---------------------------
function login() {
    let username = document.getElementById("login-username").value;
    let password = document.getElementById("login-password").value;

    // TODO: AJAX CALL TO BACKEND (php/login.php)
    console.log("Login attempt:", username, password);

    // TEMP: auto-redirect for demo
    window.location.href = "dashboard.html";
}

// ---------------------------
// SIGNUP
// ---------------------------
function signup() {
    let username = document.getElementById("signup-username").value;
    let password = document.getElementById("signup-password").value;

    // TODO: AJAX CALL TO BACKEND (php/signup.php)
    console.log("Signup attempt:", username, password);

    // TEMP: after signup, switch back to login
    showLogin();
}

// ---------------------------
// LOAD PASSWORDS
// ---------------------------
function loadPasswords() {
    // TODO: AJAX CALL to fetch saved credentials (php/getPasswords.php)
    console.log("Fetching passwords...");

    // TEMP: fake data for testing
    let fakeData = [
        { site: "Google", username: "ben123", password: "mypassword123" },
        { site: "Facebook", username: "jackc", password: "hunter22" }
    ];

    let list = document.getElementById("password-list");
    list.innerHTML = "";

    fakeData.forEach(entry => {
        let item = document.createElement("div");
        item.classList.add("list-item");
        item.innerHTML = `
            <div class="entry-text">
                <strong>${entry.site}</strong><br>
                ${entry.username} —
                <span class="pwd" data-password="${entry.password}">•••••••</span>
                <span class="eye" onclick="togglePassword(this)">👁️</span>
            </div>
            <button class="delete-btn" onclick="deletePassword('${entry.site}')">Delete</button>
        `;
        list.appendChild(item);
    });
}

// Load passwords automatically if on dashboard page
if (window.location.pathname.includes("dashboard.html")) {
    loadPasswords();
}

// ---------------------------
// ADD PASSWORD
// ---------------------------
function addPassword() {
    let site = document.getElementById("site").value;
    let username = document.getElementById("site-username").value;
    let password = document.getElementById("site-password").value;

    // TODO: AJAX call to php/addPassword.php
    console.log("Adding password:", site, username, password);

    // TEMP: refresh list
    loadPasswords();

    // Clear form fields
    document.getElementById("site").value = "";
    document.getElementById("site-username").value = "";
    document.getElementById("site-password").value = "";
}

// ---------------------------
// DELETE PASSWORD
// ---------------------------
function deletePassword(site) {
    // TODO: AJAX call to php/deletePassword.php
    console.log("Deleting:", site);

    // TEMP: refresh list
    loadPasswords();
}

// ---------------------------
// TOGGLE PASSWORD VISIBILITY
// ---------------------------
function togglePassword(icon) {
    const span = icon.previousElementSibling;

    if (span.innerText === "•••••••") {
        // Show password
        span.innerText = span.dataset.password;
        icon.innerText = "🙈";
    } else {
        // Hide password
        span.innerText = "•••••••";
        icon.innerText = "👁️";
    }
}