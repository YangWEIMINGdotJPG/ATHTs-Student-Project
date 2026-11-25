-- ============================================================================
-- ATHT_devv3 - Microsoft SQL Server Portal Sync Schema
-- Target Database: ATHT_StudentProjectDB (localhost / SQL Server 2016-2022)
-- Safe & Idempotent: Can be executed in SSMS or automatically by Program.cs
-- ============================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'ATHT_StudentProjectDB')
BEGIN
    CREATE DATABASE ATHT_StudentProjectDB;
END
GO

USE ATHT_StudentProjectDB;
GO

IF OBJECT_ID(N'dbo.PortalStateStore', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PortalStateStore (
        BucketKey   NVARCHAR(100) NOT NULL PRIMARY KEY,
        JsonPayload NVARCHAR(MAX) NOT NULL,
        Revision    BIGINT        NOT NULL CONSTRAINT DF_PortalStateStore_Rev DEFAULT (1),
        UpdatedAt   DATETIME2     NOT NULL CONSTRAINT DF_PortalStateStore_Upd DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID(N'dbo.PortalCourses', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PortalCourses (
        CourseCode        NVARCHAR(30)  NOT NULL PRIMARY KEY,
        Title             NVARCHAR(200) NOT NULL,
        TeacherDisplay    NVARCHAR(250) NULL,
        Schedule          NVARCHAR(150) NULL,
        StudentVisibility NVARCHAR(20)  NOT NULL CONSTRAINT DF_PortalCourses_Vis DEFAULT (N'all'),
        Progress          INT           NOT NULL CONSTRAINT DF_PortalCourses_Prog DEFAULT (0),
        IsAdminCreated    BIT           NOT NULL CONSTRAINT DF_PortalCourses_Adm DEFAULT (0),
        UpdatedAt         DATETIME2     NOT NULL CONSTRAINT DF_PortalCourses_Upd DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID(N'dbo.PortalCourseTeachers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PortalCourseTeachers (
        CourseCode NVARCHAR(30) NOT NULL,
        TeacherId  NVARCHAR(80) NOT NULL,
        CONSTRAINT PK_PortalCourseTeachers PRIMARY KEY (CourseCode, TeacherId)
    );
END
GO

IF OBJECT_ID(N'dbo.PortalUsers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PortalUsers (
        UserKey         NVARCHAR(80)  NOT NULL PRIMARY KEY,
        UserRole        NVARCHAR(20)  NOT NULL,
        CodeOrId        NVARCHAR(50)  NOT NULL,
        FullName        NVARCHAR(150) NOT NULL,
        ShortName       NVARCHAR(100) NULL,
        Email           NVARCHAR(150) NULL,
        MajorOrSpec     NVARCHAR(150) NULL,
        YearOrTitle     NVARCHAR(100) NULL,
        Status          NVARCHAR(30)  NOT NULL CONSTRAINT DF_PortalUsers_Status DEFAULT (N'Active'),
        AssignedCourses NVARCHAR(500) NULL,
        UpdatedAt       DATETIME2     NOT NULL CONSTRAINT DF_PortalUsers_Upd DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID(N'dbo.PortalProjects', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PortalProjects (
        ProjectId   NVARCHAR(80)  NOT NULL PRIMARY KEY,
        CourseCode  NVARCHAR(30)  NOT NULL,
        Title       NVARCHAR(250) NOT NULL,
        Status      NVARCHAR(50)  NULL,
        DueDate     NVARCHAR(100) NULL,
        CreatedBy   NVARCHAR(80)  NULL,
        MembersJson NVARCHAR(MAX) NULL,
        UpdatedAt   DATETIME2     NOT NULL CONSTRAINT DF_PortalProjects_Upd DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID(N'dbo.PortalTasks', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PortalTasks (
        TaskId           NVARCHAR(100) NOT NULL PRIMARY KEY,
        CourseCode       NVARCHAR(30)  NOT NULL,
        ProjectId        NVARCHAR(80)  NULL,
        Title            NVARCHAR(250) NOT NULL,
        TaskType         NVARCHAR(80)  NULL,
        Status           NVARCHAR(50)  NULL,
        DueDate          NVARCHAR(100) NULL,
        IsFinished       BIT           NOT NULL CONSTRAINT DF_PortalTasks_Fin DEFAULT (0),
        SubmissionsCount INT           NOT NULL CONSTRAINT DF_PortalTasks_Sub DEFAULT (0),
        UpdatedAt        DATETIME2     NOT NULL CONSTRAINT DF_PortalTasks_Upd DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID(N'dbo.PortalNotifications', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PortalNotifications (
        NotifId     NVARCHAR(100) NOT NULL PRIMARY KEY,
        TargetRole  NVARCHAR(30)  NULL,
        CourseCode  NVARCHAR(30)  NULL,
        Title       NVARCHAR(250) NULL,
        TaskTitle   NVARCHAR(250) NULL,
        IsNew       BIT           NOT NULL CONSTRAINT DF_PortalNotif_New DEFAULT (1),
        CreatedTime NVARCHAR(80)  NULL,
        UpdatedAt   DATETIME2     NOT NULL CONSTRAINT DF_PortalNotif_Upd DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID(N'dbo.PortalAuditLogs', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PortalAuditLogs (
        LogId      INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ActionTime NVARCHAR(80)      NULL,
        ActionName NVARCHAR(150)     NULL,
        Detail     NVARCHAR(MAX)     NULL,
        Badge      NVARCHAR(30)      NULL,
        RecordedAt DATETIME2         NOT NULL CONSTRAINT DF_PortalAudit_Rec DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID(N'dbo.PortalUploadedFiles', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PortalUploadedFiles (
        FileKey     NVARCHAR(100)  NOT NULL PRIMARY KEY,
        FileName    NVARCHAR(260)  NOT NULL,
        ContentType NVARCHAR(150)  NOT NULL CONSTRAINT DF_PortalFiles_Ct DEFAULT (N'application/octet-stream'),
        FileSize    BIGINT         NOT NULL CONSTRAINT DF_PortalFiles_Sz DEFAULT (0),
        FileBytes   VARBINARY(MAX) NOT NULL,
        UploadedAt  DATETIME2      NOT NULL CONSTRAINT DF_PortalFiles_Up DEFAULT SYSUTCDATETIME()
    );
END
GO
