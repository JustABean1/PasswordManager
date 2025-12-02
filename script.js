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

document.querySelectorAll(".switch").forEach(elem => {
    elem.addEventListener("click", () => {
        if (elem.innerText.includes("Sign Up")) showSignup();
        else showLogin();
    });
});

// ---------------------------
// LOGIN
// ---------------------------
async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const formData = new FormData();
    formData.append("action", "login");
    formData.append("username", username);
    formData.append("password", password);

    try {
        const response = await fetch("api.php", { method: "POST", body: formData });
        const result = await response.json();

        if (result.success) {
            // redirect to dashboard
            window.location.href = "dashboard.html";
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Login failed:", error);
    }
}

// ---------------------------
// SIGNUP
// ---------------------------
async function signup() {
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    const formData = new FormData();
    formData.append("action", "signup");
    formData.append("username", username);
    formData.append("password", password);

    try {
        const response = await fetch("api.php", { method: "POST", body: formData });
        const result = await response.json();

        if (result.success) {
            alert("Signed up! Please log in.");
            showLogin();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Signup failed:", error);
    }
}

// ---------------------------
// PASSWORD MANAGEMENT
// ---------------------------
async function loadPasswords() {
    const formData = new FormData();
    formData.append("action", "loadPasswords");

    try {
        const response = await fetch("api.php", { method: "POST", body: formData });
        const data = await response.json();

        const list = document.getElementById("password-list");
        if (!list) return;

        list.innerHTML = "";

        if (!data.success) {
            list.innerHTML = "<p>Error loading passwords.</p>";
            return;
        }

        data.passwords.forEach(entry => {
            const item = document.createElement("div");
            item.classList.add("list-item");
            item.innerHTML = `
                <div class="entry-text">
                    <strong>${entry.site}</strong><br>
                    ${entry.site_user} —
                    <span class="pwd" data-password="${entry.site_pass}">•••••••</span>
                    <span class="eye" onclick="togglePassword(this)">👁️</span>
                </div>
                <button class="delete-btn" onclick="deletePassword(${entry.id})">Delete</button>
            `;
            list.appendChild(item);
        });

    } catch (error) {
        console.error("Failed to load passwords:", error);
    }
}

async function addPassword() {
    const site = document.getElementById("site").value;
    const site_user = document.getElementById("site-username").value;
    const site_pass = document.getElementById("site-password").value;

    const formData = new FormData();
    formData.append("action", "addPassword");
    formData.append("site", site);
    formData.append("site_user", site_user);
    formData.append("site_pass", site_pass);

    try {
        const response = await fetch("api.php", { method: "POST", body: formData });
        const result = await response.json();

        if (result.success) {
            loadPasswords();
            document.getElementById("site").value = "";
            document.getElementById("site-username").value = "";
            document.getElementById("site-password").value = "";
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Add password failed:", error);
    }
}

async function deletePassword(siteId) {
    const formData = new FormData();
    formData.append("action", "deletePassword");
    formData.append("site_id", siteId);

    try {
        const response = await fetch("api.php", { method: "POST", body: formData });
        const result = await response.json();

        if (result.success) {
            loadPasswords();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Delete password failed:", error);
    }
}

function togglePassword(icon) {
    const span = icon.previousElementSibling;

    if (span.innerText === "•••••••") {
        span.innerText = span.dataset.password;
        icon.innerText = "🙈";
    } else {
        span.innerText = "•••••••";
        icon.innerText = "👁️";
    }
}
