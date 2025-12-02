// ---------------------------
// SWITCH LOGIN/SIGNUP FORMS
// ---------------------------
function showSignup() {
    console.log('showSignup invoked');
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "block";
    document.getElementById("form-title").innerText = "Sign Up";
}

function showLogin() {
    console.log('showLogin invoked');
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("login-form").style.display = "block";
    document.getElementById("form-title").innerText = "Sign In";
}

// ---------------------------
// LOGIN
// ---------------------------
async function login() {
    let username = document.getElementById("login-username").value;
    let password = document.getElementById("login-password").value;
    console.log("Login attempt:", username, password);

    //AJAX CALL TO BACKEND (maybe I could make this a single function for both login and signup?)
    const formData = new FormData();
    formData.append("action", "login");
    formData.append("username", username);
    formData.append("password", password);

    try {
        const response = await fetch("api.php", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        console.log("Server response:", result);

        if (result.success) {
            alert("Logged in!");
        } else {
            alert(result.message);
        }

    } catch (error) {
        console.error("Request failed:", error);
    }      
            
    // TEMP: auto-redirect for demo
    //window.location.href = "dashboard.html";
}

// ---------------------------
// SIGNUP
// ---------------------------
async function signup() {
    let username = document.getElementById("signup-username").value;
    let password = document.getElementById("signup-password").value;

    console.log("Signup attempt:", username, password);
    //AJAX CALL TO BACKEND
    const formData = new FormData();
    formData.append("action", "signup");
    formData.append("username", username);
    formData.append("password", password);

    try {
        const response = await fetch("api.php", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        console.log("Server response:", result);

        if (result.success) {
            alert("Signed up! Please log in.");
            showLogin();
        } else {
            alert(result.message);
        }

    } catch (error) {
        console.error("Request failed:", error);
    }
    

    // TEMP: after signup, switch back to login
    //showLogin();
}

// ---------------------------
// LOAD PASSWORDS
// ---------------------------
async function loadPasswords() {
    //AJAX CALL to fetch saved credentials
    console.log("Fetching passwords...");

    let list = document.getElementById("password-list");
    list.innerHTML = "";

    const formData = new FormData();
    formData.append("action", "loadPasswords");

    try {
        const response = await fetch("api.php", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        console.log("Server returned:", data);

        if (!data.success) {
            list.innerHTML = "<p>Error loading passwords.</p>";
            return;
        }
    // data should contain a `passwords` array returned from the API
    const passwords = data.passwords || [];

    //no longer using fake data (actually display the credentials)
    passwords.forEach(entry => {
        let item = document.createElement("div");
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
        console.error("Request failed:", error);
    }
}

// Load passwords automatically if on dashboard page
if (window.location.pathname.includes("dashboard.html")) {
    loadPasswords();
}

// ---------------------------
// ADD PASSWORD
// ---------------------------
//I think add/delete could also be combined into a single function with parameters, but that seems harder to debug
async function addPassword() {
    let site = document.getElementById("site").value;
    let username = document.getElementById("site-username").value;
    let password = document.getElementById("site-password").value;

    //AJAX call to php backend
    console.log("Adding password:", site, username, password);
    const formData = new FormData();
    formData.append("action", "addPassword");
    formData.append("site", site);
    // backend expects fields `site_user` & `site_pass`
    formData.append("site_user", username);
    formData.append("site_pass", password);

    try {
        const response = await fetch("api.php", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        console.log("Server response:", result);

        if (result.success) {
            //refresh list
            loadPasswords();

        //clear form fields
        document.getElementById("site").value = "";
        document.getElementById("site-username").value = "";
        document.getElementById("site-password").value = "";
        } else {
            alert(result.message);
        }

    } catch (error) {
        console.error("Request failed:", error);
    }

}

// ---------------------------
// DELETE PASSWORD
// ---------------------------
async function deletePassword(site) {
    formData.append("action", "deletePassword");
    // API expects `site_id` as the id of the row to delete
    formData.append("site_id", siteId);

    try {
        const response = await fetch("api.php", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        console.log("Server response:", result);

        if (result.success) {
            //refresh list
            loadPasswords();

        //clear form fields
        document.getElementById("site").value = "";
        document.getElementById("site-username").value = "";
        document.getElementById("site-password").value = "";
        } else {
            alert(result.message);
        }

    } catch (error) {
        console.error("Request failed:", error);
    }
    console.log("Deleting id:", siteId);
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

// Ensure functions are available on the window object for inline onclick handlers (robustness)
if (typeof window !== 'undefined') {
    window.showSignup = showSignup;
    window.showLogin = showLogin;
    window.login = login;
    window.signup = signup;
    window.addPassword = addPassword;
    window.deletePassword = deletePassword;
    window.togglePassword = togglePassword;
    window.loadPasswords = loadPasswords;
}

// Fallback: add event listeners if inline handlers fail or script isn't part of the global scope
function attachSwitchHandlers() {
    try {
        const loginSwitch = document.querySelector('#login-form .switch');
        if (loginSwitch) {
            // Remove inline onclick to avoid ReferenceError if function is not global
            loginSwitch.removeAttribute('onclick');
            loginSwitch.addEventListener('click', showSignup);
        }

        const signupSwitch = document.querySelector('#signup-form .switch');
        if (signupSwitch) {
            // Remove inline onclick to avoid ReferenceError if function is not global
            signupSwitch.removeAttribute('onclick');
            signupSwitch.addEventListener('click', showLogin);
        }
    } catch (e) {
        // silently ignore if DOM isn't exactly as expected
        console.warn('Fallback event listeners not attached', e);
    }
}

// If DOM already loaded, run immediately, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachSwitchHandlers);
} else {
    attachSwitchHandlers();
}