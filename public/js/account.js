// ==========================
// PUBLIC USER ACCOUNT (register / login / logout)
// Stored under "siteUser" in localStorage - separate from the
// admin "loggedIn"/"user" keys used by the CMS dashboard.
// ==========================

function getSiteUser() {

    const raw = localStorage.getItem("siteUser");

    return raw ? JSON.parse(raw) : null;

}

function setSiteUser(user) {

    localStorage.setItem("siteUser", JSON.stringify(user));

}

function clearSiteUser() {

    localStorage.removeItem("siteUser");

}

// REGISTER FORM

const userRegisterForm = document.getElementById("userRegisterForm");

if (userRegisterForm) {

    userRegisterForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {

            const response = await fetch("/users/register", {

                method: "POST",

                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({ name, email, password })

            });

            const data = await response.json();

            if (data.success) {

                setSiteUser(data.user);

                window.location.href = "index.html";

            } else {

                document.getElementById("message").innerText = data.message;

            }

        } catch (err) {

            console.error(err);

            document.getElementById("message").innerText = "Unable to connect to server.";

        }

    });

}

// LOGIN FORM

const userLoginForm = document.getElementById("userLoginForm");

if (userLoginForm) {

    userLoginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {

            const response = await fetch("/users/login", {

                method: "POST",

                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({ email, password })

            });

            const data = await response.json();

            if (data.success) {

                setSiteUser(data.user);

                window.location.href = "index.html";

            } else {

                document.getElementById("message").innerText = data.message;

            }

        } catch (err) {

            console.error(err);

            document.getElementById("message").innerText = "Unable to connect to server.";

        }

    });

}

// FORGOT PASSWORD FORM

const forgotPasswordForm = document.getElementById("forgotPasswordForm");

if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("email").value.trim();

        const messageEl = document.getElementById("message");

        try {

            const response = await fetch("/users/forgot-password", {

                method: "POST",

                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({ email })

            });

            const data = await response.json();

            messageEl.innerText = data.message;

        } catch (err) {

            console.error(err);

            messageEl.innerText = "Unable to connect to server.";

        }

    });

}

// RESET PASSWORD FORM

const resetPasswordForm = document.getElementById("resetPasswordForm");

if (resetPasswordForm) {

    const token = new URLSearchParams(window.location.search).get("token");

    resetPasswordForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const messageEl = document.getElementById("message");

        if (!token) {

            messageEl.innerText = "Missing or invalid reset link.";

            return;

        }

        if (newPassword !== confirmPassword) {

            messageEl.innerText = "Passwords do not match.";

            return;

        }

        try {

            const response = await fetch("/users/reset-password", {

                method: "POST",

                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({ token, newPassword })

            });

            const data = await response.json();

            messageEl.innerText = data.message;

            if (data.success) {

                setTimeout(() => {
                    window.location.href = "account-login.html";
                }, 1500);

            }

        } catch (err) {

            console.error(err);

            messageEl.innerText = "Unable to connect to server.";

        }

    });

}

// ==========================
// NAVBAR AUTH AREA
// Renders Sign In / Sign Up, or "Hi, Name" + Logout, in any page
// that has a <div id="userAuthArea"></div> in its navbar.
// ==========================

function renderUserAuthArea() {

    const area = document.getElementById("userAuthArea");

    if (!area) return;

    const user = getSiteUser();

    if (user) {

        area.innerHTML = `
            <span class="user-greeting">Hi, ${user.name}</span>
            <a href="#" id="siteUserLogout" class="login-btn">Logout</a>
        `;

        document.getElementById("siteUserLogout").onclick = (e) => {

            e.preventDefault();

            clearSiteUser();

            window.location.reload();

        };

    } else {

        area.innerHTML = `
            <a href="account-login.html" class="login-btn">Sign In</a>
            <a href="account-register.html" class="login-btn">Sign Up</a>
        `;

    }

}

renderUserAuthArea();
