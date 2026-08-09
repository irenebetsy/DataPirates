-- Data Pirates CMS - Database Schema (PostgreSQL)
-- Run this once against your PostgreSQL database to create the required
-- tables. Assumes the database itself already exists (Render/Neon/Supabase
-- all create the database for you when you provision it - you just point
-- this script at it).
--
-- Usage (psql example):
--   psql "your-connection-string" -f database/schema.sql

CREATE TABLE IF NOT EXISTS "Users" (
    "UserID" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(255) NOT NULL UNIQUE,
    "Password" VARCHAR(255) NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Projects" (
    "ProjectID" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Description" TEXT,
    "TechStack" VARCHAR(500),
    "Category" VARCHAR(100),
    "Status" VARCHAR(50),
    "Duration" VARCHAR(100),
    "Features" TEXT,
    "GithubURL" VARCHAR(500),
    "DemoURL" VARCHAR(500),
    "ImageURL" VARCHAR(500),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Blogs" (
    "BlogID" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Description" VARCHAR(1000),
    "Content" TEXT,
    "ImageURL" VARCHAR(500),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "CodeSnippets" (
    "CodeID" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Description" VARCHAR(1000),
    "Language" VARCHAR(100),
    "Code" TEXT,
    "GithubURL" VARCHAR(500),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Books" (
    "BookID" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Author" VARCHAR(200),
    "Description" VARCHAR(1000),
    "CoverURL" VARCHAR(500),
    "Status" VARCHAR(50),
    "Rating" INT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "SiteUsers" (
    "UserID" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(255) NOT NULL UNIQUE,
    "Password" VARCHAR(255) NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Comments" (
    "CommentID" SERIAL PRIMARY KEY,
    "BlogID" INT NOT NULL REFERENCES "Blogs"("BlogID") ON DELETE CASCADE,
    "UserID" INT NOT NULL REFERENCES "SiteUsers"("UserID"),
    "UserName" VARCHAR(100) NOT NULL,
    "Content" VARCHAR(1000) NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Likes" (
    "LikeID" SERIAL PRIMARY KEY,
    "BlogID" INT NOT NULL REFERENCES "Blogs"("BlogID") ON DELETE CASCADE,
    "UserID" INT NOT NULL REFERENCES "SiteUsers"("UserID"),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "UQ_Likes_Blog_User" UNIQUE ("BlogID", "UserID")
);

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

CREATE TABLE IF NOT EXISTS "PasswordResets" (
    "ResetID" SERIAL PRIMARY KEY,
    "UserID" INT NOT NULL REFERENCES "SiteUsers"("UserID") ON DELETE CASCADE,
    "Token" VARCHAR(255) NOT NULL UNIQUE,
    "ExpiresAt" TIMESTAMP NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sample admin user so you can log in right away.
-- Password is hashed with bcrypt - the plaintext is still "Admin@123".
INSERT INTO "Users" ("Name", "Email", "Password")
VALUES ('Captain Admin', 'admin@datapirates.com', '$2a$10$wekbCcUpsCDQDKRHznoyyOtTgTnMyR6R.G0wN3ikE8YDpRodqSfBq')
ON CONFLICT ("Email") DO NOTHING;
