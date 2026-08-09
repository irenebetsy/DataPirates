// ==========================
// LOAD COMMENTS PAGE (admin moderation - blogs + projects)
// ==========================

async function loadCommentsPage() {

    const response = await fetch("pages/comments.html");

    const html = await response.text();

    document.querySelector(".main-content").innerHTML = html;

    await loadAllComments();

}

async function loadAllComments() {

    const [blogRes, projectRes] = await Promise.all([
        fetch("/comments"),
        fetch("/project-comments")
    ]);

    const blogComments = (await blogRes.json()).map(c => ({ ...c, type: "Blog", contextTitle: c.BlogTitle }));

    const projectComments = (await projectRes.json()).map(c => ({ ...c, type: "Project", contextTitle: c.ProjectTitle }));

    const allComments = [...blogComments, ...projectComments]
        .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));

    const rows = document.getElementById("commentRows");

    rows.innerHTML = "";

    if (allComments.length === 0) {

        rows.innerHTML = `<tr><td colspan="7">No comments yet.</td></tr>`;

        return;

    }

    allComments.forEach(comment => {

        rows.innerHTML += `

        <tr>

            <td>${comment.CommentID}</td>

            <td>${comment.type}</td>

            <td>${comment.contextTitle || "(deleted)"}</td>

            <td>${comment.UserName}</td>

            <td>${comment.Content}</td>

            <td>${new Date(comment.CreatedAt).toLocaleDateString()}</td>

            <td>

                <button onclick="adminDeleteComment(${comment.CommentID}, '${comment.type}')">🗑️</button>

            </td>

        </tr>

        `;

    });

}

async function adminDeleteComment(id, type) {

    if (!confirm("Delete this comment?")) return;

    const endpoint = type === "Project"
        ? `/project-comments/admin/${id}`
        : `/comments/admin/${id}`;

    const response = await fetch(endpoint, {

        method: "DELETE"

    });

    const data = await response.json();

    alert(data.message);

    loadAllComments();

}
