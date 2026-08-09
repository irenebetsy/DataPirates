// LOGIN

let editingBlogId = null;

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("email").value.trim();

        const password = document.getElementById("password").value;

        try {

            const response = await fetch("/auth/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })

            });

            const data = await response.json();

            console.log(data);

            if (data.success) {

                localStorage.setItem("loggedIn", "true");

                localStorage.setItem("user", JSON.stringify(data.user));

                window.location.href = "dashboard.html";

            }

            else {

                document.getElementById("message").innerText = data.message;

            }

        }

        catch (err) {

            console.error(err);

            document.getElementById("message").innerText =
                "Unable to connect to server.";

        }

    });

}
// Protect Dashboard

if (window.location.pathname.includes("dashboard.html")) {

    if (localStorage.getItem("loggedIn") !== "true") {

        window.location = "login.html";

    }

}

// Logout

const logout = document.getElementById("logout");

if (logout) {

    logout.onclick = () => {

        localStorage.removeItem("loggedIn");

        window.location = "login.html";

    };

}

async function loadPage(page){

    if(page==="dashboard"){

        document.getElementById("content").innerHTML=`

            <h1>Dashboard</h1>

            <p>Welcome back, Captain! 🏴‍☠️</p>

        `;

        return;

    }

    const response=await fetch(`pages/${page}.html`);

    const html=await response.text();

    document.getElementById("content").innerHTML=html;

}

// ==========================
// LOAD BLOG PAGE
// ==========================

async function loadBlogsPage() {

    const response = await fetch("pages/blogs.html");

    const html = await response.text();

    document.querySelector(".main-content").innerHTML = html;

    initializeBlogPage();

    await loadBlogs();

}
// ==========================
// BLOG PAGE EVENTS
// ==========================

function initializeBlogPage() {

    const modal = document.getElementById("blogModal");

    const openBtn = document.getElementById("openBlogForm");

    const closeBtn = document.getElementById("closeModal");

    openBtn.onclick = () => {

        modal.style.display = "flex";

    };

    closeBtn.onclick = () => {

        modal.style.display = "none";

    };

    window.onclick = (e) => {

        if (e.target === modal) {

            modal.style.display = "none";

        }

    };

    document.getElementById("blogForm").onsubmit = (e) => {
    e.preventDefault();
    submitBlog();
    };

}

async function submitBlog() {

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const content = document.getElementById("blogContent").value;
    const imageURL = document.getElementById("imageURL").value;

    // If editing -> PUT
    // If new -> POST

    const url = editingBlogId
        ? `/blogs/${editingBlogId}`
        : "/blogs";

    const method = editingBlogId
        ? "PUT"
        : "POST";

    const response = await fetch(url, {

        method,

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            title,
            description,
            content,
            imageURL
        })

    });

    const data = await response.json();

    alert(data.message || data.error || "Something went wrong. Check the server terminal for details.");

    editingBlogId = null;

    document.getElementById("blogForm").reset();

    document.getElementById("blogModal").style.display = "none";

    loadBlogs();

}


// ==========================
// LOAD BLOGS
// ==========================

async function loadBlogs() {

    const response = await fetch("/blogs");

    const blogs = await response.json();

    const blogRows = document.getElementById("blogRows");

    blogRows.innerHTML = "";

    blogs.forEach(blog => {

        blogRows.innerHTML += `

        <tr>

            <td>${blog.BlogID}</td>

            <td>${blog.Title}</td>

            <td>${new Date(blog.CreatedAt).toLocaleDateString()}</td>

            <td>

                <button onclick="editBlog(${blog.BlogID})">
                    ✏️
                </button>

                <button onclick="deleteBlog(${blog.BlogID})">
                    🗑️
                </button>

            </td>

        </tr>

        `;

    });

}

async function editBlog(id) {

    const response = await fetch(`/blogs/${id}`);

    const blog = await response.json();

    editingBlogId = id;

    document.getElementById("title").value = blog.Title;
    document.getElementById("description").value = blog.Description;
    document.getElementById("blogContent").value = blog.Content;
    document.getElementById("imageURL").value = blog.ImageURL;
    document.getElementById("modalTitle").innerText = "Edit Blog";
    document.getElementById("submitBtn").innerText = "Update Blog";
    document.getElementById("blogModal").style.display = "flex";

}

async function deleteBlog(id) {

    const ok = confirm("Delete this blog?");

    if (!ok) return;

    const response = await fetch(`/blogs/${id}`, {

        method: "DELETE"

    });

    const data = await response.json();

    alert(data.message || data.error || "Something went wrong. Check the server terminal for details.");

    loadBlogs();

}