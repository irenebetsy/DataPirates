const params = new URLSearchParams(window.location.search);

const id = params.get("id");

async function loadProject() {

    const response = await fetch(`/projects/${id}`);

    const project = await response.json();

    document.title = `${project.Title} | Data Pirates`;

    // Status Badge
    const statusMap = {

        "Completed": {
            text: "✅ Completed",
            class: "status-completed"
        },

        "WIP": {
            text: "🚧 Work In Progress",
            class: "status-wip"
        },

        "Planned": {
            text: "📅 Planned",
            class: "status-planned"
        },

        "On Hold": {
            text: "⏸ On Hold",
            class: "status-onhold"
        },

        "Archived": {
            text: "📦 Archived",
            class: "status-archived"
        }

    };

    const badge = statusMap[project.Status] || {
        text: project.Status || "Unknown",
        class: ""
    };

    document.getElementById("projectContent").innerHTML = `

    <div class="project-details">

        <a href="index.html#projects" class="back-btn">
            ⬅ Back to Projects
        </a>

        ${
            project.ImageURL
            ? `<img src="${project.ImageURL}" class="details-image">`
            : `<div class="details-placeholder">🚀</div>`
        }

        <h1>${project.Title}</h1>

        <div class="status-badge ${badge.class}">
            ${badge.text}
        </div>

        <p class="project-description">
            ${project.Description}
        </p>

        <div class="tech-box">

            <p><strong>📂 Category:</strong> ${project.Category || "-"}</p>

            <p><strong>⏳ Duration:</strong> ${project.Duration || "-"}</p>

            <h3>🛠 Tech Stack</h3>

            <p>${project.TechStack || "Coming Soon"}</p>

        </div>

        ${
            project.Features
            ? `
            <div class="features-box">

                <h3>✨ Features</h3>

                <pre>${project.Features}</pre>

            </div>
            `
            : ""
        }

        <div class="button-group">

            ${
                project.GithubURL
                ? `
                <a href="${project.GithubURL}"
                   target="_blank"
                   class="btn-primary">
                    💻 View Source Code
                </a>
                `
                : ""
            }

            ${
                project.DemoURL
                ? `
                <a href="${project.DemoURL}"
                   target="_blank"
                   class="btn-secondary">
                    🚀 Live Demo
                </a>
                `
                : ""
            }

        </div>

    </div>

    `;

}

loadProject();

// ==========================
// LIKE + SHARE
// ==========================

async function loadLikeShareBar() {

    const user = getSiteUser();

    const response = await fetch(`/project-likes/${id}${user ? `?userId=${user.id}` : ""}`);

    const data = await response.json();

    const bar = document.getElementById("likeShareBar");

    bar.innerHTML = `

        <button id="likeBtn" class="card-btn ${data.liked ? "liked" : ""}">
            ${data.liked ? "❤️" : "🤍"} Like (<span id="likeCount">${data.total}</span>)
        </button>

        <button id="shareBtn" class="card-btn">
            🔗 Share
        </button>

    `;

    document.getElementById("likeBtn").onclick = async () => {

        const currentUser = getSiteUser();

        if (!currentUser) {

            alert("Please sign in to like this project.");

            window.location.href = "account-login.html";

            return;

        }

        await fetch("/project-likes", {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ projectId: id, userId: currentUser.id })

        });

        loadLikeShareBar();

    };

    document.getElementById("shareBtn").onclick = async () => {

        const shareData = {
            title: document.title,
            url: window.location.href
        };

        if (navigator.share) {

            try {
                await navigator.share(shareData);
            } catch (err) {
                // user cancelled share - ignore
            }

        } else {

            await navigator.clipboard.writeText(window.location.href);

            alert("Link copied to clipboard!");

        }

    };

}

loadLikeShareBar();

// ==========================
// COMMENTS
// ==========================

function renderCommentForm() {

    const user = getSiteUser();

    const formArea = document.getElementById("commentForm");

    if (user) {

        formArea.innerHTML = `

            <textarea id="newCommentContent" rows="3" placeholder="Add a comment..."></textarea>

            <button id="postCommentBtn" class="card-btn">Post Comment</button>

        `;

        document.getElementById("postCommentBtn").onclick = async () => {

            const content = document.getElementById("newCommentContent").value.trim();

            if (!content) return;

            const res = await fetch("/project-comments", {

                method: "POST",

                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({
                    projectId: id,
                    userId: user.id,
                    userName: user.name,
                    content
                })

            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Unable to post comment.");
                return;
            }

            document.getElementById("newCommentContent").value = "";

            loadComments();

        };

    } else {

        formArea.innerHTML = `
            <p>
                <a href="account-login.html">Sign in</a> to leave a comment.
            </p>
        `;

    }

}

async function loadComments() {

    const response = await fetch(`/project-comments/${id}`);

    const comments = await response.json();

    const list = document.getElementById("commentsList");

    const currentUser = getSiteUser();

    list.innerHTML = "";

    if (comments.length === 0) {

        list.innerHTML = `<p>No comments yet. Be the first to share your thoughts!</p>`;

        return;

    }

    comments.forEach(comment => {

        const canDelete = currentUser && currentUser.id === comment.UserID;

        list.innerHTML += `

            <div class="comment">

                <p class="comment-meta">
                    <strong>${comment.UserName}</strong>
                    &middot;
                    ${new Date(comment.CreatedAt).toLocaleDateString()}
                </p>

                <p class="comment-content">${comment.Content}</p>

                ${
                    canDelete
                    ? `<button onclick="deleteComment(${comment.CommentID})" class="comment-delete-btn">Delete</button>`
                    : ""
                }

            </div>

        `;

    });

}

async function deleteComment(commentId) {

    const user = getSiteUser();

    if (!user) return;

    if (!confirm("Delete this comment?")) return;

    const res = await fetch(`/project-comments/${commentId}`, {

        method: "DELETE",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ userId: user.id })

    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.message || "Unable to delete comment.");
        return;
    }

    loadComments();

}

renderCommentForm();
loadComments();