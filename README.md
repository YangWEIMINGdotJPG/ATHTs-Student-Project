# ATHT Student Project Tracking (KMUTT)

เว็บแอปพลิเคชันระบบติดตามงานโปรเจกต์นักศึกษา รองรับบทบาท **Student**, **Teacher**, และ **Admin** (ภาษาไทย/อังกฤษ, Dark Mode, ธีมเทศกาล, แอนิเมชัน, Mobile/Laptop Responsive, หน้า `support.html`)

## 1. เวอร์ชันหน้าเว็บออนไลน์ (GitHub Pages — Root)
เปิดใช้งานออนไลน์ผ่าน GitHub Pages ได้ทันที:
- `index.html`, `support.html`, `styles.css`, `js/01-data.js` – `js/05-admin.js`
- Deploy อัตโนมัติผ่าน `.github/workflows/deploy.yml`

## 2. เวอร์ชันเชื่อมฐานข้อมูลจริง (`ATHT_devv3/` — ASP.NET Core 8.0 + Microsoft SQL Server Realtime)
อยู่ในโฟลเดอร์ [`ATHT_devv3/`](./ATHT_devv3/) รองรับ **Realtime Sync (Server-Sent Events)** และการเก็บข้อมูล+ไฟล์ส่งงานลง **Microsoft SQL Server (`ATHT_StudentProjectDB`)**:
1. เปิด SQL Server บนเครื่อง (หรือตั้งค่า Connection String ใน `ATHT_devv3/appsettings.json`)
2. เข้าโฟลเดอร์ `ATHT_devv3` แล้วรัน:
   ```powershell
   dotnet run
   ```
   (หรือดับเบิลคลิก `ATHT_devv3/start-sqlserver.bat`)
3. เปิดเบราว์เซอร์ไปที่ `http://localhost:5080`
