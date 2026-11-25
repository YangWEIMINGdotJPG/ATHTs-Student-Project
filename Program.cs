using System.Collections.Concurrent;
using System.Text.Json;
using System.Threading.Channels;
using Microsoft.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 52 * 1024 * 1024; // 50 MB for zipped submissions
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=localhost;Database=ATHT_StudentProjectDB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True";

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();
app.Use(async (ctx, next) =>
{
    ctx.Response.Headers["Access-Control-Allow-Origin"] = "*";
    ctx.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
    ctx.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With";
    if (ctx.Request.Headers.ContainsKey("Access-Control-Request-Private-Network"))
    {
        ctx.Response.Headers["Access-Control-Allow-Private-Network"] = "true";
    }
    if (HttpMethods.IsOptions(ctx.Request.Method))
    {
        ctx.Response.StatusCode = 204;
        return;
    }
    await next();
});
app.UseCors();

await SqlPortalStore.EnsureDatabaseAndSchemaAsync(connectionString, app.Logger);

var sseHub = new SseRealtimeHub();

app.UseDefaultFiles();
app.UseStaticFiles();

// Health & SQL Server Connection Status
app.MapGet("/api/health", async () =>
{
    try
    {
        await using var conn = new SqlConnection(connectionString);
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(@"
            SELECT @@SERVERNAME AS ServerName,
                   DB_NAME() AS DatabaseName,
                   (SELECT COUNT(*) FROM dbo.PortalCourses) AS CoursesCount,
                   (SELECT COUNT(*) FROM dbo.PortalUsers) AS UsersCount,
                   (SELECT COUNT(*) FROM dbo.PortalProjects) AS ProjectsCount,
                   (SELECT COUNT(*) FROM dbo.PortalTasks) AS TasksCount,
                   (SELECT COUNT(*) FROM dbo.PortalUploadedFiles) AS FilesCount,
                   ISNULL((SELECT MAX(Revision) FROM dbo.PortalStateStore), 0) AS MaxRevision;", conn);
        await using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return Results.Ok(new
            {
                connected = true,
                realtime = true,
                clientsOnline = sseHub.ClientCount,
                server = reader.IsDBNull(0) ? "localhost" : reader.GetString(0),
                database = reader.IsDBNull(1) ? "ATHT_StudentProjectDB" : reader.GetString(1),
                coursesCount = reader.GetInt32(2),
                usersCount = reader.GetInt32(3),
                projectsCount = reader.GetInt32(4),
                tasksCount = reader.GetInt32(5),
                filesCount = reader.GetInt32(6),
                revision = reader.GetInt64(7)
            });
        }
        return Results.Ok(new { connected = true, realtime = true });
    }
    catch (Exception ex)
    {
        return Results.Json(new { connected = false, realtime = false, error = ex.Message }, statusCode: 500);
    }
});

// True Realtime Server-Sent Events (SSE) Push Stream
app.MapGet("/api/events", async (HttpContext ctx, CancellationToken ct) =>
{
    var clientId = ctx.Request.Query["clientId"].FirstOrDefault() ?? Guid.NewGuid().ToString("N");
    ctx.Response.Headers.ContentType = "text/event-stream; charset=utf-8";
    ctx.Response.Headers.CacheControl = "no-cache";
    ctx.Response.Headers.Connection = "keep-alive";

    var (subId, channel) = sseHub.Subscribe();
    try
    {
        await ctx.Response.WriteAsync($"event: connected\ndata: {{\"clientId\":\"{clientId}\",\"connected\":true}}\n\n", ct);
        await ctx.Response.Body.FlushAsync(ct);

        using var heartbeatTimer = new PeriodicTimer(TimeSpan.FromSeconds(20));
        while (!ct.IsCancellationRequested)
        {
            var readTask = channel.Reader.ReadAsync(ct).AsTask();
            var tickTask = heartbeatTimer.WaitForNextTickAsync(ct).AsTask();
            var completed = await Task.WhenAny(readTask, tickTask);
            if (completed == readTask)
            {
                var payload = await readTask;
                await ctx.Response.WriteAsync($"data: {payload}\n\n", ct);
                await ctx.Response.Body.FlushAsync(ct);
            }
            else
            {
                await ctx.Response.WriteAsync(": keepalive\n\n", ct);
                await ctx.Response.Body.FlushAsync(ct);
            }
        }
    }
    catch (OperationCanceledException) { }
    finally
    {
        sseHub.Unsubscribe(subId);
    }
});

