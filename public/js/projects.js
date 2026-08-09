let editingProjectId = null;

// ==========================
// LOAD PROJECT PAGE
// ==========================

async function loadProjectsPage() {

    const response = await fetch("pages/projects.html");

    const html = await response.text();

    document.querySelector(".main-content").innerHTML = html;

    initializeProjectPage();

    await loadProjects();

}

// ==========================
// INITIALIZE
// ==========================

function initializeProjectPage() {

    const modal = document.getElementById("projectModal");

    document.getElementById("openProjectForm").onclick = () => {

        editingProjectId = null;

        document.getElementById("projectForm").reset();

        document.getElementById("projectModalTitle").innerText = "Create Project";

        document.getElementById("projectSubmitBtn").innerText = "Publish Project";

        modal.style.display = "flex";

    };

    document.getElementById("closeProjectModal").onclick = () => {

        modal.style.display = "none";

    };

    window.onclick = (e) => {

        if (e.target === modal) {

            modal.style.display = "none";

        }

    };

    document.getElementById("projectForm").onsubmit = (e) => {

        e.preventDefault();

        submitProject();

    };

}

// ==========================
// LOAD PROJECTS
// ==========================

async function loadProjects() {

    const response = await fetch("/projects");

    const projects = await response.json();

    const rows = document.getElementById("projectRows");

    rows.innerHTML = "";

    projects.forEach(project => {

        rows.innerHTML += `

        <tr>

            <td>${project.ProjectID}</td>

            <td>${project.Title}</td>

            <td>${project.TechStack || ""}</td>

            <td>

                <button onclick="editProject(${project.ProjectID})">✏️</button>

                <button onclick="deleteProject(${project.ProjectID})">🗑️</button>

            </td>

        </tr>

        `;

    });

}

// ==========================
// CREATE / UPDATE
// ==========================

async function submitProject() {

    const project = {

        title: document.getElementById("projectTitle").value,

        description: document.getElementById("projectDescription").value,

        features: document.getElementById("projectFeatures").value,

        techStack: document.getElementById("projectTechStack").value,

        category: document.getElementById("projectCategory").value,

        status: document.getElementById("projectStatus").value,

        duration: document.getElementById("projectDuration").value,

        githubURL: document.getElementById("projectGithubURL").value,

        demoURL: document.getElementById("projectDemoURL").value,

        imageURL: document.getElementById("projectImageURL").value

    };
    const url = editingProjectId
        ? `/projects/${editingProjectId}`
        : "/projects";

    const method = editingProjectId
        ? "PUT"
        : "POST";

    const response = await fetch(url, {

        method,

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify(project)

    });

    const data = await response.json();

    alert(data.message || data.error || "Something went wrong. Check the server terminal for details.");

    document.getElementById("projectModal").style.display = "none";

    loadProjects();

}

// ==========================
// EDIT
// ==========================

async function editProject(id) {

    const response = await fetch(`/projects/${id}`);

    const project = await response.json();

    editingProjectId = id;

    document.getElementById("projectTitle").value = project.Title;

    document.getElementById("projectDescription").value = project.Description;

    document.getElementById("projectTechStack").value = project.TechStack;

    document.getElementById("projectCategory").value = project.Category;

    document.getElementById("projectStatus").value = project.Status;

    document.getElementById("projectDuration").value = project.Duration;

    document.getElementById("projectFeatures").value = project.Features;

    document.getElementById("projectGithubURL").value = project.GithubURL;

    document.getElementById("projectDemoURL").value = project.DemoURL;

    document.getElementById("projectImageURL").value = project.ImageURL;

    document.getElementById("projectModalTitle").innerText = "Edit Project";

    document.getElementById("projectSubmitBtn").innerText = "Update Project";

    document.getElementById("projectModal").style.display = "flex";

}

// ==========================
// DELETE
// ==========================

async function deleteProject(id) {

    if (!confirm("Delete this project?")) return;

    const response = await fetch(`/projects/${id}`, {

        method: "DELETE"

    });

    const data = await response.json();

    alert(data.message || data.error || "Something went wrong. Check the server terminal for details.");

    loadProjects();

}