let editingBookId = null;

// ==========================
// LOAD BOOKS PAGE
// ==========================

async function loadBooksPage() {

    const response = await fetch("pages/books.html");

    const html = await response.text();

    document.querySelector(".main-content").innerHTML = html;

    initializeBooksPage();

    await loadBooksList();

}

// ==========================
// INITIALIZE
// ==========================

function initializeBooksPage() {

    const modal = document.getElementById("bookModal");

    document.getElementById("openBookForm").onclick = () => {

        editingBookId = null;

        document.getElementById("bookForm").reset();

        document.getElementById("bookModalTitle").innerText = "Add Book";

        document.getElementById("bookSubmitBtn").innerText = "Save Book";

        modal.style.display = "flex";

    };

    document.getElementById("closeBookModal").onclick = () => {

        modal.style.display = "none";

    };

    window.onclick = (e) => {

        if (e.target === modal) {

            modal.style.display = "none";

        }

    };

    document.getElementById("bookForm").onsubmit = (e) => {

        e.preventDefault();

        submitBook();

    };

}

// ==========================
// LOAD LIST
// ==========================

async function loadBooksList() {

    const response = await fetch("/books");

    const books = await response.json();

    const rows = document.getElementById("bookRows");

    rows.innerHTML = "";

    books.forEach(book => {

        rows.innerHTML += `

        <tr>

            <td>${book.BookID}</td>

            <td>${book.Title}</td>

            <td>${book.Author || ""}</td>

            <td>${book.Status || ""}</td>

            <td>

                <button onclick="editBook(${book.BookID})">✏️</button>

                <button onclick="deleteBook(${book.BookID})">🗑️</button>

            </td>

        </tr>

        `;

    });

}

// ==========================
// CREATE / UPDATE
// ==========================

async function submitBook() {

    const book = {

        title: document.getElementById("bookTitle").value,

        author: document.getElementById("bookAuthor").value,

        description: document.getElementById("bookDescription").value,

        coverURL: document.getElementById("bookCoverURL").value,

        status: document.getElementById("bookStatus").value,

        rating: document.getElementById("bookRating").value || null,

        pinned: document.getElementById("bookPinned").checked

    };

    const url = editingBookId
        ? `/books/${editingBookId}`
        : "/books";

    const method = editingBookId
        ? "PUT"
        : "POST";

    const response = await fetch(url, {

        method,

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(book)

    });

    const data = await response.json();

    alert(data.message || data.error || "Something went wrong. Check the server terminal for details.");

    editingBookId = null;

    document.getElementById("bookModal").style.display = "none";

    loadBooksList();

}

// ==========================
// EDIT
// ==========================

async function editBook(id) {

    const response = await fetch(`/books/${id}`);

    const book = await response.json();

    editingBookId = id;

    document.getElementById("bookTitle").value = book.Title;

    document.getElementById("bookAuthor").value = book.Author;

    document.getElementById("bookDescription").value = book.Description;

    document.getElementById("bookCoverURL").value = book.CoverURL;

    document.getElementById("bookStatus").value = book.Status || "";

    document.getElementById("bookRating").value = book.Rating || "";

    document.getElementById("bookPinned").checked = book.Pinned || false;

    document.getElementById("bookModalTitle").innerText = "Edit Book";

    document.getElementById("bookSubmitBtn").innerText = "Update Book";

    document.getElementById("bookModal").style.display = "flex";

}

// ==========================
// DELETE
// ==========================

async function deleteBook(id) {

    if (!confirm("Delete this book?")) return;

    const response = await fetch(`/books/${id}`, {

        method: "DELETE"

    });

    const data = await response.json();

    alert(data.message || data.error || "Something went wrong. Check the server terminal for details.");

    loadBooksList();

}