// Lightweight revision endpoint
app.MapGet("/api/version", async () =>
{
    try
    {
        await using var conn = new SqlConnection(connectionString);
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("SELECT ISNULL(MAX(Revision), 0) FROM dbo.PortalStateStore;", conn);
        var rev = Convert.ToInt64(await cmd.ExecuteScalarAsync());
        return Results.Ok(new { connected = true, revision = rev });
    }
    catch (Exception ex)
    {
        return Results.Json(new { connected = false, revision = 0L, error = ex.Message }, statusCode: 500);
    }
});

// JSON bootstrap state
app.MapGet("/api/bootstrap", async () =>
{
    try
    {
        var payload = await SqlPortalStore.LoadBootstrapAsync(connectionString);
        return Results.Ok(payload);
    }
    catch (Exception ex)
    {
        return Results.Json(new { connected = false, error = ex.Message }, statusCode: 500);
    }
});

// Synchronous JS bootstrap loaded before js/01-data.js so SQL Server state hydrates immediately
app.MapGet("/api/bootstrap.js", async (HttpResponse response) =>
{
    response.ContentType = "application/javascript; charset=utf-8";
    response.Headers.CacheControl = "no-store, no-cache, must-revalidate";
    try
    {
        var payload = await SqlPortalStore.LoadBootstrapAsync(connectionString);
        var json = JsonSerializer.Serialize(payload);
        return Results.Content($"window.__ATHT_SQL_BOOTSTRAP = {json};", "application/javascript; charset=utf-8");
    }
    catch (Exception ex)
    {
        var errJson = JsonSerializer.Serialize(new { connected = false, error = ex.Message });
        return Results.Content($"window.__ATHT_SQL_BOOTSTRAP = {errJson};", "application/javascript; charset=utf-8");
    }
});

// Upload Real File Bytes into SQL Server (dbo.PortalUploadedFiles)
app.MapPost("/api/files", async (HttpRequest request) =>
{
    try
    {
        string fileKey = "";
        string fileName = "submission.bin";
        string contentType = "application/octet-stream";
        byte[] fileBytes = Array.Empty<byte>();

        if (request.HasFormContentType)
        {
            var form = await request.ReadFormAsync();
            fileKey = form["fileKey"].FirstOrDefault() ?? $"file_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            var formFile = form.Files.GetFile("file") ?? form.Files.FirstOrDefault();
            if (formFile != null)
            {
                fileName = Path.GetFileName(formFile.FileName);
                contentType = string.IsNullOrWhiteSpace(formFile.ContentType) ? "application/octet-stream" : formFile.ContentType;
                await using var ms = new MemoryStream();
                await formFile.CopyToAsync(ms);
                fileBytes = ms.ToArray();
            }
        }
        else
        {
            using var doc = await JsonDocument.ParseAsync(request.Body);
            var root = doc.RootElement;
            fileKey = root.TryGetProperty("fileKey", out var fk) ? (fk.GetString() ?? "") : "";
            fileName = root.TryGetProperty("fileName", out var fn) ? (fn.GetString() ?? "submission.bin") : "submission.bin";
            contentType = root.TryGetProperty("contentType", out var ctEl) ? (ctEl.GetString() ?? "application/octet-stream") : "application/octet-stream";
            var b64 = root.TryGetProperty("base64", out var bEl) ? (bEl.GetString() ?? "") : "";
            if (!string.IsNullOrEmpty(b64))
            {
                var commaIdx = b64.IndexOf(',');
                if (commaIdx >= 0) b64 = b64[(commaIdx + 1)..];
                fileBytes = Convert.FromBase64String(b64);
            }
        }

        if (string.IsNullOrWhiteSpace(fileKey) || fileBytes.Length == 0)
        {
            return Results.BadRequest(new { ok = false, error = "Missing fileKey or empty file" });
        }

        await SqlPortalStore.SaveUploadedFileAsync(connectionString, fileKey, fileName, contentType, fileBytes);
        return Results.Ok(new { ok = true, fileKey, fileName, size = fileBytes.Length });
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "SQL file upload failed");
        return Results.Json(new { ok = false, error = ex.Message }, statusCode: 500);
    }
});

