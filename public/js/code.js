let editingCodeId = null;

// ==========================
// LOAD CODE PAGE
// ==========================

async function loadCodePage() {

    const response = await fetch("pages/code.html");

    const html = await response.text();

    document.querySelector(".main-content").innerHTML = html;

    initializeCodePage();

    await loadCodeList();

}

// ==========================
// INITIALIZE
// ==========================

function initializeCodePage() {

    const modal = document.getElementById("codeModal");

    document.getElementById("openCodeForm").onclick = () => {

        editingCodeId = null;

        document.getElementById("codeForm").reset();

        document.getElementById("codeModalTitle").innerText = "Add Code Snippet";

        document.getElementById("codeSubmitBtn").innerText = "Save Snippet";

        modal.style.display = "flex";

    };

    document.getElementById("closeCodeModal").onclick = () => {

        modal.style.display = "none";

    };

    window.onclick = (e) => {

        if (e.target === modal) {

            modal.style.display = "none";

        }

    };

    document.getElementById("codeForm").onsubmit = (e) => {

        e.preventDefault();

        submitCode();

    };

}

// ==========================
// LOAD LIST
// ==========================

async function loadCodeList() {

    const response = await fetch("/code");

    const snippets = await response.json();

    const rows = document.getElementById("codeRows");

    rows.innerHTML = "";

    snippets.forEach(item => {

        rows.innerHTML += `

        <tr>

            <td>${item.CodeID}</td>

            <td>${item.Title}</td>

            <td>${item.Language || ""}</td>

            <td>

                <button onclick="editCodeItem(${item.CodeID})">✏️</button>

                <button onclick="deleteCodeItem(${item.CodeID})">🗑️</button>

            </td>

        </tr>

        `;

    });

}

// ==========================
// CREATE / UPDATE
// ==========================

async function submitCode() {

    const snippet = {

        title: document.getElementById("codeTitle").value,

        description: document.getElementById("codeDescription").value,

        language: document.getElementById("codeLanguage").value,

        code: document.getElementById("codeContent").value,

        githubURL: document.getElementById("codeGithubURL").value

    };

    const url = editingCodeId
        ? `/code/${editingCodeId}`
        : "/code";

    const method = editingCodeId
        ? "PUT"
        : "POST";

    const response = await fetch(url, {

        method,

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(snippet)

    });

    const data = await response.json();

    alert(data.message || data.error || "Something went wrong. Check the server terminal for details.");

    editingCodeId = null;

    document.getElementById("codeModal").style.display = "none";

    loadCodeList();

}

// ==========================
// EDIT
// ==========================

async function editCodeItem(id) {

    const response = await fetch(`/code/${id}`);

    const item = await response.json();

    editingCodeId = id;

    document.getElementById("codeTitle").value = item.Title;

    document.getElementById("codeDescription").value = item.Description;

    document.getElementById("codeLanguage").value = item.Language;

    document.getElementById("codeContent").value = item.Code;

    document.getElementById("codeGithubURL").value = item.GithubURL;

    document.getElementById("codeModalTitle").innerText = "Edit Code Snippet";

    document.getElementById("codeSubmitBtn").innerText = "Update Snippet";

    document.getElementById("codeModal").style.display = "flex";

}

// ==========================
// DELETE
// ==========================

async function deleteCodeItem(id) {

    if (!confirm("Delete this snippet?")) return;

    const response = await fetch(`/code/${id}`, {

        method: "DELETE"

    });

    const data = await response.json();

    alert(data.message || data.error || "Something went wrong. Check the server terminal for details.");

    loadCodeList();

}
