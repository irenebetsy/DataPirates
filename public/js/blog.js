const params = new URLSearchParams(window.location.search);

const id = params.get("id");

async function loadBlog() {

    const response = await fetch(`/blogs/${id}`);

    const blog = await response.json();

    const markdown = marked.parse(blog.Content || "");

    document.title = `${blog.Title} | Data Pirates`;

    document.getElementById("blogContent").innerHTML = `

        <h1>${blog.Title}</h1>

        <p style="color:gray;">
            ${new Date(blog.CreatedAt).toLocaleDateString()}
        </p>

        ${
            blog.ImageURL
                ? `<img
                        src="${blog.ImageURL}"
                        style="
                            width:100%;
                            border-radius:10px;
                            margin:25px 0;
                        ">`
                : ""
        }

        <p style="font-size:18px;color:#666;">
            ${blog.Description}
        </p>

        <hr>

        <div class="markdown-body">

            ${markdown}

        </div>

    `;

}

loadBlog();

// ==========================
// LIKE + SHARE
// ==========================

async function loadLikeShareBar() {

    const user = getSiteUser();

    const response = await fetch(`/likes/${id}${user ? `?userId=${user.id}` : ""}`);

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

            alert("Please sign in to like this post.");

            window.location.href = "account-login.html";

            return;

        }

        const res = await fetch("/likes", {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ blogId: id, userId: currentUser.id })

        });

        const result = await res.json();

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

            const res = await fetch("/comments", {

                method: "POST",

                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({
                    blogId: id,
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

    const response = await fetch(`/comments/${id}`);

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

    const res = await fetch(`/comments/${commentId}`, {

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