// Download Real File Bytes directly from SQL Server
app.MapGet("/api/files/{fileKey}", async (string fileKey) =>
{
    try
    {
        var fileRecord = await SqlPortalStore.GetUploadedFileAsync(connectionString, fileKey);
        if (fileRecord == null) return Results.NotFound(new { ok = false, error = "File not found in SQL Server" });
        return Results.File(fileRecord.Value.Bytes, fileRecord.Value.ContentType, fileRecord.Value.FileName);
    }
    catch (Exception ex)
    {
        return Results.Json(new { ok = false, error = ex.Message }, statusCode: 500);
    }
});

// Sync dirty buckets + relational tables inside SQL transaction & push Realtime SSE
app.MapPost("/api/sync", async (HttpRequest request) =>
{
    try
    {
        using var doc = await JsonDocument.ParseAsync(request.Body);
        var clientId = doc.RootElement.TryGetProperty("clientId", out var cidEl) && cidEl.ValueKind == JsonValueKind.String
            ? (cidEl.GetString() ?? "")
            : "";
        var rev = await SqlPortalStore.SaveSyncPayloadAsync(connectionString, doc.RootElement);
        if (rev > 0)
        {
            sseHub.Broadcast(JsonSerializer.Serialize(new { type = "sync", revision = rev, clientId }));
        }
        return Results.Ok(new { ok = true, revision = rev });
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "SQL sync failed");
        return Results.Json(new { ok = false, error = ex.Message }, statusCode: 500);
    }
});

// Factory reset in SQL Server & push Realtime SSE
app.MapPost("/api/reset", async (HttpRequest request) =>
{
    try
    {
        var clientId = request.Query["clientId"].FirstOrDefault() ?? "";
        await SqlPortalStore.ResetAllAsync(connectionString);
        sseHub.Broadcast(JsonSerializer.Serialize(new { type = "reset", revision = 0L, clientId }));
        return Results.Ok(new { ok = true });
    }
    catch (Exception ex)
    {
        return Results.Json(new { ok = false, error = ex.Message }, statusCode: 500);
    }
});

app.Run();

sealed class SseRealtimeHub
{
    private readonly ConcurrentDictionary<Guid, Channel<string>> _subscribers = new();
    public int ClientCount => _subscribers.Count;

    public (Guid Id, Channel<string> Channel) Subscribe()
    {
        var id = Guid.NewGuid();
        var channel = Channel.CreateUnbounded<string>();
        _subscribers[id] = channel;
        return (id, channel);
    }

    public void Unsubscribe(Guid id)
    {
        if (_subscribers.TryRemove(id, out var ch))
        {
            ch.Writer.TryComplete();
        }
    }

    public void Broadcast(string jsonPayload)
    {
        foreach (var ch in _subscribers.Values)
        {
            ch.Writer.TryWrite(jsonPayload);
        }
    }
}

static class SqlPortalStore
{
    public static readonly string[] AllowedBuckets =
    {
        "atht_v2_courses_catalog_rev6",
        "atht_admin_courses_synced",
        "atht_admin_students",
        "atht_admin_teachers",
        "atht_student_projects",
        "atht_v2_notifications",
        "atht_admin_audit_logs",
        "atht_global_festival_theme",
        "atht_festival_theme"
    };

    public static async Task EnsureDatabaseAndSchemaAsync(string connStr, ILogger logger)
    {
        try
        {
            var csb = new SqlConnectionStringBuilder(connStr);
            var targetDb = string.IsNullOrWhiteSpace(csb.InitialCatalog) ? "ATHT_StudentProjectDB" : csb.InitialCatalog;
            var masterCsb = new SqlConnectionStringBuilder(connStr) { InitialCatalog = "master" };

            await using (var masterConn = new SqlConnection(masterCsb.ConnectionString))
            {
                await masterConn.OpenAsync();
                await using var dbCmd = new SqlCommand(
                    $"IF DB_ID(@dbName) IS NULL CREATE DATABASE [{targetDb.Replace("]", "]]")}];", masterConn);
                dbCmd.Parameters.AddWithValue("@dbName", targetDb);
                await dbCmd.ExecuteNonQueryAsync();
            }

            await using var conn = new SqlConnection(connStr);
            await conn.OpenAsync();

            var ddl = @"
