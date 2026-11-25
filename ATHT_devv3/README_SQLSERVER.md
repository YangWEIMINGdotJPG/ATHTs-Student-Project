# ATHT_devv3 — Full-Stack Web Portal Connected to Microsoft SQL Server

เวอร์ชัน **ATHT_devv3** รวมฟีเจอร์ทั้งหมดจาก `ATHT_devv2` เข้ากับ **ASP.NET Core 8.0 Web API** และเชื่อมต่อ **Microsoft SQL Server (`ATHT_StudentProjectDB`)** แบบเรียลไทม์

## วิธีเปิดใช้งาน
1. ตรวจสอบว่าบริการ SQL Server (`MSSQLSERVER`) กำลังทำงานอยู่ (หรือปรับ Connection String ใน `appsettings.json` ตามเครื่องที่ใช้)
2. ดับเบิลคลิกไฟล์ `start-sqlserver.bat` หรือเปิด Terminal ในโฟลเดอร์ `ATHT_devv3` แล้วรัน:
   ```powershell
   dotnet run
   ```
3. เปิดเบราว์เซอร์ไปที่ **`http://localhost:5080`**

## ตารางใน SQL Server (`ATHT_StudentProjectDB`)
ระบบจะสร้างตารางอัตโนมัติทันทีที่เปิดรัน (หรือสามารถรันสคริปต์ `Database/setup_atht_devv3_sqlserver.sql` ใน SSMS ด้วยตนเองก็ได้):
- `dbo.PortalStateStore` — เก็บ Snapshot State หลักพร้อมหมายเลข Revision
- `dbo.PortalCourses` — รายวิชาทั้งหมด (รหัสวิชา, ชื่อวิชา, อาจารย์, ตารางเรียน, สิทธิ์การมองเห็นของนักศึกษา)
- `dbo.PortalCourseTeachers` — ตารางความสัมพันธ์กำหนดสิทธิ์ว่าอาจารย์ท่านใดเห็นรายวิชาไหนบ้าง
- `dbo.PortalUsers` — บัญชีนักศึกษาและอาจารย์ทั้งหมด
- `dbo.PortalProjects` — โปรเจกต์ของนักศึกษา
- `dbo.PortalTasks` — งานย่อยและจำนวนการส่งงาน
- `dbo.PortalNotifications` — การแจ้งเตือนในระบบ
- `dbo.PortalAuditLogs` — ประวัติการแก้ไขฝั่ง Admin

## API Endpoints
- `GET /api/health` — เช็กสถานะ SQL Server และจำนวนข้อมูลในฐานข้อมูล
- `GET /api/version` — เช็กเลข Revision ล่าสุดสำหรับซิงค์ข้อมูลระหว่างเบราว์เซอร์/แท็บ
- `GET /api/bootstrap` — ดึงข้อมูลทั้งหมดจาก SQL Server
- `POST /api/sync` — บันทึกการเปลี่ยนแปลงลง SQL Server แบบ Transaction
- `POST /api/reset` — รีเซ็ตข้อมูลกลับเป็นค่าเริ่มต้น
