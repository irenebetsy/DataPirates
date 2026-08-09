-- Adds comment/like support for PROJECTS to an EXISTING DataPirates database.
-- Requires SiteUsers and Projects tables to already exist.
-- Safe to run even if some of this already exists.
--
-- Usage:
--   psql "your-connection-string" -f database/add_project_comments_likes.sql

CREATE TABLE IF NOT EXISTS "ProjectComments" (
    "CommentID" SERIAL PRIMARY KEY,
    "ProjectID" INT NOT NULL REFERENCES "Projects"("ProjectID") ON DELETE CASCADE,
    "UserID" INT NOT NULL REFERENCES "SiteUsers"("UserID"),
    "UserName" VARCHAR(100) NOT NULL,
    "Content" VARCHAR(1000) NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ProjectLikes" (
    "LikeID" SERIAL PRIMARY KEY,
    "ProjectID" INT NOT NULL REFERENCES "Projects"("ProjectID") ON DELETE CASCADE,
    "UserID" INT NOT NULL REFERENCES "SiteUsers"("UserID"),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "UQ_ProjectLikes_Project_User" UNIQUE ("ProjectID", "UserID")
);