IF OBJECT_ID(N'dbo.PortalStateStore', N'U') IS NULL
CREATE TABLE dbo.PortalStateStore (
    BucketKey   NVARCHAR(100) NOT NULL PRIMARY KEY,
    JsonPayload NVARCHAR(MAX) NOT NULL,
    Revision    BIGINT        NOT NULL CONSTRAINT DF_PortalStateStore_Rev DEFAULT (1),
    UpdatedAt   DATETIME2     NOT NULL CONSTRAINT DF_PortalStateStore_Upd DEFAULT SYSUTCDATETIME()
);

IF OBJECT_ID(N'dbo.PortalCourses', N'U') IS NULL
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

IF OBJECT_ID(N'dbo.PortalCourseTeachers', N'U') IS NULL
CREATE TABLE dbo.PortalCourseTeachers (
    CourseCode NVARCHAR(30) NOT NULL,
    TeacherId  NVARCHAR(80) NOT NULL,
    CONSTRAINT PK_PortalCourseTeachers PRIMARY KEY (CourseCode, TeacherId)
);

IF OBJECT_ID(N'dbo.PortalUsers', N'U') IS NULL
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

IF OBJECT_ID(N'dbo.PortalProjects', N'U') IS NULL
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

IF OBJECT_ID(N'dbo.PortalTasks', N'U') IS NULL
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

IF OBJECT_ID(N'dbo.PortalNotifications', N'U') IS NULL
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

IF OBJECT_ID(N'dbo.PortalAuditLogs', N'U') IS NULL
CREATE TABLE dbo.PortalAuditLogs (
    LogId      INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ActionTime NVARCHAR(80)      NULL,
    ActionName NVARCHAR(150)     NULL,
    Detail     NVARCHAR(MAX)     NULL,
    Badge      NVARCHAR(30)      NULL,
    RecordedAt DATETIME2         NOT NULL CONSTRAINT DF_PortalAudit_Rec DEFAULT SYSUTCDATETIME()
);

