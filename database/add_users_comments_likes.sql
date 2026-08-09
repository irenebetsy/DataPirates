-- Adds user accounts, comments, and likes to an EXISTING DataPirates database.
-- Safe to run even if you've already run the main schema.sql, since every
-- table here uses CREATE TABLE IF NOT EXISTS.
--
-- Usage:
--   psql "your-connection-string" -f database/add_users_comments_likes.sql

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

CREATE TABLE IF NOT EXISTS "PasswordResets" (
    "ResetID" SERIAL PRIMARY KEY,
    "UserID" INT NOT NULL REFERENCES "SiteUsers"("UserID") ON DELETE CASCADE,
    "Token" VARCHAR(255) NOT NULL UNIQUE,
    "ExpiresAt" TIMESTAMP NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
