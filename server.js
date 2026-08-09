const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");

// Load .env FIRST
dotenv.config();

const app = express();

// Routes (AFTER dotenv.config())
const projectRoutes = require("./routes/projectRoutes");
const blogRoutes = require("./routes/blogRoutes");
const authRoutes = require("./routes/authRoutes");
const codeRoutes = require("./routes/codeRoutes");
const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");
const commentRoutes = require("./routes/commentRoutes");
const likeRoutes = require("./routes/likeRoutes");
const projectCommentRoutes = require("./routes/projectCommentRoutes");
const projectLikeRoutes = require("./routes/projectLikeRoutes");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/projects", projectRoutes);
app.use("/blogs", blogRoutes);
app.use("/auth", authRoutes);
app.use("/code", codeRoutes);
app.use("/books", bookRoutes);
app.use("/users", userRoutes);
app.use("/comments", commentRoutes);
app.use("/likes", likeRoutes);
app.use("/project-comments", projectCommentRoutes);
app.use("/project-likes", projectLikeRoutes);

// Home
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("");
    console.log("=======================================");
    console.log("🏴‍☠️ DATA PIRATES CMS v2.0");
    console.log("=======================================");
    console.log(`🚀 Server Running : http://localhost:${PORT}`);
    console.log("=======================================");
    console.log("");

});