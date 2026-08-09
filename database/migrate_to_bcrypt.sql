-- ⚠️ OBSOLETE for PostgreSQL / a fresh database.
-- This script was written for SQL Server, to migrate an EXISTING SQL Server
-- database over to bcrypt-hashed passwords. Since you're now starting with
-- a brand new PostgreSQL database (no old data to migrate), you don't need
-- this file at all - just run schema.sql, which already seeds the admin
-- account with the correct bcrypt hash from the start.
-- Kept here only for historical reference.

-- Run this AFTER updating your code to the bcrypt version, against your
-- EXISTING DataPirates database, to migrate to hashed passwords.
--
-- Usage:
--   sqlcmd -S localhost -U sa -P "YourPassword" -d DataPirates -i database/migrate_to_bcrypt.sql

USE DataPirates;
GO

-- 1. Add the PasswordResets table used by "Forgot Password".
IF OBJECT_ID('dbo.PasswordResets', 'U') IS NULL
BEGIN
    CREATE TABLE PasswordResets (
        ResetID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NOT NULL,
        Token NVARCHAR(255) NOT NULL UNIQUE,
        ExpiresAt DATETIME NOT NULL,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_PasswordResets_SiteUsers FOREIGN KEY (UserID) REFERENCES SiteUsers(UserID) ON DELETE CASCADE
    );
END
GO

-- 2. Update the seeded admin account to use a bcrypt hash.
-- This hash is for the same password as before: Admin@123
-- (You can still log in with Admin@123 - only the stored value changed.)
UPDATE Users
SET Password = '$2a$10$wekbCcUpsCDQDKRHznoyyOtTgTnMyR6R.G0wN3ikE8YDpRodqSfBq'
WHERE Email = 'admin@datapirates.com';
GO

-- 3. IMPORTANT: any OTHER admin users you created manually, or any SiteUsers
-- (visitor accounts) that registered before this update, still have their
-- OLD PLAIN TEXT password stored. Since a plain text password will never
-- match a bcrypt comparison, those accounts will simply fail to log in from
-- now on - they are not deleted or broken, just temporarily locked out.
--
-- For SiteUsers: they can self-recover with the new "Forgot Password" flow
-- on the site - no manual fix needed here.
--
-- For any extra admin users you added by hand: either delete and recreate
-- them with a real bcrypt hash, or ask for help generating one.