IF OBJECT_ID(N'dbo.PortalUploadedFiles', N'U') IS NULL
CREATE TABLE dbo.PortalUploadedFiles (
    FileKey     NVARCHAR(100)  NOT NULL PRIMARY KEY,
    FileName    NVARCHAR(260)  NOT NULL,
    ContentType NVARCHAR(150)  NOT NULL CONSTRAINT DF_PortalFiles_Ct DEFAULT (N'application/octet-stream'),
    FileSize    BIGINT         NOT NULL CONSTRAINT DF_PortalFiles_Sz DEFAULT (0),
    FileBytes   VARBINARY(MAX) NOT NULL,
    UploadedAt  DATETIME2      NOT NULL CONSTRAINT DF_PortalFiles_Up DEFAULT SYSUTCDATETIME()
);";
            await using var cmd = new SqlCommand(ddl, conn);
            await cmd.ExecuteNonQueryAsync();
            logger.LogInformation("SQL Server ready with Realtime SSE & File Storage: {Database}", targetDb);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Could not initialize SQL Server schema at startup.");
        }
    }

    public static async Task SaveUploadedFileAsync(string connStr, string fileKey, string fileName, string contentType, byte[] bytes)
    {
        await using var conn = new SqlConnection(connStr);
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(@"
            MERGE dbo.PortalUploadedFiles AS target
            USING (SELECT @k AS FileKey) AS src ON (target.FileKey = src.FileKey)
            WHEN MATCHED THEN UPDATE SET FileName = @n, ContentType = @ct, FileSize = @sz, FileBytes = @b, UploadedAt = SYSUTCDATETIME()
            WHEN NOT MATCHED THEN INSERT (FileKey, FileName, ContentType, FileSize, FileBytes) VALUES (@k, @n, @ct, @sz, @b);", conn);
        cmd.Parameters.AddWithValue("@k", fileKey);
        cmd.Parameters.AddWithValue("@n", fileName);
        cmd.Parameters.AddWithValue("@ct", contentType);
        cmd.Parameters.AddWithValue("@sz", (long)bytes.Length);
        cmd.Parameters.Add("@b", System.Data.SqlDbType.VarBinary, -1).Value = bytes;
        await cmd.ExecuteNonQueryAsync();
    }

    public static async Task<(byte[] Bytes, string ContentType, string FileName)?> GetUploadedFileAsync(string connStr, string fileKey)
    {
        await using var conn = new SqlConnection(connStr);
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("SELECT FileBytes, ContentType, FileName FROM dbo.PortalUploadedFiles WHERE FileKey = @k;", conn);
        cmd.Parameters.AddWithValue("@k", fileKey);
        await using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            var bytes = (byte[])reader["FileBytes"];
            var ct = reader["ContentType"]?.ToString() ?? "application/octet-stream";
            var fn = reader["FileName"]?.ToString() ?? "submission.bin";
            return (bytes, ct, fn);
        }
        return null;
    }

    public static async Task<object> LoadBootstrapAsync(string connStr)
    {
        var buckets = new Dictionary<string, string>();
        long maxRev = 0;

        await using var conn = new SqlConnection(connStr);
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("SELECT BucketKey, JsonPayload, Revision FROM dbo.PortalStateStore;", conn);
        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            var key = reader.GetString(0);
            var val = reader.GetString(1);
            var rev = reader.GetInt64(2);
            buckets[key] = val;
            if (rev > maxRev) maxRev = rev;
        }

        return new
        {
            connected = true,
            realtime = true,
            database = conn.Database,
            revision = maxRev,
            buckets
        };
    }

    public static async Task<long> SaveSyncPayloadAsync(string connStr, JsonElement root)
    {
        if (!root.TryGetProperty("buckets", out var bucketsEl) || bucketsEl.ValueKind != JsonValueKind.Object)
        {
            return 0;
        }

        await using var conn = new SqlConnection(connStr);
        await conn.OpenAsync();
        await using var tx = (SqlTransaction)await conn.BeginTransactionAsync();

        try
        {
            await using var revCmd = new SqlCommand("SELECT ISNULL(MAX(Revision), 0) FROM dbo.PortalStateStore;", conn, tx);
            var nextRev = Convert.ToInt64(await revCmd.ExecuteScalarAsync()) + 1;

            foreach (var prop in bucketsEl.EnumerateObject())
            {
                if (!AllowedBuckets.Contains(prop.Name)) continue;

                if (prop.Value.ValueKind == JsonValueKind.Null)
                {
                    await using var del = new SqlCommand("DELETE FROM dbo.PortalStateStore WHERE BucketKey = @k;", conn, tx);
                    del.Parameters.AddWithValue("@k", prop.Name);
                    await del.ExecuteNonQueryAsync();
                    continue;
                }

                var rawVal = prop.Value.ValueKind == JsonValueKind.String
                    ? (prop.Value.GetString() ?? "")
                    : prop.Value.GetRawText();

                await using var upsert = new SqlCommand(@"
                    MERGE dbo.PortalStateStore AS target
                    USING (SELECT @k AS BucketKey) AS src ON (target.BucketKey = src.BucketKey)
                    WHEN MATCHED THEN UPDATE SET JsonPayload = @p, Revision = @r, UpdatedAt = SYSUTCDATETIME()
                    WHEN NOT MATCHED THEN INSERT (BucketKey, JsonPayload, Revision) VALUES (@k, @p, @r);", conn, tx);
                upsert.Parameters.AddWithValue("@k", prop.Name);
                upsert.Parameters.AddWithValue("@p", rawVal);
                upsert.Parameters.AddWithValue("@r", nextRev);
                await upsert.ExecuteNonQueryAsync();

                if (prop.Name == "atht_v2_courses_catalog_rev6")
                {
                    await SyncCoursesRelationalAsync(conn, tx, rawVal);
                }
                else if (prop.Name == "atht_admin_students")
                {
                    await SyncUsersRelationalAsync(conn, tx, "student", rawVal);
                }
                else if (prop.Name == "atht_admin_teachers")
                {
                    await SyncUsersRelationalAsync(conn, tx, "teacher", rawVal);
                }
                else if (prop.Name == "atht_student_projects")
                {
                    await SyncProjectsRelationalAsync(conn, tx, rawVal);
                }
                else if (prop.Name == "atht_v2_notifications")
                {
                    await SyncNotificationsRelationalAsync(conn, tx, rawVal);
                }
                else if (prop.Name == "atht_admin_audit_logs")
                {
                    await SyncAuditLogsRelationalAsync(conn, tx, rawVal);
                }
            }

            await tx.CommitAsync();
            return nextRev;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public static async Task ResetAllAsync(string connStr)
    {
        await using var conn = new SqlConnection(connStr);
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(@"
            TRUNCATE TABLE dbo.PortalUploadedFiles;
            TRUNCATE TABLE dbo.PortalCourseTeachers;
            TRUNCATE TABLE dbo.PortalTasks;
            TRUNCATE TABLE dbo.PortalProjects;
            TRUNCATE TABLE dbo.PortalCourses;
            TRUNCATE TABLE dbo.PortalUsers;
            TRUNCATE TABLE dbo.PortalNotifications;
            TRUNCATE TABLE dbo.PortalAuditLogs;
            TRUNCATE TABLE dbo.PortalStateStore;", conn);
        await cmd.ExecuteNonQueryAsync();
    }

    private static string GetStr(JsonElement el, string prop, string fallback = "")
        => el.ValueKind == JsonValueKind.Object && el.TryGetProperty(prop, out var v) && v.ValueKind == JsonValueKind.String
            ? (v.GetString() ?? fallback)
            : fallback;

    private static int GetInt(JsonElement el, string prop, int fallback = 0)
        => el.ValueKind == JsonValueKind.Object && el.TryGetProperty(prop, out var v) && v.ValueKind == JsonValueKind.Number && v.TryGetInt32(out var n)
            ? n
            : fallback;

    private static bool GetBool(JsonElement el, string prop, bool fallback = false)
        => el.ValueKind == JsonValueKind.Object && el.TryGetProperty(prop, out var v) && (v.ValueKind == JsonValueKind.True || v.ValueKind == JsonValueKind.False)
            ? v.GetBoolean()
            : fallback;

    private static async Task SyncCoursesRelationalAsync(SqlConnection conn, SqlTransaction tx, string json)
    {
        using var doc = JsonDocument.Parse(json);
        if (doc.RootElement.ValueKind != JsonValueKind.Object) return;

        await using (var clear = new SqlCommand("DELETE FROM dbo.PortalCourseTeachers; DELETE FROM dbo.PortalTasks; DELETE FROM dbo.PortalCourses;", conn, tx))
            await clear.ExecuteNonQueryAsync();

        foreach (var kv in doc.RootElement.EnumerateObject())
        {
            var c = kv.Value;
            if (c.ValueKind != JsonValueKind.Object) continue;
            var code = GetStr(c, "code", kv.Name);

            await using (var insC = new SqlCommand(@"
                INSERT INTO dbo.PortalCourses (CourseCode, Title, TeacherDisplay, Schedule, StudentVisibility, Progress, IsAdminCreated)
                VALUES (@c, @t, @td, @s, @v, @p, @a);", conn, tx))
            {
                insC.Parameters.AddWithValue("@c", code);
                insC.Parameters.AddWithValue("@t", GetStr(c, "title", code));
                insC.Parameters.AddWithValue("@td", GetStr(c, "teacher", "TBA"));
                insC.Parameters.AddWithValue("@s", GetStr(c, "schedule", ""));
                insC.Parameters.AddWithValue("@v", GetStr(c, "studentVisibility", "all"));
                insC.Parameters.AddWithValue("@p", GetInt(c, "progress", 0));
                insC.Parameters.AddWithValue("@a", GetBool(c, "isAdminCreated", false));
                await insC.ExecuteNonQueryAsync();
            }

            if (c.TryGetProperty("assignedTeacherIds", out var tArr) && tArr.ValueKind == JsonValueKind.Array)
            {
                foreach (var tidEl in tArr.EnumerateArray())
                {
                    var tid = tidEl.GetString();
                    if (string.IsNullOrWhiteSpace(tid)) continue;
                    await using var insCT = new SqlCommand(
                        "IF NOT EXISTS (SELECT 1 FROM dbo.PortalCourseTeachers WHERE CourseCode=@c AND TeacherId=@tid) INSERT INTO dbo.PortalCourseTeachers (CourseCode, TeacherId) VALUES (@c, @tid);", conn, tx);
                    insCT.Parameters.AddWithValue("@c", code);
                    insCT.Parameters.AddWithValue("@tid", tid);
                    await insCT.ExecuteNonQueryAsync();
                }
            }

            if (c.TryGetProperty("tasks", out var tasksEl) && tasksEl.ValueKind == JsonValueKind.Array)
            {
                foreach (var t in tasksEl.EnumerateArray())
                {
                    var taskId = GetStr(t, "id");
                    if (string.IsNullOrWhiteSpace(taskId)) continue;
                    int subCount = 0;
                    if (t.TryGetProperty("studentSubmissions", out var subEl) && subEl.ValueKind == JsonValueKind.Object)
                    {
                        foreach (var _ in subEl.EnumerateObject()) subCount++;
                    }
                    await using var insT = new SqlCommand(@"
                        IF NOT EXISTS (SELECT 1 FROM dbo.PortalTasks WHERE TaskId=@id)
                        INSERT INTO dbo.PortalTasks (TaskId, CourseCode, ProjectId, Title, TaskType, Status, DueDate, IsFinished, SubmissionsCount)
                        VALUES (@id, @c, @pid, @tt, @ty, @st, @due, @fin, @sc);", conn, tx);
                    insT.Parameters.AddWithValue("@id", taskId);
                    insT.Parameters.AddWithValue("@c", code);
                    insT.Parameters.AddWithValue("@pid", GetStr(t, "projectId"));
                    insT.Parameters.AddWithValue("@tt", GetStr(t, "title", "Task"));
                    insT.Parameters.AddWithValue("@ty", GetStr(t, "type", "Group"));
                    insT.Parameters.AddWithValue("@st", GetStr(t, "status", "Active"));
                    insT.Parameters.AddWithValue("@due", GetStr(t, "due", ""));
                    insT.Parameters.AddWithValue("@fin", GetBool(t, "isFinished", false));
                    insT.Parameters.AddWithValue("@sc", subCount);
                    await insT.ExecuteNonQueryAsync();
                }
            }
        }
    }

    private static async Task SyncUsersRelationalAsync(SqlConnection conn, SqlTransaction tx, string role, string json)
    {
        using var doc = JsonDocument.Parse(json);
        if (doc.RootElement.ValueKind != JsonValueKind.Object) return;

        await using (var clear = new SqlCommand("DELETE FROM dbo.PortalUsers WHERE UserRole = @r;", conn, tx))
        {
            clear.Parameters.AddWithValue("@r", role);
            await clear.ExecuteNonQueryAsync();
        }

        foreach (var kv in doc.RootElement.EnumerateObject())
        {
            var u = kv.Value;
            if (u.ValueKind != JsonValueKind.Object) continue;
            string assigned = "";
            if (u.TryGetProperty("courses", out var cArr) && cArr.ValueKind == JsonValueKind.Array)
            {
                assigned = string.Join(",", cArr.EnumerateArray().Select(x => x.GetString()).Where(s => !string.IsNullOrEmpty(s)));
            }
            var codeOrId = role == "teacher" ? GetStr(u, "facultyCode", kv.Name) : GetStr(u, "id", kv.Name);

            await using var ins = new SqlCommand(@"
                INSERT INTO dbo.PortalUsers (UserKey, UserRole, CodeOrId, FullName, ShortName, Email, MajorOrSpec, YearOrTitle, Status, AssignedCourses)
                VALUES (@uk, @r, @cid, @fn, @sn, @em, @ms, @yt, @st, @ac);", conn, tx);
            ins.Parameters.AddWithValue("@uk", $"{role}:{kv.Name}");
            ins.Parameters.AddWithValue("@r", role);
            ins.Parameters.AddWithValue("@cid", codeOrId);
            ins.Parameters.AddWithValue("@fn", GetStr(u, "fullName", kv.Name));
            ins.Parameters.AddWithValue("@sn", GetStr(u, "shortName", ""));
            ins.Parameters.AddWithValue("@em", GetStr(u, "email", ""));
            ins.Parameters.AddWithValue("@ms", role == "teacher" ? GetStr(u, "specialization", "") : GetStr(u, "major", ""));
            ins.Parameters.AddWithValue("@yt", role == "teacher" ? GetStr(u, "title", "") : GetStr(u, "year", ""));
            ins.Parameters.AddWithValue("@st", GetStr(u, "status", "Active"));
            ins.Parameters.AddWithValue("@ac", assigned);
            await ins.ExecuteNonQueryAsync();
        }
    }

    private static async Task SyncProjectsRelationalAsync(SqlConnection conn, SqlTransaction tx, string json)
    {
        using var doc = JsonDocument.Parse(json);
        if (doc.RootElement.ValueKind != JsonValueKind.Array) return;

        await using (var clear = new SqlCommand("DELETE FROM dbo.PortalProjects;", conn, tx))
            await clear.ExecuteNonQueryAsync();

        foreach (var p in doc.RootElement.EnumerateArray())
        {
            var pid = GetStr(p, "id");
            if (string.IsNullOrWhiteSpace(pid)) continue;
            var membersRaw = p.TryGetProperty("members", out var mEl) ? mEl.GetRawText() : "[]";

            await using var ins = new SqlCommand(@"
                IF NOT EXISTS (SELECT 1 FROM dbo.PortalProjects WHERE ProjectId=@pid)
                INSERT INTO dbo.PortalProjects (ProjectId, CourseCode, Title, Status, DueDate, CreatedBy, MembersJson)
                VALUES (@pid, @cc, @tt, @st, @due, @cb, @mj);", conn, tx);
            ins.Parameters.AddWithValue("@pid", pid);
            ins.Parameters.AddWithValue("@cc", GetStr(p, "course", ""));
            ins.Parameters.AddWithValue("@tt", GetStr(p, "title", "Project"));
            ins.Parameters.AddWithValue("@st", GetStr(p, "status", "Active"));
            ins.Parameters.AddWithValue("@due", GetStr(p, "dueDate", ""));
            ins.Parameters.AddWithValue("@cb", GetStr(p, "createdBy", ""));
            ins.Parameters.AddWithValue("@mj", membersRaw);
            await ins.ExecuteNonQueryAsync();
        }
    }

    private static async Task SyncNotificationsRelationalAsync(SqlConnection conn, SqlTransaction tx, string json)
    {
        using var doc = JsonDocument.Parse(json);
        if (doc.RootElement.ValueKind != JsonValueKind.Array) return;

        await using (var clear = new SqlCommand("DELETE FROM dbo.PortalNotifications;", conn, tx))
            await clear.ExecuteNonQueryAsync();

        foreach (var n in doc.RootElement.EnumerateArray())
        {
            var nid = GetStr(n, "id");
            if (string.IsNullOrWhiteSpace(nid)) continue;
            await using var ins = new SqlCommand(@"
                IF NOT EXISTS (SELECT 1 FROM dbo.PortalNotifications WHERE NotifId=@nid)
                INSERT INTO dbo.PortalNotifications (NotifId, TargetRole, CourseCode, Title, TaskTitle, IsNew, CreatedTime)
                VALUES (@nid, @tr, @cc, @tt, @tk, @isNew, @tm);", conn, tx);
            ins.Parameters.AddWithValue("@nid", nid);
            ins.Parameters.AddWithValue("@tr", GetStr(n, "targetRole", "student"));
            ins.Parameters.AddWithValue("@cc", GetStr(n, "course", ""));
            ins.Parameters.AddWithValue("@tt", GetStr(n, "title", ""));
            ins.Parameters.AddWithValue("@tk", GetStr(n, "taskTitle", ""));
            ins.Parameters.AddWithValue("@isNew", GetBool(n, "isNew", false));
            ins.Parameters.AddWithValue("@tm", GetStr(n, "time", ""));
            await ins.ExecuteNonQueryAsync();
        }
    }

    private static async Task SyncAuditLogsRelationalAsync(SqlConnection conn, SqlTransaction tx, string json)
    {
        using var doc = JsonDocument.Parse(json);
        if (doc.RootElement.ValueKind != JsonValueKind.Array) return;

        await using (var clear = new SqlCommand("DELETE FROM dbo.PortalAuditLogs;", conn, tx))
            await clear.ExecuteNonQueryAsync();

        foreach (var item in doc.RootElement.EnumerateArray())
        {
            await using var ins = new SqlCommand(@"
                INSERT INTO dbo.PortalAuditLogs (ActionTime, ActionName, Detail, Badge)
                VALUES (@tm, @act, @det, @bg);", conn, tx);
            ins.Parameters.AddWithValue("@tm", GetStr(item, "time", ""));
            ins.Parameters.AddWithValue("@act", GetStr(item, "action", ""));
            ins.Parameters.AddWithValue("@det", GetStr(item, "detail", ""));
            ins.Parameters.AddWithValue("@bg", GetStr(item, "badge", "LOG"));
            await ins.ExecuteNonQueryAsync();
        }
    }
}
