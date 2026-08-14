// Data Pirates CMS v2.0

console.log("🏴‍☠️ Data Pirates Loaded");

// How many items to show per section - the homepage caps each section,
// while pages with data-listing="full" on <body> (the "View All" pages)
// show everything.
const HOMEPAGE_ITEM_LIMIT = document.body.dataset.listing === "full" ? null : 3;

function renderProjectCard(project) {

    return `
        <div class="project-card">

            ${
                project.ImageURL
                ? `<img src="${project.ImageURL}" class="project-card-image">`
                : `<div class="project-placeholder">🚀</div>`
            }

            <div class="project-card-body">

                <h3>${project.Title}</h3>

                <p>${project.Description}</p>

                <div class="tech-stack">
                    ${project.TechStack || "Coming Soon"}
                </div>

                <div class="project-buttons">

                    <a href="project.html?id=${project.ProjectID}" class="card-btn">
                        View Details
                    </a>

                    ${
                        project.GithubURL
                        ? `<a href="${project.GithubURL}" target="_blank" class="secondary-btn">
                                GitHub
                        </a>`
                        : ""
                    }

                </div>

            </div>

        </div>
    `;

}

async function loadProjects(limit = HOMEPAGE_ITEM_LIMIT) {

    const response = await fetch("/projects");

    const projects = await response.json();

    const container = document.getElementById("projectsContainer");

    if (!container) return;

    container.innerHTML = "";

    const items = limit ? projects.slice(0, limit) : projects;

    if (items.length === 0) {

        container.innerHTML = `
            <div class="card">
                <h3>Nothing here yet</h3>
                <p>Projects will appear here once added.</p>
            </div>
        `;

        return;

    }

    items.forEach(project => {

        container.innerHTML += renderProjectCard(project);

    });

}

loadProjects();

function renderBlogCard(blog) {

    return `
        <div class="card">

            <h3>${blog.Title}</h3>

            <p>${blog.Description}</p>

            <button
                class="card-btn"
                onclick="location.href='blog.html?id=${blog.BlogID}'">

                Read More

            </button>

        </div>
    `;

}

async function loadBlogs(limit = HOMEPAGE_ITEM_LIMIT) {

    const response = await fetch("/blogs");

    const blogs = await response.json();

    const container = document.getElementById("blogsContainer");

    if (!container) return;

    container.innerHTML = "";

    const items = limit ? blogs.slice(0, limit) : blogs;

    if (items.length === 0) {

        container.innerHTML = `
            <div class="card">
                <h3>Nothing here yet</h3>
                <p>Blog posts will appear here once added.</p>
            </div>
        `;

        return;

    }

    items.forEach(blog => {

        container.innerHTML += renderBlogCard(blog);

    });

}

loadBlogs();

function renderCodeCard(item) {

    return `
        <div class="card">

            <h3>${item.Language ? item.Language + " — " : ""}${item.Title}</h3>

            <p>${item.Description || ""}</p>

            ${
                item.GithubURL
                ? `<a href="${item.GithubURL}" target="_blank" class="card-btn">
                        View on GitHub
                   </a>`
                : ""
            }

        </div>
    `;

}

async function loadCode(limit = HOMEPAGE_ITEM_LIMIT) {

    const response = await fetch("/code");

    const snippets = await response.json();

    const container = document.getElementById("codeContainer");

    if (!container) return;

    container.innerHTML = "";

    const items = limit ? snippets.slice(0, limit) : snippets;

    if (items.length === 0) {

        container.innerHTML = `
            <div class="card">
                <h3>Nothing here yet</h3>
                <p>Code snippets will appear here once added.</p>
            </div>
        `;

        return;

    }

    items.forEach(item => {

        container.innerHTML += renderCodeCard(item);

    });

}

loadCode();

function renderBookCard(book) {

    const statusEmoji = {
        Reading: "📖",
        Completed: "✅",
        Wishlist: "🔖"
    };

    return `
        <div class="card book-card ${book.CoverURL ? "has-cover" : ""}">

            ${
                book.CoverURL
                ? `<img src="${book.CoverURL}" class="book-cover">`
                : ""
            }

            <div class="book-card-content">

                <h3>${statusEmoji[book.Status] || "📘"} ${book.Title}</h3>

                ${book.Author ? `<p class="book-author">by ${book.Author}</p>` : ""}

                <p>${book.Description || ""}</p>

                ${
                    book.Rating
                    ? `<p class="book-rating">${"⭐".repeat(book.Rating)}</p>`
                    : ""
                }

            </div>

        </div>
    `;

}

async function loadBooks(limit = HOMEPAGE_ITEM_LIMIT) {

    const response = await fetch("/books");

    const books = await response.json();

    const container = document.getElementById("booksContainer");

    if (!container) return;

    container.innerHTML = "";

    const items = limit ? books.slice(0, limit) : books;

    if (items.length === 0) {

        container.innerHTML = `
            <div class="card">
                <h3>Nothing here yet</h3>
                <p>Books will appear here once added.</p>
            </div>
        `;

        return;

    }

    items.forEach(book => {

        container.innerHTML += renderBookCard(book);

    });

}

loadBooks();
