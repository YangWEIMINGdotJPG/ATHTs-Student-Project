    const uiPhrasePairs = [
      ['ATHT Student Project', 'ระบบจัดการโครงงานนักศึกษา ATHT'],
      ['LOGIN', 'เข้าสู่ระบบ'],
      ['Email / Student ID', 'อีเมล / รหัสนักศึกษา'],
      ['Password', 'รหัสผ่าน'],
      ['Remember me', 'จดจำฉันไว้'],
      ['Forgot Password?', 'ลืมรหัสผ่าน?'],
      ['Quick Role Access (Demo Accounts)', 'เข้าสู่ระบบด่วน (บัญชีทดลอง)'],
      ['🎓 Student', '🎓 นักศึกษา'],
      ['👨‍🏫 Teacher', '👨‍🏫 อาจารย์'],
      ['🛡️ Admin', '🛡️ ผู้ดูแลระบบ'],
      ['Notifications', 'การแจ้งเตือน'],
      ['Notification', 'การแจ้งเตือน'],
      ['Sign Out', 'ออกจากระบบ'],
      ['Home', 'หน้าหลัก'],
      ['← Back', '← ย้อนกลับ'],
      ['KMUTT Connected', 'เชื่อมต่อ มจธ. แล้ว'],
      ['Academic Term 1/2026', 'ภาคการศึกษา 1/2569'],
      ['SEMESTER 1 / 2026', 'ภาคการศึกษาที่ 1 / 2569'],
      ['Courses', 'รายวิชา'],
      ['All Tasks', 'งานทั้งหมด'],
      ['Projects', 'โปรเจกต์'],
      ['Project', 'โปรเจกต์'],
      ['Select a subject to view course projects & deliverables', 'เลือกรายวิชาเพื่อดูโปรเจกต์และงานที่ต้องส่ง'],
      ['Enrolled Courses', 'รายวิชาที่ลงทะเบียน'],
      ['Semester 1 / 2026 Academic Term • Computer Multimedia', 'ภาคการศึกษา 1/2569 • สาขาวิชาคอมพิวเตอร์และสื่อมัลติมีเดีย'],
      ['Overview', 'ภาพรวม'],
      ['COMPLETED TASKS', 'งานที่ส่งแล้ว'],
      ['Completed Tasks', 'งานที่ส่งแล้ว'],
      ['COURSE TASKS', 'งานในรายวิชา'],
      ['Course Tasks', 'งานในรายวิชา'],
      ['Publish Date', 'วันที่ประกาศ'],
      ['Due Date', 'กำหนดส่ง'],
      ['Team Members', 'สมาชิกในทีม'],
      ['UPLOAD ASSIGNMENT', 'ส่งงาน / อัปโหลดไฟล์'],
      ['Attach assignment file', 'แนบไฟล์งาน'],
      ['Click or drag & drop solution files here to upload', 'คลิกหรือลากไฟล์งานมาวางที่นี่เพื่ออัปโหลด'],
      ['PDF, ZIP or PNG', 'รองรับไฟล์ PDF, ZIP หรือ PNG'],
      ['UPLOAD FILES', 'ส่งงาน'],
      ['FILES', 'ไฟล์งาน'],
      ['FILES & SUBMISSIONS', 'ไฟล์งานและประวัติการส่ง'],
      ['DOWNLOAD FILE', 'ดาวน์โหลดไฟล์'],
      ['DESCRIPTION', 'รายละเอียด'],
      ['Description', 'รายละเอียด'],
      ['Feedback Note', 'ข้อเสนอแนะจากอาจารย์'],
      ['Grade Score', 'คะแนน'],
      ['Send', 'บันทึกคะแนน'],
      ['Create Project', 'สร้างโปรเจกต์'],
      ['+ Create Project', '+ สร้างโปรเจกต์'],
      ['Add Task', 'เพิ่มงาน'],
      ['+ Add Task', '+ เพิ่มงาน'],
      ['Edit Task', 'แก้ไขงาน'],
      ['Submit', 'บันทึก'],
      ['Cancel', 'ยกเลิก'],
      ['Close', 'ปิด'],
      ['Save', 'บันทึก'],
      ['Delete', 'ลบ'],
      ['View', 'ดูงาน'],
      ['EDIT', 'แก้ไข'],
      ['Edit', 'แก้ไข'],
      ['Task', 'ชื่องาน'],
      ['Tasks', 'รายการงาน'],
      ['Date modified', 'วันที่แก้ไขล่าสุด'],
      ['Status', 'สถานะ'],
      ['Email', 'อีเมล'],
      ['Student', 'นักศึกษา'],
      ['Teacher', 'อาจารย์'],
      ['Admin', 'ผู้ดูแลระบบ'],
      ['Timetable', 'ตารางเรียนและกำหนดส่ง'],
      ['Timetable & Due Dates', 'ตารางเรียนและกำหนดส่ง'],
      ['Project Due Dates & Timetable', 'กำหนดส่งโปรเจกต์และตารางสอน'],
      ['Term', 'เทอมนี้'],
      ['Active Courses', 'รายวิชาที่เปิดสอน'],
      ['Students', 'นักศึกษา'],
      ['Teachers', 'อาจารย์ผู้สอน'],
      ['All Users', 'ผู้ใช้ทั้งหมด'],
      ['Active Only', 'ใช้งานอยู่เท่านั้น'],
      ['Suspended / Inactive', 'ระงับการใช้งาน'],
      ['Add Student', 'เพิ่มนักศึกษา'],
      ['Add Teacher', 'เพิ่มอาจารย์'],
      ['Course Projects', 'โปรเจกต์ในรายวิชา'],
      ['Student Projects', 'โปรเจกต์นักศึกษา'],
      ['← Projects', '← กลับหน้าโปรเจกต์'],
      ['← รายชื่อนักศึกษา', '← รายชื่อนักศึกษา'],
      ['← กลับหน้ารายชื่อนักศึกษา', '← กลับหน้ารายชื่อนักศึกษา'],
      ['📁 Projects', '📁 โปรเจกต์'],
      ['Filter: All Status', 'ตัวกรอง: ทุกสถานะ'],
      ['Filter: ส่งแล้ว (Complete)', 'ตัวกรอง: ส่งแล้ว'],
      ['Filter: รอแก้ (Revision)', 'ตัวกรอง: รอแก้'],
      ['Filter: ยังไม่ส่ง (Uncompleted)', 'ตัวกรอง: ยังไม่ส่ง'],
      ['Sort: ID น้อย → มาก', 'เรียง: รหัส น้อย → มาก'],
      ['Sort: ID มาก → น้อย', 'เรียง: รหัส มาก → น้อย'],
      ['Sort: ชื่อ A → Z', 'เรียง: ชื่อ A → Z'],
      ['ส่งแก้ (รอแก้)', 'ส่งแก้ (รอแก้)'],
      ['กำลังตรวจงานนักศึกษา', 'กำลังตรวจงานนักศึกษา'],
      ['รายการงานที่ส่งในรายวิชานี้ (Tasks)', 'รายการงานที่ส่งในรายวิชานี้ (Tasks)'],
      ['ยังไม่มีไฟล์ส่งงาน', 'ยังไม่มีไฟล์ส่งงาน'],
      ['นักศึกษายังไม่ได้อัปโหลดไฟล์งาน', 'นักศึกษายังไม่ได้อัปโหลดไฟล์งาน'],
      ['ยังไม่มีประวัติการส่งงาน', 'ยังไม่มีประวัติการส่งงาน'],
      ['System Festival Theme (Global)', 'ธีมเทศกาลทั้งระบบ (ใช้ร่วมกันทุกบทบาท)'],
      ['Notifications & Announcements', 'การแจ้งเตือนและประกาศ'],
      ['Class announcements, grades published, & project team updates', 'ประกาศจากชั้นเรียน ผลคะแนน และความคืบหน้าของทีม'],
      ['Track and filter assignments across all enrolled subjects', 'ติดตามและคัดกรองงานที่ได้รับมอบหมายในทุกรายวิชา'],
      ['All Course Tasks', 'งานในรายวิชาทั้งหมด'],
      ['Manage Students', 'จัดการนักศึกษา'],
      ['Manage Teachers', 'จัดการอาจารย์'],
      ['All Directory', 'รายชื่อทั้งหมด'],
      ['User Management', 'จัดการผู้ใช้'],
      ['System Administrator', 'ผู้ดูแลระบบ'],
      ['KMUTT Directory Control', 'ศูนย์ควบคุมบัญชี มจธ.'],
      ['Add New User', 'เพิ่มผู้ใช้ใหม่'],
      ['Add New Student', 'เพิ่มนักศึกษาใหม่'],
      ['Add New Teacher', 'เพิ่มอาจารย์ใหม่'],
      ['Export CSV', 'ส่งออก CSV'],
      ['Active Directory', 'ภาพรวมบัญชีในระบบ'],
      ['Total Users', 'ผู้ใช้ทั้งหมด'],
      ['ACTIVE', 'ใช้งานอยู่'],
      ['Enrolled Students', 'นักศึกษาในระบบ'],
      ['Undergraduate • CSM', 'ปริญญาตรี • สาขา CSM'],
      ['Faculty Teachers', 'อาจารย์ผู้สอน'],
      ['Advisors & Coordinators', 'อาจารย์ที่ปรึกษาและผู้ประสานงาน'],
      ['Active Accounts', 'บัญชีที่เปิดใช้งาน'],
      ['Verified KMUTT SSO', 'ยืนยันตัวตน KMUTT SSO แล้ว'],
      ['Status: All', 'สถานะ: ทั้งหมด'],
      ['All Courses (CMM)', 'ทุกรายวิชา (CMM)'],
      ['CMM321 Graphics Math', 'CMM321 คณิตศาสตร์คอมพิวเตอร์กราฟิก'],
      ['CMM349 Web App Dev', 'CMM349 การพัฒนาเว็บแอปพลิเคชัน'],
      ['CMM310 Game Design', 'CMM310 การออกแบบและพัฒนาเกม'],
      ['CMM390 Project Management', 'CMM390 การจัดการโครงการ'],
      ['CMM320 Light and Sound Physics', 'CMM320 ฟิสิกส์แสงและเสียง'],
      ['GEN121 Learning & Problem Solving', 'GEN121 การเรียนรู้และการแก้ปัญหา'],
      ['Click "View As" to preview the portal as that Student or Teacher, or "Edit" to modify details.', 'กด "ดูมุมมองผู้ใช้" เพื่อทดลองดูพอร์ทัลแทนนักศึกษา/อาจารย์ หรือกด "แก้ไข" เพื่อปรับปรุงข้อมูล'],
      ['Reset Directory to Default', 'รีเซ็ตรายชื่อกลับเป็นค่าเริ่มต้น'],
      ['ID / Code', 'รหัสประจำตัว'],
      ['Full Name & Role', 'ชื่อ-นามสกุล และบทบาท'],
      ['Linked KMUTT Email', 'อีเมล มจธ.'],
      ['Department / Courses', 'สาขาวิชา / รายวิชา'],
      ['Actions', 'จัดการ'],
      ['View As', 'ดูมุมมองผู้ใช้'],
      ['● Active', '● ใช้งานอยู่'],
      ['○ Suspended', '○ ระงับใช้งาน'],
      ['KMUTT SSO Verified', 'ยืนยันตัวตน KMUTT SSO แล้ว'],
      ['No matching user accounts found', 'ไม่พบบัญชีผู้ใช้ที่ตรงกับการค้นหา'],
      ['Try clearing your search query or adding a new user account.', 'ลองล้างคำค้นหาหรือเพิ่มบัญชีผู้ใช้ใหม่'],
      ['Recent Directory Audit Log', 'ประวัติการแก้ไขข้อมูลล่าสุด'],
      ['Clear Log', 'ล้างประวัติ'],
      ['No recent directory changes recorded.', 'ยังไม่มีบันทึกการแก้ไขข้อมูล'],
      ['Portal Role Inspector', 'โหมดตรวจสอบมุมมองระบบ'],
      ['Preview Student & Teacher Views', 'ทดลองสลับดูมุมมองนักศึกษาและอาจารย์'],
      ['Test how changes to student rosters and instructor assignments appear in real time across the Student and Teacher portals.', 'ทดสอบการแสดงผลรายชื่อนักศึกษาและรายวิชาที่มอบหมายในหน้าต่างนักศึกษาและอาจารย์แบบเรียลไทม์'],
      ['Student View', 'มุมมองนักศึกษา'],
      ['Teacher View', 'มุมมองอาจารย์'],
      ['Register or update KMUTT user identity & permissions', 'ลงทะเบียนหรืออัปเดตข้อมูลและสิทธิ์ผู้ใช้ มจธ.'],
      ['Account Role', 'บทบาทบัญชี'],
      ['Teacher / Instructor', 'อาจารย์ผู้สอน'],
      ['Student ID (11 Digits) *', 'รหัสนักศึกษา (11 หลัก) *'],
      ['Faculty Code / Instructor ID *', 'รหัสประจำตัวอาจารย์ *'],
      ['Account Status', 'สถานะบัญชี'],
      ['🟢 Active', '🟢 ใช้งานอยู่'],
      ['🔴 Suspended / Inactive', '🔴 ระงับใช้งานชั่วคราว'],
      ['Full Name *', 'ชื่อ-นามสกุล *'],
      ['Display Name', 'ชื่อแสดงผล'],
      ['Linked KMUTT Email *', 'อีเมล มจธ. *'],
      ['Major / Curriculum', 'สาขาวิชา / หลักสูตร'],
      ['Academic Year', 'ชั้นปี'],
      ['Year 2 (Cohort 67)', 'ปี 2 (รหัส 67)'],
      ['Year 1 (Cohort 68)', 'ปี 1 (รหัส 68)'],
      ['Year 3 (Cohort 66)', 'ปี 3 (รหัส 66)'],
      ['Year 4 (Cohort 65)', 'ปี 4 (รหัส 65)'],
      ['Academic Title', 'ตำแหน่งทางวิชาการ'],
      ['Specialization', 'ความเชี่ยวชาญ'],
      ['Assigned Courses', 'รายวิชาที่รับผิดชอบ'],
      ['Save User Account', 'บันทึกบัญชีผู้ใช้'],
      ['Create Student Account', 'สร้างบัญชีนักศึกษา'],
      ['Save Student Changes', 'บันทึกการแก้ไขนักศึกษา'],
      ['Create Teacher Account', 'สร้างบัญชีอาจารย์'],
      ['Save Teacher Changes', 'บันทึกการแก้ไขอาจารย์'],
      ['Add New Teacher / Instructor', 'เพิ่มอาจารย์ผู้สอนใหม่'],
      ['Remove User Account?', 'ต้องการลบบัญชีผู้ใช้นี้?'],
      ['Are you sure you want to remove this user from the KMUTT directory?', 'คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีนี้ออกจากระบบ มจธ.?'],
      ['Yes, Remove', 'ยืนยันการลบ'],
      ['SYSTEM', 'ระบบ'],
      ['SYNC', 'ซิงค์'],
      ['RESET', 'รีเซ็ต'],
      ['EXPORT', 'ส่งออก'],
      ['System Initialized', 'เริ่มต้นระบบสำเร็จ'],
      ['Loaded 81 Undergraduate Students and 3 Faculty Instructors into KMUTT Directory.', 'นำเข้านักศึกษา 81 คน และอาจารย์ผู้สอน 3 ท่านเข้าสู่ระบบ มจธ. แล้ว'],
      ['Course Roster Synced', 'ซิงค์รายชื่อรายวิชาแล้ว'],
      ['Verified CMM321, CMM349, and CMM310 instructor permissions.', 'ตรวจสอบสิทธิ์อาจารย์ผู้สอน CMM321, CMM349 และ CMM310 เรียบร้อย'],
      ['Created Student Account', 'สร้างบัญชีนักศึกษา'],
      ['Updated Student Account', 'อัปเดตบัญชีนักศึกษา'],
      ['Created Teacher Account', 'สร้างบัญชีอาจารย์'],
      ['Updated Teacher Account', 'อัปเดตบัญชีอาจารย์'],
      ['Status Changed', 'เปลี่ยนสถานะบัญชี'],
      ['Removed Student', 'ลบบัญชีนักศึกษา'],
      ['Removed Teacher', 'ลบบัญชีอาจารย์'],
      ['Directory Reset', 'รีเซ็ตรายชื่อเริ่มต้น'],
      ['Restored default 81 Students and 3 Faculty Instructors.', 'กู้คืนรายชื่อนักศึกษา 81 คน และอาจารย์ 3 ท่านเป็นค่าเริ่มต้นแล้ว'],
      ['Exported CSV', 'ส่งออกไฟล์ CSV'],
      ['Tracking v2', 'ติดตามผล v2'],
      ['No Projects Found', 'ไม่พบโปรเจกต์'],
      ['Review & Grade', 'ตรวจและให้คะแนน'],
      ['ATHT Navigation', 'เมนูนำทาง ATHT'],
      ['KMUTT Mobile Portal', 'พอร์ทัลมือถือ มจธ.'],
      ['System Admin', 'ผู้ดูแลระบบ'],
      ['Select a subject to manage projects, due dates, and student submissions', 'เลือกรายวิชาเพื่อจัดการโปรเจกต์ กำหนดส่ง และตรวจงานนักศึกษา'],
      ['STUDENT MEMBERS', 'รายชื่อนักศึกษา'],
      ['Project Tasks', 'งานในโปรเจกต์'],
      ['Modify assessment guidelines, milestones, and submission deadline', 'แก้ไขคำอธิบายงาน เกณฑ์การประเมิน และกำหนดส่ง'],
      ['Name', 'ชื่องาน'],
      ['Due Time', 'เวลาส่ง'],
      ['Save Task', 'บันทึกงาน'],
      ['Remove', 'ลบ'],
      ['Create or update course project details', 'สร้างหรือแก้ไขรายละเอียดโปรเจกต์ของรายวิชา'],
      ['Project Name *', 'ชื่อโปรเจกต์ *'],
      ['Time', 'เวลาส่ง'],
      ['Step Evaluation', 'ประเมินผลตามขั้นตอน'],
      ['Step Status', 'สถานะขั้นตอน'],
      ['Approved / Passed', 'ผ่าน / อนุมัติแล้ว'],
      ['Revision Requested', 'ส่งกลับแก้ไข'],
      ['In Review', 'กำลังตรวจสอบ'],
      ['Add New Assessment Task', 'เพิ่มงานประเมินใหม่'],
      ['Create a task milestone for this course', 'สร้างหัวข้องานหรือเป้าหมายการส่งสำหรับวิชานี้'],
      ['Task Title', 'ชื่องาน'],
      ['Assignment Type', 'รูปแบบงาน'],
      ['Individual (1 Member)', 'งานเดี่ยว (1 คน)'],
      ['Pair (2 Members)', 'งานคู่ (2 คน)'],
      ['Group Project (4 Members)', 'งานกลุ่ม (4 คน)'],
      ['Add Project Task', 'เพิ่มงานในโปรเจกต์'],
      ['Add a deliverable milestone or assignment to this project', 'เพิ่มหัวข้องานหรือเป้าหมายย่อยในโปรเจกต์นี้'],
      ['Task Title *', 'ชื่องาน *'],
      ['Task Type', 'ประเภทงาน'],
      ['Group Project', 'งานกลุ่ม'],
      ['Individual', 'งานเดี่ยว'],
      ['Team Members (Group Project)', 'สมาชิกในทีม (งานกลุ่ม)'],
      ['+ Add', '+ เพิ่ม'],
      ['Update task title and description', 'แก้ไขชื่องานและรายละเอียด'],
      ['Due date is set by the course instructor. Task status is updated automatically upon submission and grading.', 'กำหนดส่งถูกตั้งโดยอาจารย์ผู้สอน สถานะงานจะอัปเดตอัตโนมัติเมื่อส่งงานและตรวจให้คะแนน'],
      ['Save Changes', 'บันทึกการแก้ไข'],
      ['Create New Project', 'สร้างโปรเจกต์ใหม่'],
      ['Initiate a team project for grading and review', 'เริ่มต้นโปรเจกต์กลุ่มเพื่อติดตามงานและส่งอาจารย์ตรวจ'],
      ['Project Title *', 'ชื่อโปรเจกต์ *'],
      ['Course *', 'รายวิชา *'],
      ['Project Summary / Scope', 'สรุปขอบเขตโปรเจกต์'],
      ['Repository or Figma URL', 'ลิงก์ GitHub หรือ Figma'],
      ['Defaults to your active student ID. You can add more teammates.', 'ค่าเริ่มต้นเป็นรหัสของคุณ สามารถเพิ่มเพื่อนร่วมทีมได้'],
      ['Project Team', 'สมาชิกทีมโปรเจกต์'],
      ['Reply', 'ตอบกลับ'],
      ['Contact Support', 'ติดต่อฝ่ายสนับสนุน'],
      ['Privacy Policy', 'นโยบายความเป็นส่วนตัว'],
      ['System Version 2.4', 'เวอร์ชันระบบ 2.4'],
      ['Sun', 'อา.'],
      ['Mon', 'จ.'],
      ['Tue', 'อ.'],
      ['Wed', 'พ.'],
      ['Thu', 'พฤ.'],
      ['Fri', 'ศ.'],
      ['Sat', 'ส.']
    ];

    const uiEnToTh = new Map(uiPhrasePairs);
    const uiEnToThLower = new Map(uiPhrasePairs.map(([en, th]) => [en.toLowerCase(), th]));
    const uiThToEn = new Map();
    uiPhrasePairs.forEach(([en, th]) => {
      if (!uiThToEn.has(th)) uiThToEn.set(th, en);
    });
    // Extra reverse mappings for mixed strings
    uiThToEn.set('ตัวกรอง: ทุกสถานะ', 'Filter: All Status');
    uiThToEn.set('ตัวกรอง: ส่งแล้ว', 'Filter: Complete');
    uiThToEn.set('ตัวกรอง: รอแก้', 'Filter: Revision');
    uiThToEn.set('ตัวกรอง: ยังไม่ส่ง', 'Filter: Uncompleted');
    uiThToEn.set('Filter: ส่งแล้ว (Complete)', 'Filter: Complete');
    uiThToEn.set('Filter: รอแก้ (Revision)', 'Filter: Revision');
    uiThToEn.set('Filter: ยังไม่ส่ง (Uncompleted)', 'Filter: Uncompleted');
    uiThToEn.set('เรียง: รหัส น้อย → มาก', 'Sort: ID Asc');
    uiThToEn.set('เรียง: รหัส มาก → น้อย', 'Sort: ID Desc');
    uiThToEn.set('เรียง: ชื่อ A → Z', 'Sort: Name A → Z');
    uiThToEn.set('Sort: ID น้อย → มาก', 'Sort: ID Asc');
    uiThToEn.set('Sort: ID มาก → น้อย', 'Sort: ID Desc');
    uiThToEn.set('Sort: ชื่อ A → Z', 'Sort: Name A → Z');
    uiThToEn.set('ส่งแก้ (รอแก้)', 'Request Revision');
    uiThToEn.set('กำลังตรวจงานนักศึกษา', 'Reviewing Student Submission');
    uiThToEn.set('รายการงานที่ส่งในรายวิชานี้ (Tasks)', 'Submitted Tasks History (Tasks)');
    uiThToEn.set('← รายชื่อนักศึกษา', '← Student List');
    uiThToEn.set('ยังไม่มีไฟล์ส่งงาน', 'No file submitted yet');
    uiThToEn.set('นักศึกษายังไม่ได้อัปโหลดไฟล์งาน', 'Student has not uploaded a file yet');
    uiThToEn.set('ยังไม่มีประวัติการส่งงาน', 'No submission history yet');
    uiThToEn.set('ยังไม่มีข้อเสนอแนะ', 'No feedback yet');
    uiThToEn.set('ส่งแล้ว', 'Submitted');
    uiThToEn.set('รอแก้', 'Revision');
    uiThToEn.set('ยังไม่ส่ง', 'Uncompleted');

    function findPhraseTranslation(text, lang) {
      if (!text) return null;
      const trimmed = text.trim();
      if (!trimmed) return null;
      if (lang === 'th') {
        if (uiEnToTh.has(trimmed)) return uiEnToTh.get(trimmed);
        if (uiEnToThLower.has(trimmed.toLowerCase())) return uiEnToThLower.get(trimmed.toLowerCase());
        let m;
        if ((m = trimmed.match(/^Today,\s*(.+)$/i))) return `วันนี้, ${m[1]}`;
        if ((m = trimmed.match(/^Exported\s+(\d+)\s+user\s+records\s+to\s+CSV\.?$/i))) return `ส่งออกข้อมูลผู้ใช้ ${m[1]} รายการเป็น CSV แล้ว`;
        if ((m = trimmed.match(/^Showing\s+(\d+)\s+Students?$/i))) return `แสดงนักศึกษา ${m[1]} คน`;
        if ((m = trimmed.match(/^Showing\s+(\d+)\s+Teachers?$/i))) return `แสดงอาจารย์ ${m[1]} ท่าน`;
        if ((m = trimmed.match(/^Showing\s+(\d+)\s+Users?$/i))) return `แสดงผู้ใช้ทั้งหมด ${m[1]} คน`;
        if ((m = trimmed.match(/^(\d+)\s+Courses?\s*•\s*(\d+)\s+Projects?\s*•\s*(\d+)\s+Tasks?$/i))) return `${m[1]} วิชา • ${m[2]} โปรเจกต์ • ${m[3]} งาน`;
        if ((m = trimmed.match(/^(\d+)\s+Enrolled\s+Courses?$/i))) return `ลงทะเบียน ${m[1]} รายวิชา`;
        if ((m = trimmed.match(/^(\d+)\s+Active\s+Subjects?$/i))) return `เรียน ${m[1]} วิชา`;
        if ((m = trimmed.match(/^(\d+)\s+Tasks?\s+in\s+this\s+course$/i))) return `${m[1]} งานในวิชานี้`;
        if ((m = trimmed.match(/^Group\s+Project\s*\((\d+)\s+Members?\)$/i))) return `งานกลุ่ม (${m[1]} คน)`;
        if ((m = trimmed.match(/^Teacher:\s*(.+)$/i))) return `อาจารย์ผู้สอน: ${m[1]}`;
        if ((m = trimmed.match(/^(\d+)\s+Users?$/i))) return `ผู้ใช้ ${m[1]} คน`;
        if ((m = trimmed.match(/^(\d+)\s+Students?$/i))) return `${m[1]} คน`;
        if ((m = trimmed.match(/^(\d+)\s+Tasks?$/i))) return `${m[1]} งาน`;
        if ((m = trimmed.match(/^(\d+)\s+Members?$/i))) return `${m[1]} สมาชิก`;
        if ((m = trimmed.match(/^(\d+)\s+Projects?$/i))) return `${m[1]} โปรเจกต์`;
        return null;
      } else {
        if (uiThToEn.has(trimmed)) return uiThToEn.get(trimmed);
        let m;
        if ((m = trimmed.match(/^วันนี้,\s*(.+)$/))) return `Today, ${m[1]}`;
        if ((m = trimmed.match(/^ส่งออกข้อมูลผู้ใช้\s+(\d+)\s+รายการเป็น CSV แล้ว$/))) return `Exported ${m[1]} user records to CSV.`;
        if ((m = trimmed.match(/^แสดงนักศึกษา\s+(\d+)\s+คน$/))) return `Showing ${m[1]} Students`;
        if ((m = trimmed.match(/^แสดงอาจารย์\s+(\d+)\s+ท่าน$/))) return `Showing ${m[1]} Teachers`;
        if ((m = trimmed.match(/^แสดงผู้ใช้ทั้งหมด\s+(\d+)\s+คน$/))) return `Showing ${m[1]} Users`;
        if ((m = trimmed.match(/^(\d+)\s+วิชา\s*•\s*(\d+)\s+โปรเจกต์\s*•\s*(\d+)\s+งาน$/))) return `${m[1]} Courses • ${m[2]} Projects • ${m[3]} Tasks`;
        if ((m = trimmed.match(/^ลงทะเบียน\s+(\d+)\s+รายวิชา$/))) return `${m[1]} Enrolled Courses`;
        if ((m = trimmed.match(/^เรียน\s+(\d+)\s+วิชา$/))) return `${m[1]} Active Subjects`;
        if ((m = trimmed.match(/^(\d+)\s+งานในวิชานี้$/))) return `${m[1]} Tasks in this course`;
        if ((m = trimmed.match(/^งานกลุ่ม\s*\((\d+)\s+คน\)$/))) return `Group Project (${m[1]} Members)`;
        if ((m = trimmed.match(/^อาจารย์ผู้สอน:\s*(.+)$/))) return `Teacher: ${m[1]}`;
        if ((m = trimmed.match(/^ผู้ใช้\s+(\d+)\s+คน$/))) return `${m[1]} Users`;
        if ((m = trimmed.match(/^ส่งแล้ว\s*\((\d+\/\d+)\s*งาน\)$/))) return `Submitted (${m[1]} Tasks)`;
        if ((m = trimmed.match(/^รอแก้\s*\((\d+\/\d+)\s*งาน\)$/))) return `Revision (${m[1]} Tasks)`;
        if ((m = trimmed.match(/^ยังไม่ส่ง\s*\((\d+\/\d+)\s*งาน\)$/))) return `Uncompleted (${m[1]} Tasks)`;
        if ((m = trimmed.match(/^ส่งแล้ว\s*\((\d+)\s*ครั้ง\)$/))) return `Submitted (${m[1]})`;
        if ((m = trimmed.match(/^รอแก้\s*\((\d+)\s*ครั้ง\)$/))) return `Revision (${m[1]})`;
        if ((m = trimmed.match(/^ครั้งที่\s*(\d+)\s*\(([^)]+)\)$/))) {
          const tag = m[2] === 'รอแก้' ? 'Revision' : 'Submitted';
          return `Attempt #${m[1]} (${tag})`;
        }
        if ((m = trimmed.match(/^ส่งงานทั้งหมด\s*(\d+)\s*ครั้ง$/))) return `${m[1]} Submissions`;
        if ((m = trimmed.match(/^(\d+)\s+คน$/))) return `${m[1]} Students`;
        if ((m = trimmed.match(/^(\d+)\s+งาน$/))) return `${m[1]} Tasks`;
        if ((m = trimmed.match(/^(\d+)\s+สมาชิก$/))) return `${m[1]} Members`;
        if ((m = trimmed.match(/^(\d+)\s+โปรเจกต์$/))) return `${m[1]} Projects`;
        return null;
      }
    }

    function translateDOM(lang) {
      if (typeof document === 'undefined' || !document.querySelectorAll) return;
      const nodes = document.querySelectorAll('h1,h2,h3,h4,h5,p,span,label,button,option,th,a');
      nodes.forEach(el => {
        if (!el || el.children.length > 0) return;
        if (el.hasAttribute && el.hasAttribute('data-i18n')) return;
        const rawTxt = (typeof el.textContent === 'string' && el.textContent.trim()) ? el.textContent : el.innerText;
        const cur = (rawTxt || '').replace(/\s+/g, ' ').trim();
        if (!cur) return;

        // Only translate if current text (or previously translated text matching what we wrote) is a known UI phrase!
        let mapped = findPhraseTranslation(cur, lang);
        if (mapped === null && el.dataset && el.dataset.i18nLastApplied === cur && el.dataset.i18nOrig) {
          mapped = findPhraseTranslation(el.dataset.i18nOrig, lang);
          if (mapped === null && (el.dataset.i18nOrig === cur || uiEnToTh.has(el.dataset.i18nOrig) || uiEnToThLower.has(el.dataset.i18nOrig.toLowerCase()) || uiThToEn.has(el.dataset.i18nOrig))) {
            mapped = el.dataset.i18nOrig;
          }
        }
        if (mapped !== null) {
          if (el.dataset) {
            if (!el.dataset.i18nOrig || el.dataset.i18nLastApplied !== cur) {
              el.dataset.i18nOrig = cur;
            }
            el.dataset.i18nLastApplied = mapped;
          }
          if (mapped !== cur) {
            el.innerText = mapped;
          }
        }
      });

      const placeholderPairs = [
        ['Search ID, Name, Email...', 'ค้นหารหัส, ชื่อ, อีเมล...'],
        ['Search student name or ID...', 'ค้นหาชื่อนักศึกษา หรือรหัส ID...'],
        ['Write feedback or revision notes...', 'พิมพ์ข้อเสนอแนะหรือจุดที่ต้องแก้ไข...'],
        ['Reply to instructor...', 'ตอบกลับอาจารย์ผู้สอน...'],
        ['Reply...', 'ตอบกลับ...'],
        ['Search projects or team...', 'ค้นหาโปรเจกต์ หรือสมาชิก...'],
        ['Describe the task scope, rubric, and deliverables...', 'อธิบายขอบเขตงาน เกณฑ์การให้คะแนน และสิ่งที่ต้องส่ง...'],
        ['Brief explanation of technical objectives and deliverables...', 'สรุปวัตถุประสงค์และสิ่งที่ต้องส่งของโปรเจกต์...'],
        ['Task requirements and submission guidelines...', 'ระบุข้อกำหนดและแนวทางการส่งงาน...'],
        ['Provide actionable feedback for this step milestone...', 'ระบุข้อเสนอแนะสำหรับขั้นตอนนี้...']
      ];
      document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(inp => {
        if (!inp.dataset) return;
        if (!inp.dataset.i18nPhOrig) inp.dataset.i18nPhOrig = inp.placeholder || '';
        const origPh = inp.dataset.i18nPhOrig;
        for (const [enPh, thPh] of placeholderPairs) {
          if (origPh === enPh || origPh === thPh) {
            inp.placeholder = lang === 'th' ? thPh : enPh;
            break;
          }
        }
      });
    }

    function applyLanguage(lang) {
      currentLanguage = lang || 'en';
      localStorage.setItem('atht_lang', currentLanguage);

      const headerLangText = document.getElementById('headerLangText');
      const loginLangText = document.getElementById('loginLangText');
      const drawerLangText = document.getElementById('drawerLangText');

      if (headerLangText) headerLangText.innerText = currentLanguage === 'en' ? 'EN' : 'TH';
      if (loginLangText) loginLangText.innerText = currentLanguage === 'en' ? 'EN' : 'TH';
      if (drawerLangText) drawerLangText.innerText = currentLanguage === 'en' ? 'English (EN)' : 'ไทย (TH)';

      const elements = document.querySelectorAll('[data-i18n]');
      elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
          el.innerText = translations[currentLanguage][key];
        }
      });

      const isDark = document.documentElement.classList.contains('dark');
      const drawerThemeText = document.getElementById('drawerThemeText');
      if (drawerThemeText) {
        drawerThemeText.innerText = isDark
          ? (currentLanguage === 'th' ? 'โหมดสว่าง' : 'Light')
          : (currentLanguage === 'th' ? 'โหมดมืด' : 'Dark');
      }

      if (currentScreen) {
        updateBreadcrumbUI(currentScreen);
        renderDrawerLinks();
        if (typeof renderCalendar === 'function') renderCalendar();
        if (currentScreen === 'dashboard' && typeof renderDashboardCourses === 'function') renderDashboardCourses();
        if (currentScreen === 'teacher-dashboard' && typeof renderTeacherDashboard === 'function') renderTeacherDashboard();
        if (currentScreen === 'teacher-review' && typeof renderTeacherReviewScreen === 'function') renderTeacherReviewScreen();
        if (currentScreen === 'projects' && typeof renderProjectsScreen === 'function') renderProjectsScreen();
        if (currentScreen === 'tasks-hub' && typeof renderGlobalTasksHub === 'function') renderGlobalTasksHub();
        if (currentScreen === 'course-detail' && typeof renderCourseDetailPage === 'function') renderCourseDetailPage();
        if (currentScreen === 'task-detail' && typeof renderTaskDetailPage === 'function') renderTaskDetailPage();
        if (currentScreen === 'admin' && typeof renderAdminScreen === 'function') renderAdminScreen();
      }
      const profileModalEl = document.getElementById('modalUserProfile');
      if (profileModalEl && !profileModalEl.classList.contains('hidden') && typeof openUserProfileModal === 'function') {
        openUserProfileModal();
      }
      translateDOM(currentLanguage);
    }

    function toggleLanguage() {
      const nextLang = currentLanguage === 'en' ? 'th' : 'en';
      applyLanguage(nextLang);
      alertMessage(nextLang === 'th' ? 'สลับภาษา: ไทย 🇹🇭' : 'Language: English 🇺🇸');
    }

    function updateThemeIcons(isDark) {
      const headerIcon = document.getElementById('headerThemeIcon');
      const loginIcon = document.getElementById('loginThemeIcon');
      const drawerIcon = document.getElementById('drawerThemeIcon');
      const drawerThemeText = document.getElementById('drawerThemeText');

      const icon = isDark ? '☀️' : '🌙';
      if (headerIcon) headerIcon.innerText = icon;
      if (loginIcon) loginIcon.innerText = icon;
      if (drawerIcon) drawerIcon.innerText = icon;

      if (drawerThemeText) {
        drawerThemeText.innerText = isDark
          ? (currentLanguage === 'th' ? 'โหมดสว่าง' : 'Light')
          : (currentLanguage === 'th' ? 'โหมดมืด' : 'Dark');
      }
    }

    const FESTIVAL_META = {
      default: { badge: '💙 Blue Vibe', pill: '💙 Blue & White Edition • Gen Z' },
      christmas: { badge: '🎄 Merry Xmas', pill: '🎄 Christmas Festival Theme' },
      halloween: { badge: '🎃 Spooky Mode', pill: '🎃 Halloween Festival Theme' },
      songkran: { badge: '💦 Songkran Splash', pill: '💦 Songkran Water Festival' },
      loykrathong: { badge: '🏮 Loy Krathong', pill: '🏮 Loy Krathong Moonlight' },
      valentine: { badge: '💖 Sweet Vibe', pill: '💖 Valentine\'s Festival Theme' },
      cny: { badge: '🧧 Happy CNY', pill: '🧧 Chinese New Year Theme' }
    };

    const FESTIVAL_EFFECTS = {
      christmas: { icons: ['❄️', '❅', '🎄', '✨'], mode: 'fall', count: 22 },
      halloween: { icons: ['🎃', '👻', '🦇', '✨'], mode: 'float', count: 16 },
      songkran: { icons: ['💧', '💦', '🫧', '✨'], mode: 'fall', count: 22 },
      loykrathong: { icons: ['🏮', '✨', '🪷', '🌕'], mode: 'rise', count: 18 },
      valentine: { icons: ['💖', '💕', '🌸', '✨'], mode: 'rise', count: 20 },
      cny: { icons: ['🧧', '🏮', '✨', '🪙'], mode: 'fall', count: 20 }
    };

    function renderFestivalEffects(themeKey) {
      const layer = document.getElementById('festivalEffectsLayer');
      if (!layer) return;
      layer.innerHTML = '';
      if (!themeKey || themeKey === 'default' || !FESTIVAL_EFFECTS[themeKey]) {
        layer.classList.add('hidden');
        return;
      }
      layer.classList.remove('hidden');
      const cfg = FESTIVAL_EFFECTS[themeKey];
      for (let i = 0; i < cfg.count; i++) {
        const el = document.createElement('span');
        el.className = 'fest-particle';
        el.innerText = cfg.icons[i % cfg.icons.length];
        const left = ((i * 37 + (i % 5) * 11) % 96) + 2;
        const size = 14 + (i % 4) * 5;
        const duration = 7 + (i % 6) * 2.2;
        const delay = -((i * 1.37) % duration);
        el.style.left = left + '%';
        el.style.fontSize = size + 'px';
        if (cfg.mode === 'fall') {
          el.style.top = '-8%';
          el.style.animation = `festFall ${duration}s linear ${delay}s infinite`;
        } else if (cfg.mode === 'rise') {
          el.style.top = '0';
          el.style.animation = `festRise ${duration}s linear ${delay}s infinite`;
        } else {
          const top = ((i * 29 + 11) % 82) + 8;
          el.style.top = top + '%';
          el.style.opacity = '0.55';
          el.style.animation = `festFloat ${4 + (i % 3) * 1.5}s ease-in-out ${delay}s infinite`;
        }
        layer.appendChild(el);
      }
    }

    function getGlobalFestivalTheme() {
      try {
        return localStorage.getItem('atht_global_festival_theme') || localStorage.getItem('atht_festival_theme') || 'default';
      } catch (e) {
        return 'default';
      }
    }

    function applyFestivalThemeToUI(themeKey) {
      const key = FESTIVAL_META[themeKey] ? themeKey : 'default';
      document.documentElement.setAttribute('data-festival', key);
      const hdrSel = document.getElementById('festivalThemeSelect');
      if (hdrSel && hdrSel.value !== key) hdrSel.value = key;
      const adminSel = document.getElementById('adminGlobalThemeSelect');
      if (adminSel && adminSel.value !== key) adminSel.value = key;
      const badge = document.getElementById('headerFestivalBadge');
      if (badge) badge.innerText = FESTIVAL_META[key].badge;
      renderFestivalEffects(key);
    }

    function setFestivalTheme(themeKey) {
      if (currentUserRole !== 'admin') {
        alertMessage('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเปลี่ยนธีมทั้งระบบได้');
        applyFestivalThemeToUI(getGlobalFestivalTheme());
        return;
      }
      const key = FESTIVAL_META[themeKey] ? themeKey : 'default';
      try {
        localStorage.setItem('atht_global_festival_theme', key);
        localStorage.setItem('atht_festival_theme', key);
      } catch (e) {}
      applyFestivalThemeToUI(key);
      alertMessage(`อัปเดตธีมระบบเป็น ${FESTIVAL_META[key].badge} สำหรับอาจารย์และนักศึกษาทุกคนแล้ว`);
    }

    window.addEventListener('storage', (e) => {
      if (e.key === 'atht_global_festival_theme' || e.key === 'atht_festival_theme') {
        applyFestivalThemeToUI(e.newValue || 'default');
      }
    });

    document.addEventListener('DOMContentLoaded', () => {
      applyFestivalThemeToUI(getGlobalFestivalTheme());
    });

    function spawnInteractiveClickEffect(x, y) {
      const ripple = document.createElement('span');
      ripple.className = 'gz-click-ripple';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 550);

      const activeTheme = document.documentElement.getAttribute('data-festival') || 'default';
      const cfg = FESTIVAL_EFFECTS[activeTheme];
      if (!cfg) return;

      const burstCount = 6;
      for (let i = 0; i < burstCount; i++) {
        const p = document.createElement('span');
        p.className = 'gz-click-burst';
        p.innerText = cfg.icons[i % cfg.icons.length];
        const angle = (Math.PI * 2 * i) / burstCount + (Math.random() * 0.4 - 0.2);
        const dist = 28 + Math.random() * 26;
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        p.style.setProperty('--tx', Math.round(Math.cos(angle) * dist) + 'px');
        p.style.setProperty('--ty', Math.round(Math.sin(angle) * dist - 10) + 'px');
        p.style.setProperty('--rot', Math.round(Math.random() * 140 - 70) + 'deg');
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 650);
      }
    }

    document.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      spawnInteractiveClickEffect(e.clientX, e.clientY);
    }, { passive: true });

    function toggleTheme() {
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      const willBeDark = !isCurrentlyDark;

      if (willBeDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('atht_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('atht_theme', 'light');
      }

      updateThemeIcons(willBeDark);
      alertMessage(willBeDark
        ? (currentLanguage === 'th' ? 'เปิดโหมดมืด (Dark Mode) 🌙' : 'Dark Mode enabled 🌙')
        : (currentLanguage === 'th' ? 'เปิดโหมดสว่าง (Light Mode) ☀️' : 'Light Mode enabled ☀️')
      );
    }

    function handleForgotPassword() {
      alertMessage(t('pwdResetSent', 'Password reset link sent to registered KMUTT mail.'));
    }

    function setLoginRole(role) {
      currentUserRole = role;
      const emailInput = document.getElementById('loginEmail');
      if (emailInput) {
        emailInput.value = role === 'teacher' ? 'suripong.ler@kmutt.ac.th' : 'chonchanok.s@kmutt.ac.th';
      }
    }

    function toggleUserRole() {
      if (currentUserRole === 'student') {
        currentUserRole = 'teacher';
        localStorage.setItem('atht_user_role', 'teacher');
        const teacher = getCurrentTeacher();
        navigateTo('teacher-dashboard');
        alertMessage(`Switched to Teacher View (${teacher.shortName})`);
      } else {
        currentUserRole = 'student';
        localStorage.setItem('atht_user_role', 'student');
        const curStd = getCurrentStudent();
        navigateTo('dashboard');
        alertMessage(`Switched to Student View (${curStd.shortName})`);
      }
    }

    function handleDuePillClick() {
      if (currentUserRole === 'admin') {
        navigateTo('admin');
      } else if (currentUserRole === 'teacher') {
        navigateTo('teacher-dashboard');
      } else {
        navigateTo('tasks-hub');
      }
    }

    function handleLogoClick() {
      if (currentUserRole === 'admin') {
        navigateTo('admin');
      } else if (currentUserRole === 'teacher') {
        navigateTo('teacher-dashboard');
      } else {
        navigateTo('dashboard');
      }
    }

    function populateLoginDemoDropdowns() {
      const stuSel = document.getElementById('loginDemoStudentSelect');
      if (stuSel && typeof studentDirectory === 'object') {
        const curVal = stuSel.value || '67080200501';
        stuSel.innerHTML = Object.values(studentDirectory)
          .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
          .map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.id)} - ${escapeHtml(s.fullName)}</option>`)
          .join('');
        if (studentDirectory[curVal]) stuSel.value = curVal;
      }
      const tchSel = document.getElementById('loginDemoTeacherSelect');
      if (tchSel && typeof teacherDirectory === 'object') {
        const curVal = tchSel.value || 'suripong.ler';
        tchSel.innerHTML = Object.values(teacherDirectory)
          .map(t => {
            const cText = Array.isArray(t.courses) && t.courses.length ? ` (${t.courses.join(', ')})` : '';
            return `<option value="${escapeHtml(t.id)}">${escapeHtml(t.fullName)}${escapeHtml(cText)}</option>`;
          })
          .join('');
        if (teacherDirectory[curVal]) tchSel.value = curVal;
      }
    }

    function onLoginDemoSelectChange(role, val) {
      const emailInput = document.getElementById('loginEmail');
      const passInput = document.getElementById('loginPassword');
      if (role === 'teacher') {
        const t = teacherDirectory[val];
        if (emailInput) emailInput.value = t ? t.email : `${val}@kmutt.ac.th`;
        if (passInput) passInput.value = 'teacher1234';
        const prev = document.getElementById('loginDemoTeacherPreview');
        if (prev) prev.innerText = val;
      } else {
        if (emailInput) emailInput.value = val;
        if (passInput) passInput.value = 'student1234';
        const prev = document.getElementById('loginDemoStudentPreview');
        if (prev) prev.innerText = val;
      }
    }

    function quickLoginAs(role) {
      const emailInput = document.getElementById('loginEmail');
      const passInput = document.getElementById('loginPassword');
      if (role === 'admin') {
        if (emailInput) emailInput.value = 'admin@kmutt.ac.th';
        if (passInput) passInput.value = 'admin1234';
      } else if (role === 'teacher') {
        const tchVal = document.getElementById('loginDemoTeacherSelect')?.value || 'suripong.ler';
        const t = teacherDirectory[tchVal];
        if (emailInput) emailInput.value = t ? t.email : `${tchVal}@kmutt.ac.th`;
        if (passInput) passInput.value = 'teacher1234';
      } else {
        const stuVal = document.getElementById('loginDemoStudentSelect')?.value || '67080200501';
        if (emailInput) emailInput.value = stuVal;
        if (passInput) passInput.value = 'student1234';
      }
      handleLoginSubmit({ preventDefault: () => {} });
    }

    function handleLoginSubmit(e) {
      if (e && e.preventDefault) e.preventDefault();

      const rawInput = (document.getElementById('loginEmail')?.value || '').trim();
      const rawPass = (document.getElementById('loginPassword')?.value || '').trim();
      const inputVal = rawInput.toLowerCase();
      const isThai = currentLanguage === 'th';

      if (!rawInput) {
        alertMessage(isThai ? 'กรุณากรอกอีเมลหรือรหัสนักศึกษา' : 'Please enter your email or student ID.');
        return;
      }
      if (!rawPass) {
        alertMessage(isThai ? 'กรุณากรอกรหัสผ่าน' : 'Please enter your password.');
        return;
      }

      const isAdminInput = inputVal === 'admin' ||
                           inputVal.startsWith('admin@') ||
                           inputVal.includes('sysadmin') ||
                           inputVal.includes('administrator');

      const isTeacherInput = !isAdminInput && (
                             inputVal.includes('teacher') ||
                             inputVal.includes('prof') ||
                             inputVal.includes('ajarn') ||
                             inputVal.includes('suripong') ||
                             inputVal.includes('nuttapong') ||
                             inputVal.includes('akek') ||
                             inputVal.includes('sl@') ||
                             Boolean(teacherDirectory[inputVal]) ||
                             Object.values(teacherDirectory).some(t => t.email.toLowerCase() === inputVal || t.facultyCode.toLowerCase() === inputVal) ||
                             (inputVal.includes('@kmutt.ac.th') && !inputVal.includes('mail.kmutt.ac.th') && !inputVal.match(/\d{9,11}/))
      );

      if (isAdminInput) {
        if (rawPass !== 'admin1234') {
          alertMessage(isThai ? 'รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง (รหัสทดลอง: admin1234)' : 'Invalid administrator password (Demo: admin1234).');
          return;
        }
        currentUserRole = 'admin';
        localStorage.setItem('atht_user_role', 'admin');
      } else if (isTeacherInput) {
        const teacherProfile = getTeacherProfile(rawInput);
        const tchRec = teacherDirectory[teacherProfile.id];
        if (!tchRec) {
          alertMessage(isThai ? 'ไม่พบบัญชีอาจารย์นี้ในระบบ (อาจถูกลบโดยผู้ดูแลระบบ)' : 'Instructor account not found or removed by Administrator.');
          return;
        }
        const expectedTchPass = tchRec.password || 'teacher1234';
        if (rawPass !== expectedTchPass && rawPass !== 'teacher1234') {
          alertMessage(isThai ? 'รหัสผ่านอาจารย์ไม่ถูกต้อง (รหัสทดลอง: teacher1234)' : 'Invalid instructor password (Demo: teacher1234).');
          return;
        }
        if ((tchRec.status || 'Active') === 'Inactive') {
          alertMessage(isThai ? 'บัญชีนี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อ Admin' : 'This account has been suspended by Administrator.');
          return;
        }
        currentUserRole = 'teacher';
        localStorage.setItem('atht_teacher_id', teacherProfile.id);
        localStorage.setItem('atht_user_role', 'teacher');
      } else {
        const studentProfile = getStudentProfile(rawInput);
        const stuRec = studentDirectory[studentProfile.id];
        if (!stuRec) {
          alertMessage(isThai ? 'ไม่พบบัญชีนักศึกษานี้ในระบบ (อาจถูกลบโดยผู้ดูแลระบบ)' : 'Student account not found or removed by Administrator.');
          return;
        }
        const expectedStuPass = stuRec.password || 'student1234';
        if (rawPass !== expectedStuPass && rawPass !== 'student1234') {
          alertMessage(isThai ? 'รหัสผ่านนักศึกษาไม่ถูกต้อง (รหัสทดลอง: student1234)' : 'Invalid student password (Demo: student1234).');
          return;
        }
        if ((stuRec.status || 'Active') === 'Inactive') {
          alertMessage(isThai ? 'บัญชีนักศึกษานี้ถูกระงับการใช้งาน กรุณาติดต่อ Admin' : 'This student account has been suspended by Administrator.');
          return;
        }
        currentUserRole = 'student';
        localStorage.setItem('atht_student_id', studentProfile.id);
        localStorage.setItem('atht_user_role', 'student');
      }

      localStorage.setItem('atht_is_logged_in', 'true');

      const rememberCheckbox = document.getElementById('rememberMeCheckbox');
      if (rememberCheckbox && rememberCheckbox.checked) {
        localStorage.setItem('atht_remember_me', 'true');
      } else {
        localStorage.removeItem('atht_remember_me');
      }

      if (currentUserRole === 'admin') {
        navigateTo('admin');
        alertMessage(isThai ? 'ยินดีต้อนรับเข้าสู่ระบบจัดการผู้ใช้ (System Administrator)' : 'Welcome, System Administrator! (User Management Portal)');
      } else if (currentUserRole === 'teacher') {
        const teacher = getCurrentTeacher();
        navigateTo('teacher-dashboard');
        alertMessage(isThai ? `ยินดีต้อนรับ ${teacher.fullName}! (${teacher.email})` : `Welcome back, ${teacher.fullName}! (${teacher.email})`);
      } else {
        navigateTo('dashboard');
        const student = getCurrentStudent();
        alertMessage(isThai ? `ยินดีต้อนรับ ${student.fullName}! (รหัส: ${student.id})` : `Welcome back, ${student.fullName}! (ID: ${student.id})`);
      }
    }

    function buildRouteHash(screenId) {
      if (screenId === 'login') return '#/login';
      const role = currentUserRole || 'student';
      const cCode = encodeURIComponent(activeCourseId || 'CMM321');
      if (role === 'admin' || screenId === 'admin') return '#/admin/users';
      if (role === 'teacher') {
        if (screenId === 'teacher-dashboard' || screenId === 'courses') return '#/teacher/courses';
        if (screenId === 'teacher-review') {
          if (teacherReviewViewMode === 'projectTasks') return `#/teacher/courses/${cCode}/project/tasks`;
          if (teacherReviewViewMode === 'students') return `#/teacher/courses/${cCode}/project/tasks/members`;
          if (teacherReviewViewMode === 'grading') return `#/teacher/courses/${cCode}/project/tasks/members/grading`;
          return `#/teacher/courses/${cCode}/project`;
        }
        if (screenId === 'notifications') return '#/teacher/notifications';
        return `#/teacher/${screenId}`;
      }
      if (screenId === 'dashboard' || screenId === 'courses') return '#/student/courses';
      if (screenId === 'course-detail') return `#/student/courses/${cCode}/project`;
      if (screenId === 'tasks-hub') {
        return activeTasksCourseFilter
          ? `#/student/courses/${encodeURIComponent(activeTasksCourseFilter)}/tasks`
          : '#/student/all-tasks';
      }
      if (screenId === 'task-detail') {
        return `#/student/courses/${cCode}/project/tasks/${encodeURIComponent(activeTaskId || '')}`;
      }
      if (screenId === 'notifications') return '#/student/notifications';
      return `#/student/${screenId}`;
    }

    function parseRouteHash(rawHash) {
      const clean = (rawHash || '').replace(/^#\/?/, '').trim();
      if (!clean) return null;
      const parts = clean.split('/').map(p => decodeURIComponent(p));
      if (parts[0] === 'login') return { screenId: 'login' };
      if (parts[0] === 'admin') return { screenId: 'admin' };
      if (parts[0] === 'teacher') {
        if (parts[1] === 'notifications') return { screenId: 'notifications' };
        if (parts[1] === 'courses' && parts[2]) {
          let mode = 'assessment';
          if (parts[3] === 'project' && parts[4] === 'tasks') {
            if (parts[5] === 'members') {
              mode = parts[6] === 'grading' ? 'grading' : 'students';
            } else {
              mode = 'projectTasks';
            }
          } else if (parts[3] === 'members') {
            mode = parts[4] === 'tasks' ? 'grading' : 'students';
          }
          return { screenId: 'teacher-review', activeCourseId: parts[2], teacherReviewViewMode: mode };
        }
        return { screenId: 'teacher-dashboard' };
      }
      if (parts[0] === 'student') {
        if (parts[1] === 'notifications') return { screenId: 'notifications' };
        if (parts[1] === 'all-tasks') return { screenId: 'tasks-hub', activeTasksCourseFilter: null, activeTasksProjectFilter: null };
        if (parts[1] === 'courses' && parts[2]) {
          if (parts[3] === 'tasks') return { screenId: 'tasks-hub', activeTasksCourseFilter: parts[2], activeCourseId: parts[2] };
          if (parts[3] === 'project' && parts[4] === 'tasks') {
            return { screenId: 'task-detail', activeCourseId: parts[2], activeTaskId: parts[5] || activeTaskId };
          }
          if (parts[3] === 'project') return { screenId: 'course-detail', activeCourseId: parts[2] };
        }
        return { screenId: 'dashboard' };
      }
      return null;
    }

    let isRestoringFromHistory = false;

    function syncBrowserHistory(screenId, pushHistory) {
      if (isRestoringFromHistory) return;
      const nextHash = buildRouteHash(screenId);
      const stateObj = {
        screenId,
        activeCourseId,
        activeProjectId,
        activeTaskId,
        activeTasksCourseFilter,
        teacherReviewViewMode
      };
      try {
        if (pushHistory) {
          if (window.location.hash !== nextHash) {
            window.history.pushState(stateObj, '', nextHash);
          }
        } else {
          window.history.replaceState(stateObj, '', nextHash);
        }
      } catch (e) {
        if (window.location.hash !== nextHash) {
          window.location.hash = nextHash;
        }
      }
    }

    window.addEventListener('popstate', (event) => {
      const st = event.state;
      if (st && st.screenId) {
        isRestoringFromHistory = true;
        if (st.activeCourseId !== undefined) activeCourseId = st.activeCourseId;
        if (st.activeProjectId !== undefined) activeProjectId = st.activeProjectId;
        if (st.activeTaskId !== undefined) activeTaskId = st.activeTaskId;
        if (st.activeTasksCourseFilter !== undefined) activeTasksCourseFilter = st.activeTasksCourseFilter;
        if (st.teacherReviewViewMode !== undefined) teacherReviewViewMode = st.teacherReviewViewMode;
        navigateTo(st.screenId, false);
        isRestoringFromHistory = false;
        return;
      }
      const parsed = parseRouteHash(window.location.hash);
      if (parsed && parsed.screenId) {
        isRestoringFromHistory = true;
        if (parsed.activeCourseId !== undefined) activeCourseId = parsed.activeCourseId;
        if (parsed.activeTaskId !== undefined) activeTaskId = parsed.activeTaskId;
        if (parsed.activeTasksCourseFilter !== undefined) activeTasksCourseFilter = parsed.activeTasksCourseFilter;
        if (parsed.teacherReviewViewMode !== undefined) teacherReviewViewMode = parsed.teacherReviewViewMode;
        navigateTo(parsed.screenId, false);
        isRestoringFromHistory = false;
      }
    });

    function navigateTo(screenId, pushHistory = true) {
      if (screenId === 'admin' && currentUserRole !== 'admin') {
        screenId = currentUserRole === 'teacher' ? 'teacher-dashboard' : 'dashboard';
      } else if ((screenId === 'teacher-dashboard' || screenId === 'teacher-review') && currentUserRole === 'student') {
        screenId = 'dashboard';
      }
      if (pushHistory && currentScreen && currentScreen !== screenId) {
        navigationHistory.push(currentScreen);
      }
      currentScreen = screenId;
      syncBrowserHistory(screenId, pushHistory);

      if (screenId !== 'login') {
        localStorage.setItem('atht_current_screen', screenId);
        if (activeCourseId) localStorage.setItem('atht_active_course', activeCourseId);
        if (activeTaskId) localStorage.setItem('atht_active_task', activeTaskId);
      }

      const screens = [
        'login', 'dashboard', 'courses', 'course-detail', 'task-detail',
        'projects', 'tasks-hub', 'notifications', 'teacher-dashboard', 'teacher-review', 'admin'
      ];
      screens.forEach(s => {
        const el = document.getElementById(`screen-${s}`);
        if (el) el.classList.add('hidden');
      });

      const target = document.getElementById(`screen-${screenId}`);
      if (target) target.classList.remove('hidden');

      updateBreadcrumbUI(screenId);

      if (screenId === 'dashboard') {
        renderDashboardCourses();
      } else if (screenId === 'courses') {
        renderCoursesCatalog();
      } else if (screenId === 'course-detail') {
        renderCourseDetailPage();
      } else if (screenId === 'task-detail') {
        renderTaskDetailPage();
      } else if (screenId === 'projects') {
        renderProjectsScreen();
      } else if (screenId === 'tasks-hub') {
        renderGlobalTasksHub();
      } else if (screenId === 'notifications') {
        renderNotificationsScreen();
      } else if (screenId === 'teacher-dashboard') {
        renderTeacherDashboard();
      } else if (screenId === 'teacher-review') {
        renderTeacherReviewScreen();
      } else if (screenId === 'admin') {
        renderAdminScreen();
      }

      const main = document.querySelector('main');
      if (main) main.scrollTop = 0;
      translateDOM(currentLanguage);
    }

    function navigateBack() {
      if (navigationHistory.length > 0) {
        const prev = navigationHistory.pop();
        navigateTo(prev, false);
      } else {
        handleLogoClick();
      }
    }

    function updateBreadcrumbUI(screenId) {
      const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
      const breadcrumbRolePrefix = document.getElementById('breadcrumbRolePrefix');
      const navBackBtn = document.getElementById('navBackBtn');
      const breadcrumbBar = document.getElementById('breadcrumbBar');
      const navPillsBar = document.getElementById('navPillsBar');
      const mainHeader = document.getElementById('mainHeader');
      const headerRoleBadge = document.getElementById('headerRoleBadge');
      const pendingCountBadge = document.getElementById('pendingCountBadge');

      if (screenId === 'login') {
        if (breadcrumbBar) breadcrumbBar.classList.add('hidden');
        if (navPillsBar) navPillsBar.classList.add('hidden');
        if (mainHeader) mainHeader.classList.add('hidden');
        const wfRow = document.getElementById('studentWireframeBreadcrumbRow');
        if (wfRow) { wfRow.classList.add('hidden'); wfRow.classList.remove('flex'); }
        const calBtn = document.getElementById('floatingMobileCalendarBtn');
        if (calBtn) calBtn.className = 'hidden';
        return;
      }

      if (breadcrumbBar) breadcrumbBar.classList.remove('hidden');
      if (navPillsBar) navPillsBar.classList.remove('hidden');
      if (mainHeader) mainHeader.classList.remove('hidden');

      const isTeacher = currentUserRole === 'teacher';
      const isAdmin = currentUserRole === 'admin';
      const isStudent = !isTeacher && !isAdmin;

      if (headerRoleBadge) {
        headerRoleBadge.innerText = isAdmin
          ? (currentLanguage === 'th' ? 'ผู้ดูแลระบบ' : 'Admin')
          : (isTeacher ? (currentLanguage === 'th' ? 'อาจารย์' : 'Teacher') : (currentLanguage === 'th' ? 'นักศึกษา' : 'Student'));
      }
      const hdrThemeWrap = document.getElementById('headerFestivalThemeWrapper');
      if (hdrThemeWrap) {
        hdrThemeWrap.className = isAdmin
          ? 'hidden md:flex relative items-center'
          : 'hidden relative items-center';
      }
      applyFestivalThemeToUI(getGlobalFestivalTheme());
      if (breadcrumbRolePrefix) {
        breadcrumbRolePrefix.innerText = isAdmin
          ? (currentLanguage === 'th' ? 'ผู้ดูแลระบบ' : 'Admin')
          : (isTeacher ? (currentLanguage === 'th' ? 'อาจารย์' : 'Teacher') : t('studentPrefix', 'Student'));
      }

      const studentHeaderNavLinks = document.getElementById('studentHeaderNavLinks');
      const studentWireframeBreadcrumbRow = document.getElementById('studentWireframeBreadcrumbRow');
      const headerNotifLabel = document.getElementById('headerNotifLabel');
      const desktopUserProfileEl = document.getElementById('desktopUserProfile');

      const hdrTabCourses = document.getElementById('hdrTabCourses');
      const hdrTabAllTasks = document.getElementById('hdrTabAllTasks');

      const floatingCalBtn = document.getElementById('floatingMobileCalendarBtn');
      if (floatingCalBtn) {
        const showCal = (isStudent || isTeacher) && screenId !== 'login';
        floatingCalBtn.className = showCal
          ? 'lg:hidden fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-neutral-800 hover:bg-black text-white shadow-xl border border-neutral-500/40 flex items-center justify-center text-xl transition pressable touch-manipulation cursor-pointer'
          : 'hidden';
      }

      if ((isStudent || isTeacher) && screenId !== 'login') {
        if (breadcrumbBar) breadcrumbBar.classList.add('hidden');
        if (navPillsBar) navPillsBar.classList.add('hidden');
        if (studentHeaderNavLinks) studentHeaderNavLinks.className = 'hidden md:flex items-center gap-1';
        if (studentWireframeBreadcrumbRow) { studentWireframeBreadcrumbRow.classList.remove('hidden'); studentWireframeBreadcrumbRow.classList.add('flex'); }
        if (headerNotifLabel) headerNotifLabel.className = 'hidden md:inline text-xs font-bold text-neutral-800';
        if (desktopUserProfileEl) {
          desktopUserProfileEl.className = 'hidden md:flex items-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 px-3.5 py-1.5 rounded-full shadow-xs text-left cursor-pointer transition pressable';
        }

        if (isTeacher) {
          if (hdrTabAllTasks) hdrTabAllTasks.classList.add('hidden');
          if (hdrTabCourses) {
            hdrTabCourses.onclick = () => navigateTo('teacher-dashboard');
            hdrTabCourses.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-black/25 hover:bg-black/35 transition pressable';
          }
        } else {
          if (hdrTabAllTasks) hdrTabAllTasks.classList.remove('hidden');
          const isAllTasksActive = screenId === 'tasks-hub' && !activeTasksCourseFilter && !activeTasksProjectFilter;
          if (hdrTabCourses) {
            hdrTabCourses.onclick = () => navigateTo('dashboard');
            hdrTabCourses.className = !isAllTasksActive
              ? 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-black/25 hover:bg-black/35 transition pressable'
              : 'px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-neutral-300 hover:text-white hover:bg-black/15 transition pressable';
          }
          if (hdrTabAllTasks) {
            hdrTabAllTasks.className = isAllTasksActive
              ? 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-black/25 hover:bg-black/35 transition pressable'
              : 'px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-neutral-300 hover:text-white hover:bg-black/15 transition pressable';
          }
        }
      } else {
        if (studentHeaderNavLinks) studentHeaderNavLinks.className = 'hidden';
        if (studentWireframeBreadcrumbRow) { studentWireframeBreadcrumbRow.classList.add('hidden'); studentWireframeBreadcrumbRow.classList.remove('flex'); }
        if (headerNotifLabel) headerNotifLabel.className = 'hidden';
        if (desktopUserProfileEl) {
          desktopUserProfileEl.className = 'hidden md:flex items-center gap-2.5 bg-white/10 hover:bg-white/20 active:bg-white/25 px-3.5 py-1.5 rounded-xl border border-white/10 text-left cursor-pointer transition pressable';
        }
      }

      const desktopUserAvatar = document.getElementById('desktopUserAvatar');
      const desktopUserName = document.getElementById('desktopUserName');
      const desktopUserSub = document.getElementById('desktopUserSub');
      if (desktopUserAvatar && desktopUserName && desktopUserSub) {
        if (isAdmin) {
          desktopUserAvatar.innerText = 'AD';
          desktopUserName.innerText = 'System Admin';
          desktopUserName.className = 'text-xs font-extrabold text-neutral-900 dark:text-white block leading-tight';
          desktopUserName.title = 'System Administrator (admin@kmutt.ac.th)';
          desktopUserSub.innerText = 'Super Admin • KMUTT';
          desktopUserSub.className = 'text-[9px] text-neutral-500 dark:text-neutral-400 block leading-tight';
        } else if (isTeacher) {
          const teacher = getCurrentTeacher();
          desktopUserAvatar.innerText = teacher.initials;
          desktopUserName.innerText = teacher.shortName;
          desktopUserName.className = 'text-xs font-extrabold text-neutral-900 block leading-tight';
          desktopUserName.title = `${teacher.fullName} (${teacher.email})`;
          desktopUserSub.innerText = teacher.facultyCode || teacher.id;
          desktopUserSub.className = 'text-[9px] text-neutral-500 font-mono block leading-tight';
        } else {
          const student = getCurrentStudent();
          desktopUserAvatar.innerText = student.initials;
          desktopUserName.innerText = student.shortName;
          desktopUserName.className = 'text-xs font-extrabold text-neutral-900 block leading-tight';
          desktopUserName.title = `${student.fullName} (${student.email})`;
          desktopUserSub.innerText = student.id;
          desktopUserSub.className = 'text-[9px] text-neutral-500 font-mono block leading-tight';
        }

        const drawerUserAvatar = document.getElementById('drawerUserAvatar');
        const drawerUserName = document.getElementById('drawerUserName');
        const drawerUserEmail = document.getElementById('drawerUserEmail');
        if (drawerUserAvatar && drawerUserName && drawerUserEmail) {
          if (isAdmin) {
            drawerUserAvatar.innerText = 'AD';
            drawerUserName.innerText = 'System Admin';
            drawerUserEmail.innerText = 'admin@kmutt.ac.th';
          } else if (isTeacher) {
            const teacher = getCurrentTeacher();
            drawerUserAvatar.innerText = teacher.initials;
            drawerUserName.innerText = teacher.shortName;
            drawerUserEmail.innerText = teacher.email;
          } else {
            const student = getCurrentStudent();
            drawerUserAvatar.innerText = student.initials;
            drawerUserName.innerText = student.shortName;
            drawerUserEmail.innerText = `${student.id} • ${student.email}`;
          }
        }
      }

      let liveDueCount = 0;
      if (isStudent && typeof getStudentTasksInCourse === 'function' && typeof getCurrentStudent === 'function') {
        const curStd = getCurrentStudent();
        Object.keys(coursesCatalog || {}).forEach(cCode => {
          const tList = getStudentTasksInCourse(curStd.id, cCode);
          tList.forEach(tObj => {
            const revs = typeof ensureStudentSubmissionRevisions === 'function' ? ensureStudentSubmissionRevisions(tObj, curStd.id, cCode) : [];
            const lastRev = revs.length > 0 ? revs[revs.length - 1] : null;
            if (!lastRev || lastRev.status === 'revision') liveDueCount++;
          });
        });
      } else if (isTeacher && typeof getTeacherAssignedCourseCodes === 'function' && typeof getStudentCourseTaskInfo === 'function') {
        const tCodes = getTeacherAssignedCourseCodes();
        const firstCode = tCodes[0] || 'CMM321';
        Object.keys(studentDirectory || {}).forEach(sid => {
          const info = getStudentCourseTaskInfo(sid, firstCode, null, null);
          if (info.submissionStatus === 'revision' || info.submissionStatus === 'pending') liveDueCount++;
        });
      }

      if (pendingCountBadge) {
        const totalUsersCount = Object.keys(studentDirectory).length + Object.keys(teacherDirectory).length;
        if (isAdmin) {
          pendingCountBadge.innerText = currentLanguage === 'th' ? `ผู้ใช้ ${totalUsersCount} คน` : `${totalUsersCount} Users`;
        } else if (isTeacher) {
          pendingCountBadge.innerText = currentLanguage === 'th' ? `รอตรวจ ${liveDueCount}` : `${liveDueCount} To Review`;
        } else {
          pendingCountBadge.innerText = currentLanguage === 'th' ? `ค้างส่ง ${liveDueCount}` : `${liveDueCount} Due`;
        }
      }
      const dashAllTasksBtn = document.getElementById('dashboardAllTasksBtn');
      if (dashAllTasksBtn && isStudent) {
        dashAllTasksBtn.innerText = currentLanguage === 'th'
          ? `งานทั้งหมด (ค้าง ${liveDueCount}) →`
          : `All Tasks (${liveDueCount} Due) →`;
      }

      renderDynamicPills(screenId);

      if (navBackBtn) {
        const homeScreens = ['dashboard', 'teacher-dashboard', 'admin'];
        if (navigationHistory.length > 0 && !homeScreens.includes(screenId)) {
          navBackBtn.classList.remove('hidden');
        } else {
          navBackBtn.classList.add('hidden');
        }
      }

      if (!breadcrumbCurrent) return;

      const isTh = currentLanguage === 'th';
      const sep = `<span class="text-neutral-400 dark:text-neutral-500 font-normal">/</span>`;
      const homeLink = `<button onclick="handleLogoClick()" class="hover:underline text-neutral-600 dark:text-neutral-400 transition">${isTh ? 'หน้าหลัก' : 'Home'}</button>`;
      const coursesLink = `<button onclick="navigateTo('courses')" class="hover:underline text-neutral-600 dark:text-neutral-400 transition">${isTh ? 'รายวิชา' : 'Courses'}</button>`;
      const projectsLink = `<button onclick="navigateTo('projects')" class="hover:underline text-neutral-600 dark:text-neutral-400 transition">${isTh ? 'โปรเจกต์' : 'Projects'}</button>`;
      const tasksHubLink = `<button onclick="openAllTasksHub()" class="hover:underline text-neutral-600 dark:text-neutral-400 transition">${isTh ? 'งานทั้งหมด' : 'All Tasks'}</button>`;

      if (screenId === 'dashboard') {
        breadcrumbCurrent.innerHTML = `<span class="font-bold text-neutral-900 dark:text-white">${t('home', 'Home')}</span>`;
      } else if (screenId === 'teacher-dashboard') {
        breadcrumbCurrent.innerHTML = `<span class="font-bold text-neutral-900 dark:text-white">${t('home', 'Home')}</span>`;
      } else if (screenId === 'teacher-review') {
        const proj = studentProjectsList.find(p => p.id === activeProjectId) || (activeCourseId && studentProjectsList.find(p => p.course === activeCourseId));
        const projTitle = proj ? (proj.title.length > 22 ? proj.title.slice(0, 22) + '...' : proj.title) : null;
        const targetCode = activeTasksCourseFilter || activeCourseId || 'CMM321';
      const course = coursesCatalog[targetCode] || coursesCatalog['CMM321'];
        const courseCode = course ? course.code : 'Course';
        const courseLink = `<button onclick="selectCourse('${courseCode}')" class="hover:underline text-neutral-600 dark:text-neutral-400 transition">${escapeHtml(courseCode)}</button>`;
        const projLink = proj ? `<button onclick="openProjectTasks('${proj.id}')" class="hover:underline text-neutral-600 dark:text-neutral-400 transition">${escapeHtml(projTitle)}</button>` : '';
        const tasksWord = isTh ? 'รายการงาน' : 'Tasks';

        if (teacherReviewViewMode === 'assessment') {
          breadcrumbCurrent.innerHTML = proj
            ? `${homeLink} ${sep} ${courseLink} ${sep} ${projLink} ${sep} <span class="font-bold text-neutral-900 dark:text-white">${tasksWord}</span>`
            : `${homeLink} ${sep} ${courseLink} ${sep} <span class="font-bold text-neutral-900 dark:text-white">${tasksWord}</span>`;
        } else if (teacherReviewViewMode === 'editTask') {
          breadcrumbCurrent.innerHTML = `${homeLink} ${sep} ${courseLink} ${sep} <button onclick="switchTeacherViewMode('assessment')" class="hover:underline text-neutral-600 dark:text-neutral-400 transition">${tasksWord}</button> ${sep} <span class="font-bold text-neutral-900 dark:text-white">${isTh ? 'แก้ไขงาน' : 'Edit Task'}</span>`;
        } else if (teacherReviewViewMode === 'students') {
          const memWord = isTh ? 'สมาชิก' : 'Members';
          breadcrumbCurrent.innerHTML = proj
            ? `${homeLink} ${sep} ${courseLink} ${sep} ${projLink} ${sep} <span class="font-bold text-neutral-900 dark:text-white">${memWord}</span>`
            : `${homeLink} ${sep} ${courseLink} ${sep} <span class="font-bold text-neutral-900 dark:text-white">${memWord}</span>`;
        } else if (teacherReviewViewMode === 'grading') {
          const revWord = isTh ? 'ตรวจและให้คะแนน' : 'Review & Grade';
          breadcrumbCurrent.innerHTML = proj
            ? `${homeLink} ${sep} ${courseLink} ${sep} ${projLink} ${sep} <button onclick="switchTeacherViewMode('assessment')" class="hover:underline text-neutral-600 dark:text-neutral-400 transition">${tasksWord}</button> ${sep} <span class="font-bold text-neutral-900 dark:text-white">${revWord}</span>`
            : `${homeLink} ${sep} ${courseLink} ${sep} <span class="font-bold text-neutral-900 dark:text-white">${revWord}</span>`;
        } else {
          breadcrumbCurrent.innerHTML = `${homeLink} ${sep} <span class="font-bold text-neutral-900 dark:text-white">${courseCode}</span>`;
        }
      } else if (screenId === 'courses') {
        breadcrumbCurrent.innerHTML = `${homeLink} ${sep} <span class="font-bold text-neutral-900 dark:text-white">${isTh ? 'รายวิชา' : 'Courses'}</span>`;
      } else if (screenId === 'course-detail') {
        const c = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
        const proj = studentProjectsList.find(p => p.id === activeProjectId) || studentProjectsList.find(p => p.course === activeCourseId);
        const projTitle = proj ? (proj.title.length > 20 ? proj.title.slice(0, 20) + '...' : proj.title) : null;
        const cCode = c ? c.code : 'Course';

        breadcrumbCurrent.innerHTML = proj
          ? `${homeLink} ${sep} ${coursesLink} ${sep} <span class="text-neutral-600 dark:text-neutral-400">${cCode}</span> ${sep} <span class="font-bold text-neutral-900 dark:text-white">${escapeHtml(projTitle)}</span>`
          : `${homeLink} ${sep} ${coursesLink} ${sep} <span class="font-bold text-neutral-900 dark:text-white">${cCode}</span>`;
      } else if (screenId === 'projects') {
        const isFiltered = activeProjectsFilter && activeProjectsFilter !== 'ALL';
        const projLabel = isTh ? 'โปรเจกต์' : 'Projects';
        breadcrumbCurrent.innerHTML = isFiltered
          ? `${homeLink} ${sep} <button onclick="setProjectsFilter('ALL')" class="hover:underline text-neutral-600 dark:text-neutral-400 transition">${projLabel}</button> ${sep} <span class="font-bold text-neutral-900 dark:text-white">${activeProjectsFilter}</span>`
          : `${homeLink} ${sep} <span class="font-bold text-neutral-900 dark:text-white">${projLabel}</span>`;
      } else if (screenId === 'tasks-hub') {
        const isProjTaskMode = !!(activeTasksCourseFilter || activeTasksProjectFilter);
        if (isProjTaskMode) {
          const c = coursesCatalog[activeTasksCourseFilter || activeCourseId] || coursesCatalog['CMM321'];
          const cCode = c ? c.code : (activeTasksCourseFilter || 'CMM321');
          const proj = studentProjectsList.find(p => p.id === (activeTasksProjectFilter || activeProjectId)) || studentProjectsList.find(p => p.course === cCode);
          const projTitle = proj ? (proj.title.length > 20 ? proj.title.slice(0, 20) + '...' : proj.title) : null;
          const courseBtn = `<button onclick="selectCourse('${cCode}')" class="hover:underline text-neutral-600 dark:text-neutral-400 transition">${escapeHtml(cCode)}</button>`;
          const taskWord = isTh ? 'ชื่องาน' : 'Task';
          breadcrumbCurrent.innerHTML = projTitle
            ? `${homeLink} ${sep} ${coursesLink} ${sep} ${courseBtn} ${sep} <span class="text-neutral-600 dark:text-neutral-400">${escapeHtml(projTitle)}</span> ${sep} <span class="font-bold text-neutral-900 dark:text-white">${taskWord}</span>`
            : `${homeLink} ${sep} ${coursesLink} ${sep} ${courseBtn} ${sep} <span class="font-bold text-neutral-900 dark:text-white">${taskWord}</span>`;
        } else {
          breadcrumbCurrent.innerHTML = `${homeLink} ${sep} <span class="font-bold text-neutral-900 dark:text-white">${isTh ? 'งานทั้งหมด' : 'All Tasks'}</span>`;
        }
      } else if (screenId === 'task-detail') {
        const c = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
        const cCode = c ? c.code : 'Course';
        const taskTitle = document.getElementById('taskDetailTitle')?.innerText || 'Task Details';
        const shortTaskTitle = taskTitle.length > 20 ? taskTitle.slice(0, 20) + '...' : taskTitle;

        breadcrumbCurrent.innerHTML = `${homeLink} ${sep} ${tasksHubLink} ${sep} <button onclick="selectCourse('${cCode}')" class="hover:underline text-neutral-600 dark:text-neutral-400 transition">${cCode}</button> ${sep} <span class="font-bold text-neutral-900 dark:text-white">${escapeHtml(shortTaskTitle)}</span>`;
      } else if (screenId === 'notifications') {
        breadcrumbCurrent.innerHTML = `${homeLink} ${sep} <span class="font-bold text-neutral-900 dark:text-white">${isTh ? 'การแจ้งเตือน' : 'Notifications'}</span>`;
      } else if (screenId === 'admin') {
        const subLabel = activeAdminTab === 'teachers'
          ? (isTh ? 'อาจารย์ผู้สอน' : 'Teachers')
          : (activeAdminTab === 'all' ? (isTh ? 'ผู้ใช้ทั้งหมด' : 'All Users') : (isTh ? 'นักศึกษา' : 'Students'));
        breadcrumbCurrent.innerHTML = `<span class="text-neutral-600 dark:text-neutral-400">${isTh ? 'จัดการผู้ใช้' : 'User Management'}</span> ${sep} <span class="font-bold text-neutral-900 dark:text-white">${subLabel}</span>`;
      }

      const wfTextEl = document.getElementById('studentWireframeBreadcrumbText');
      const wfIconEl = document.getElementById('studentWireframeBreadcrumbIcon');
      const wfBackBtn = document.getElementById('studentWireframeBackBtn');
      if (wfIconEl) {
        wfIconEl.innerHTML = isTeacher
          ? '<span>👨‍🏫</span>'
          : '<img src="student-icon.png" alt="Student" class="w-4 h-4 object-contain" />';
      }
      if (wfTextEl && (isTeacher || isStudent)) {
        const cCode = (coursesCatalog[activeCourseId] && coursesCatalog[activeCourseId].code) || activeCourseId || 'CMM321';
        const safeCode = escapeHtml(cCode);
        const bcSep = '<span class="opacity-45 mx-1 select-none">/</span>';
        const bcBtn = (label, onclickExpr) => `<button type="button" onclick="${onclickExpr}" class="hover:underline hover:text-blue-600 dark:hover:text-sky-400 transition cursor-pointer whitespace-nowrap">${label}</button>`;
        const bcCur = (label) => `<span class="font-extrabold text-neutral-900 dark:text-white whitespace-nowrap">${label}</span>`;
        const renderTrail = (segs) => segs.map((seg, i) => i === segs.length - 1 ? bcCur(seg.label) : (seg.action ? bcBtn(seg.label, seg.action) : `<span>${seg.label}</span>`)).join(bcSep);

        if (isTeacher) {
          const roleLbl = isTh ? 'อาจารย์' : 'Teacher';
          const coursesLbl = isTh ? 'รายวิชา' : 'Courses';
          const projLbl = isTh ? 'โปรเจกต์' : 'Project';
          const tasksLbl = isTh ? 'งาน' : 'Tasks';
          const memLbl = isTh ? 'สมาชิก' : 'Members';
          const gradeLbl = isTh ? 'ตรวจและให้คะแนน' : 'Grading';
          const notifLbl = isTh ? 'การแจ้งเตือน' : 'Notifications';
          const goTchHome = "handleLogoClick()";
          const goTchProj = "switchTeacherViewMode('assessment'); navigateTo('teacher-review')";
          const goTchTasks = "switchTeacherViewMode('projectTasks'); navigateTo('teacher-review')";
          const goTchMem = "switchTeacherViewMode('students'); navigateTo('teacher-review')";

          if (screenId === 'teacher-dashboard' || screenId === 'courses') {
            wfTextEl.innerHTML = renderTrail([{ label: roleLbl, action: goTchHome }, { label: coursesLbl }]);
            if (wfBackBtn) wfBackBtn.classList.toggle('opacity-40', navigationHistory.length === 0);
          } else if (screenId === 'teacher-review') {
            const base = [
              { label: roleLbl, action: goTchHome },
              { label: coursesLbl, action: goTchHome },
              { label: safeCode, action: goTchProj }
            ];
            if (teacherReviewViewMode === 'projectTasks') {
              base.push({ label: projLbl, action: goTchProj }, { label: tasksLbl });
            } else if (teacherReviewViewMode === 'students') {
              base.push({ label: projLbl, action: goTchProj }, { label: tasksLbl, action: goTchTasks }, { label: memLbl });
            } else if (teacherReviewViewMode === 'grading') {
              base.push({ label: projLbl, action: goTchProj }, { label: tasksLbl, action: goTchTasks }, { label: memLbl, action: goTchMem }, { label: gradeLbl });
            } else {
              base.push({ label: projLbl });
            }
            wfTextEl.innerHTML = renderTrail(base);
            if (wfBackBtn) wfBackBtn.classList.remove('opacity-40');
          } else if (screenId === 'projects') {
            wfTextEl.innerHTML = renderTrail([{ label: roleLbl, action: goTchHome }, { label: coursesLbl, action: goTchHome }, { label: projLbl }]);
            if (wfBackBtn) wfBackBtn.classList.remove('opacity-40');
          } else if (screenId === 'notifications') {
            wfTextEl.innerHTML = renderTrail([{ label: roleLbl, action: goTchHome }, { label: coursesLbl, action: goTchHome }, { label: notifLbl }]);
            if (wfBackBtn) wfBackBtn.classList.remove('opacity-40');
          } else {
            wfTextEl.innerHTML = renderTrail([{ label: roleLbl, action: goTchHome }, { label: escapeHtml(screenId) }]);
          }
        } else {
          const roleLbl = isTh ? 'นักศึกษา' : 'Student';
          const coursesLbl = isTh ? 'รายวิชา' : 'Courses';
          const projLbl = isTh ? 'โปรเจกต์' : 'Project';
          const taskLbl = isTh ? 'งาน' : 'Task';
          const tasksLbl = isTh ? 'รายละเอียดงาน' : 'Tasks';
          const allTasksLbl = isTh ? 'งานทั้งหมด' : 'All Tasks';
          const notifLbl = isTh ? 'การแจ้งเตือน' : 'Notifications';
          const goStuHome = "handleLogoClick()";
          const goStuCourse = `selectCourse('${safeCode}')`;
          const goStuProjTasks = activeProjectId ? `openStudentProjectTaskDetail('${escapeHtml(activeProjectId)}')` : `openAllTasksHub()`;

          if (screenId === 'dashboard' || screenId === 'courses') {
            wfTextEl.innerHTML = renderTrail([{ label: roleLbl, action: goStuHome }, { label: coursesLbl }]);
            if (wfBackBtn) wfBackBtn.classList.toggle('opacity-40', navigationHistory.length === 0);
          } else if (screenId === 'course-detail') {
            wfTextEl.innerHTML = renderTrail([{ label: roleLbl, action: goStuHome }, { label: coursesLbl, action: goStuHome }, { label: safeCode, action: goStuCourse }, { label: projLbl }]);
            if (wfBackBtn) wfBackBtn.classList.remove('opacity-40');
          } else if (screenId === 'tasks-hub') {
            const isProjTaskMode = !!(activeTasksCourseFilter || activeTasksProjectFilter);
            wfTextEl.innerHTML = isProjTaskMode
              ? renderTrail([{ label: roleLbl, action: goStuHome }, { label: coursesLbl, action: goStuHome }, { label: safeCode, action: goStuCourse }, { label: projLbl, action: goStuCourse }, { label: taskLbl }])
              : renderTrail([{ label: roleLbl, action: goStuHome }, { label: allTasksLbl }]);
            if (wfBackBtn) wfBackBtn.classList.remove('opacity-40');
          } else if (screenId === 'task-detail') {
            wfTextEl.innerHTML = renderTrail([{ label: roleLbl, action: goStuHome }, { label: coursesLbl, action: goStuHome }, { label: safeCode, action: goStuCourse }, { label: projLbl, action: goStuCourse }, { label: taskLbl, action: goStuProjTasks }, { label: tasksLbl }]);
            if (wfBackBtn) wfBackBtn.classList.remove('opacity-40');
          } else if (screenId === 'projects') {
            wfTextEl.innerHTML = renderTrail([{ label: roleLbl, action: goStuHome }, { label: coursesLbl, action: goStuHome }, { label: projLbl }]);
            if (wfBackBtn) wfBackBtn.classList.remove('opacity-40');
          } else if (screenId === 'notifications') {
            wfTextEl.innerHTML = renderTrail([{ label: roleLbl, action: goStuHome }, { label: coursesLbl, action: goStuHome }, { label: notifLbl }]);
            if (wfBackBtn) wfBackBtn.classList.remove('opacity-40');
          } else {
            wfTextEl.innerHTML = renderTrail([{ label: roleLbl, action: goStuHome }, { label: escapeHtml(screenId) }]);
          }
        }
      }
      if (typeof translateDOM === 'function' && currentLanguage === 'th') {
        translateDOM('th');
      }
    }

    function renderDynamicPills(activeScreenId) {
      const container = document.getElementById('dynamicNavPillsContainer');
      if (!container) return;

      if (currentUserRole === 'admin') {
        const isAdminScreen = activeScreenId === 'admin';
        const isStdTab = isAdminScreen && activeAdminTab === 'students';
        const isTchTab = isAdminScreen && activeAdminTab === 'teachers';
        const isAllTab = isAdminScreen && activeAdminTab === 'all';
        const isCourses = activeScreenId === 'courses' || activeScreenId === 'course-detail';
        const isProject = activeScreenId === 'projects';

        const pillActive = 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-xs';
        const pillIdle = 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium';
        const isTh = currentLanguage === 'th';

        container.innerHTML = `
          <button onclick="switchAdminTab('students'); navigateTo('admin')" class="shrink-0 whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs transition pressable flex items-center gap-1.5 ${isStdTab ? pillActive : pillIdle}">
            <span>🎓</span>
            <span>${isTh ? 'จัดการนักศึกษา' : 'Manage Students'}</span>
          </button>
          <button onclick="switchAdminTab('teachers'); navigateTo('admin')" class="shrink-0 whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs transition pressable flex items-center gap-1.5 ${isTchTab ? pillActive : pillIdle}">
            <span>👨‍🏫</span>
            <span>${isTh ? 'จัดการอาจารย์' : 'Manage Teachers'}</span>
          </button>
          <button onclick="switchAdminTab('all'); navigateTo('admin')" class="shrink-0 whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs transition pressable flex items-center gap-1.5 ${isAllTab ? pillActive : pillIdle}">
            <span>👥</span>
            <span>${isTh ? 'รายชื่อทั้งหมด' : 'All Directory'}</span>
          </button>
          <button onclick="navigateTo('projects')" class="shrink-0 whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs transition pressable ${isProject ? pillActive : pillIdle}">
            ${isTh ? 'โปรเจกต์' : 'Projects'}
          </button>
          <button onclick="navigateTo('courses')" class="shrink-0 whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs transition pressable ${isCourses ? pillActive : pillIdle}">
            ${isTh ? 'รายวิชา' : 'Courses'}
          </button>
        `;
        return;
      }

      if (currentUserRole === 'teacher') {

        const isHome = activeScreenId === 'teacher-dashboard';
        const isMembers = activeScreenId === 'teacher-review' && (teacherReviewViewMode === 'students' || teacherReviewViewMode === 'grading');
        const isProject = activeScreenId === 'projects';
        const isTasks = activeScreenId === 'teacher-review' && (teacherReviewViewMode === 'assessment' || teacherReviewViewMode === 'editTask');
        const isNotifs = activeScreenId === 'notifications';

        container.innerHTML = `
          <button onclick="navigateTo('teacher-dashboard')" class="shrink-0 px-3.5 sm:px-4 py-1.5 rounded-full text-xs transition pressable ${isHome ? 'bg-neutral-900 text-white font-bold shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-medium'}">
            Home
          </button>
          <button onclick="switchTeacherViewMode('students'); navigateTo('teacher-review')" class="shrink-0 px-3.5 sm:px-4 py-1.5 rounded-full text-xs transition pressable ${isMembers ? 'bg-neutral-900 text-white font-bold shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-medium'}">
            Members
          </button>
          <button onclick="navigateTo('projects')" class="shrink-0 px-3.5 sm:px-4 py-1.5 rounded-full text-xs transition pressable ${isProject ? 'bg-neutral-900 text-white font-bold shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-medium'}">
            Project
          </button>
          <button onclick="switchTeacherViewMode('assessment'); navigateTo('teacher-review')" class="shrink-0 px-3.5 sm:px-4 py-1.5 rounded-full text-xs transition pressable ${isTasks ? 'bg-neutral-900 text-white font-bold shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-medium'}">
            Tasks
          </button>
          <button onclick="navigateTo('notifications')" class="shrink-0 px-3.5 sm:px-4 py-1.5 rounded-full text-xs transition pressable flex items-center gap-1.5 ${isNotifs ? 'bg-neutral-900 text-white font-bold shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-medium'}">
            <span>Notifications</span>
            ${(typeof hasUnreadNotifications !== 'function' || hasUnreadNotifications()) ? '<span class="w-1.5 h-1.5 rounded-full bg-appOrange"></span>' : ''}
          </button>
        `;
      } else {

        const isHome = activeScreenId === 'dashboard';
        const isCourses = activeScreenId === 'courses' || activeScreenId === 'course-detail';
        const isProject = activeScreenId === 'projects';
        const isTasks = activeScreenId === 'tasks-hub' || activeScreenId === 'task-detail';
        const isNotifs = activeScreenId === 'notifications';

        container.innerHTML = `
          <button onclick="navigateTo('dashboard')" class="shrink-0 px-3.5 sm:px-4 py-1.5 rounded-full text-xs transition pressable ${isHome ? 'bg-neutral-900 text-white font-bold shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-medium'}">
            Home
          </button>
          <button onclick="navigateTo('courses')" class="shrink-0 px-3.5 sm:px-4 py-1.5 rounded-full text-xs transition pressable ${isCourses ? 'bg-neutral-900 text-white font-bold shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-medium'}">
            Courses
          </button>
          <button onclick="navigateTo('projects')" class="shrink-0 px-3.5 sm:px-4 py-1.5 rounded-full text-xs transition pressable ${isProject ? 'bg-neutral-900 text-white font-bold shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-medium'}">
            Project
          </button>
          <button onclick="openAllTasksHub()" class="shrink-0 px-3.5 sm:px-4 py-1.5 rounded-full text-xs transition pressable flex items-center gap-1.5 ${isTasks ? 'bg-neutral-900 text-white font-bold shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-medium'}">
            <span>All Tasks</span>
            <span class="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">3 Due</span>
          </button>
          <button onclick="navigateTo('notifications')" class="shrink-0 px-3.5 sm:px-4 py-1.5 rounded-full text-xs transition pressable flex items-center gap-1.5 ${isNotifs ? 'bg-neutral-900 text-white font-bold shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-medium'}">
            <span>Notifications</span>
            ${(typeof hasUnreadNotifications !== 'function' || hasUnreadNotifications()) ? '<span class="w-1.5 h-1.5 rounded-full bg-appOrange"></span>' : ''}
          </button>
        `;
      }
    }

    let calendarYear = 2026;
    let calendarMonth = 8;
    let selectedCalendarDate = null;
    let calendarLastFocusedUserKey = null;

    function parseTaskDueDate(dueStr) {
      if (!dueStr) return null;
      const str = String(dueStr).trim();
      const iso = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (iso) {
        return { year: parseInt(iso[1], 10), month: parseInt(iso[2], 10) - 1, day: parseInt(iso[3], 10) };
      }
      const match = str.match(/([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})/);
      if (!match) return null;
      const mKey = match[1].slice(0, 3).toLowerCase();
      const months = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      const m = months[mKey];
      const d = parseInt(match[2], 10);
      const y = parseInt(match[3], 10);
      if (m === undefined || isNaN(d) || isNaN(y)) return null;
      return { year: y, month: m, day: d };
    }

    function getCalendarScopedTasks() {
      if (typeof ensureRelationalIntegrity === 'function') ensureRelationalIntegrity();
      const out = [];
      const seenTaskIds = new Set();

      if (currentUserRole === 'teacher') {
        const teacher = typeof getCurrentTeacher === 'function' ? getCurrentTeacher() : null;
        const allowedCodes = typeof getTeacherAssignedCourseCodes === 'function'
          ? getTeacherAssignedCourseCodes(teacher)
          : Object.keys(coursesCatalog);
        allowedCodes.forEach(cCode => {
          const course = coursesCatalog[cCode];
          if (!course || !Array.isArray(course.tasks)) return;
          course.tasks.forEach(t => {
            if (!t || !t.id || seenTaskIds.has(t.id)) return;
            if (String(t.id).startsWith('sim-')) return;
            seenTaskIds.add(t.id);
            out.push({ courseCode: course.code || cCode, courseTitle: course.title, task: t });
          });
        });
        return out;
      }

      if (currentUserRole === 'student' && typeof getCurrentStudent === 'function') {
        const curStd = getCurrentStudent();
        Object.entries(coursesCatalog).forEach(([cCode, course]) => {
          if (!course) return;
          const myTasks = typeof getStudentTasksInCourse === 'function'
            ? getStudentTasksInCourse(curStd.id, course.code || cCode)
            : (course.tasks || []).filter(t => t && (t.createdBy === curStd.id || (t.members || []).some(m => m.id === curStd.id)));
          myTasks.forEach(t => {
            if (!t || !t.id || seenTaskIds.has(t.id)) return;
            seenTaskIds.add(t.id);
            out.push({ courseCode: course.code || cCode, courseTitle: course.title, task: t });
          });
        });
        return out;
      }

      Object.entries(coursesCatalog).forEach(([cCode, course]) => {
        if (!course || !Array.isArray(course.tasks)) return;
        course.tasks.forEach(t => {
          if (!t || !t.id || seenTaskIds.has(t.id) || String(t.id).startsWith('sim-')) return;
          seenTaskIds.add(t.id);
          out.push({ courseCode: course.code || cCode, courseTitle: course.title, task: t });
        });
      });
      return out;
    }

    function getCalendarTaskVisualMeta(task, courseCode) {
      let statusStr = typeof computeTaskStatus === 'function' ? computeTaskStatus(task, courseCode) : (task.status || 'Active');
      if (currentUserRole === 'teacher') {
        const isDoneT = !!(task.isFinished || String(task.status || '').toLowerCase().includes('graded') || String(task.status || '').toLowerCase().includes('finish'));
        statusStr = isDoneT ? (String(task.status || '').toLowerCase().includes('graded') ? task.status : 'Finished') : 'Active';
      }
      const s = String(statusStr || '').toLowerCase();
      const isRevision = s.includes('revision') || s.includes('รอแก้');
      const isDone = !isRevision && (s.includes('graded') || s.includes('finish') || s.includes('complete'));
      const color = isRevision ? 'amber' : (isDone ? 'emerald' : 'rose');
      const rawTitle = String(task.title || '').trim();
      const cleanPrefix = new RegExp(`^${String(courseCode || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:-]?\\s*`, 'i');
      const displayTitle = rawTitle.replace(cleanPrefix, '').trim() || rawTitle;
      return { statusStr, isDone, isRevision, color, displayTitle };
    }

    function getCalendarEventsForMonth(year, month) {
      const map = {};
      const scoped = getCalendarScopedTasks();

      scoped.forEach(({ courseCode, courseTitle, task }) => {
        const p = parseTaskDueDate(task.due);
        if (!p || p.year !== year || p.month !== month) return;
        if (!map[p.day]) map[p.day] = [];
        const meta = getCalendarTaskVisualMeta(task, courseCode);
        map[p.day].push({
          isTask: true,
          type: 'task',
          courseCode,
          courseTitle,
          task,
          title: meta.displayTitle,
          statusStr: meta.statusStr,
          isDone: meta.isDone,
          isRevision: meta.isRevision,
          due: task.due,
          color: meta.color
        });
      });

      return map;
    }

    function syncCalendarFocusToUserTasks(force = false) {
      const uid = currentUserRole === 'teacher'
        ? (typeof getCurrentTeacher === 'function' ? getCurrentTeacher().id : 'teacher')
        : (currentUserRole === 'student' && typeof getCurrentStudent === 'function' ? getCurrentStudent().id : 'admin');
      const userKey = `${currentUserRole}:${uid}`;
      if (!force && calendarLastFocusedUserKey === userKey) return;
      calendarLastFocusedUserKey = userKey;

      const scoped = getCalendarScopedTasks()
        .map(item => ({ ...item, parsed: parseTaskDueDate(item.task.due), meta: getCalendarTaskVisualMeta(item.task, item.courseCode) }))
        .filter(item => item.parsed)
        .sort((a, b) => (a.parsed.year - b.parsed.year) || (a.parsed.month - b.parsed.month) || (a.parsed.day - b.parsed.day));

      const target = scoped.find(item => !item.meta.isDone) || scoped[0];
      if (target && target.parsed) {
        calendarYear = target.parsed.year;
        calendarMonth = target.parsed.month;
      } else {
        calendarYear = 2026;
        calendarMonth = 8;
      }
      selectedCalendarDate = null;
    }

    function changeCalendarMonth(delta) {
      calendarMonth += delta;
      if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear--;
      } else if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
      }
      selectedCalendarDate = null;
      renderCalendar();
    }

    function resetCalendarToCurrentMonth() {
      syncCalendarFocusToUserTasks(true);
      renderCalendar();
    }

    function handleCalendarDayClick(day) {
      selectedCalendarDate = { year: calendarYear, month: calendarMonth, day: day };
      renderCalendar();
      renderCalendarTaskPreview(day);
    }

    function closeCalendarTaskPreview() {
      selectedCalendarDate = null;
      ['calendarTaskPreviewBox', 'teacherCalendarTaskPreviewBox', 'mobileCalendarTaskPreviewBox'].forEach(boxId => {
        const box = document.getElementById(boxId);
        if (box) {
          box.classList.add('hidden');
          box.innerHTML = '';
        }
      });
      renderCalendar();
    }

    function renderCalendar() {
      syncCalendarFocusToUserTasks(false);
      const isTeacher = currentUserRole === 'teacher';
      const titleEls = [document.getElementById('calendarMonthYearTitle'), document.getElementById('teacherCalendarMonthYearTitle'), document.getElementById('mobileCalendarMonthYearTitle')].filter(Boolean);
      const daysHeaderEls = [document.getElementById('calendarDaysHeader'), document.getElementById('teacherCalendarDaysHeader'), document.getElementById('mobileCalendarDaysHeader')].filter(Boolean);
      const gridEls = [document.getElementById('calendarDaysGrid'), document.getElementById('teacherCalendarDaysGrid'), document.getElementById('mobileCalendarDaysGrid')].filter(Boolean);
      const legendEls = [document.getElementById('calendarEventsLegend'), document.getElementById('teacherCalendarEventsLegend'), document.getElementById('mobileCalendarEventsLegend')].filter(Boolean);
      if (gridEls.length === 0) return;

      const isThai = currentLanguage === 'th';
      const monthNames = isThai
        ? ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      const titleText = isThai ? `${monthNames[calendarMonth]} ${calendarYear + 543}` : `${monthNames[calendarMonth]} ${calendarYear}`;
      titleEls.forEach(el => el.innerText = titleText);

      const dayNames = isThai
        ? ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const headerHTML = dayNames.map(d => `<span class="py-1">${d}</span>`).join('');
      daysHeaderEls.forEach(el => el.innerHTML = headerHTML);

      const eventsMap = getCalendarEventsForMonth(calendarYear, calendarMonth);

      const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
      const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
      const prevMonthTotalDays = new Date(calendarYear, calendarMonth, 0).getDate();

      gridEls.forEach(gridEl => {
        gridEl.innerHTML = '';

        for (let i = firstDayIndex - 1; i >= 0; i--) {
          const prevDay = prevMonthTotalDays - i;
          const cell = document.createElement('div');
          cell.className = 'py-1 text-neutral-300 dark:text-neutral-600 select-none';
          cell.innerText = prevDay;
          gridEl.appendChild(cell);
        }

        const nowToday = new Date();
        for (let d = 1; d <= totalDays; d++) {
          const items = eventsMap[d] || [];
          const hasItems = items.length > 0;
          const isToday = calendarYear === nowToday.getFullYear() && calendarMonth === nowToday.getMonth() && d === nowToday.getDate();
          const isSelected = selectedCalendarDate && selectedCalendarDate.year === calendarYear && selectedCalendarDate.month === calendarMonth && selectedCalendarDate.day === d;

          const btn = document.createElement('button');
          btn.type = 'button';
          btn.onclick = () => handleCalendarDayClick(d);
          btn.title = hasItems ? items.map(it => `${it.courseCode}: ${it.title}`).join(' • ') : `Day ${d}`;

          let baseClasses = 'py-1.5 min-h-[32px] w-full flex items-center justify-center font-bold transition pressable touch-manipulation rounded-full text-[11px] relative cursor-pointer';

          if (isSelected) {
            baseClasses += ' ring-2 ring-sky-400 ring-offset-2 dark:ring-offset-neutral-900 z-10 scale-105';
          }

          if (hasItems) {
            const hasRev = items.some(it => it.color === 'amber');
            const hasUnfinished = items.some(it => it.color === 'rose');
            const color = hasRev ? 'amber' : (hasUnfinished ? 'rose' : 'emerald');

            if (color === 'rose') {
              btn.className = `${baseClasses} text-white bg-gradient-to-br from-rose-500 to-pink-600 shadow-xs hover:brightness-110`;
            } else if (color === 'amber') {
              btn.className = `${baseClasses} text-white bg-gradient-to-br from-amber-500 to-orange-500 shadow-xs hover:brightness-110`;
            } else {
              btn.className = `${baseClasses} text-white bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xs hover:brightness-110`;
            }

            if (items.length > 1) {
              btn.innerHTML = `<span>${d}</span><span class="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-neutral-900 text-white text-[8px] font-black flex items-center justify-center border border-white/80">${items.length}</span>`;
            } else {
              btn.innerText = d;
            }
          } else if (isToday) {
            btn.className = `${baseClasses} text-neutral-900 bg-neutral-200 dark:bg-neutral-700 dark:text-white font-black ring-2 ring-neutral-800 dark:ring-neutral-300`;
            btn.innerText = d;
          } else {
            btn.className = `${baseClasses} text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800`;
            btn.innerText = d;
          }

          gridEl.appendChild(btn);
        }

        const totalSlots = firstDayIndex + totalDays;
        const trailingCount = (7 - (totalSlots % 7)) % 7;
        for (let j = 1; j <= trailingCount; j++) {
          const cell = document.createElement('div');
          cell.className = 'py-1 text-neutral-300 dark:text-neutral-600 select-none';
          cell.innerText = j;
          gridEl.appendChild(cell);
        }
      });

      const statusLegendBar = `
        <div class="flex flex-wrap items-center justify-between gap-2 pb-1.5 mb-1 border-b border-neutral-100 dark:border-neutral-800/80 text-[9px] font-bold text-neutral-500 dark:text-neutral-400">
          <div class="flex items-center gap-2.5">
            <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span>${isThai ? 'ส่งแล้ว' : 'Done'}</span>
            <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span>${isThai ? 'รอแก้' : 'Revision'}</span>
            <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-rose-500"></span>${isThai ? 'ยังไม่ส่ง' : 'Due'}</span>
          </div>
          <span class="text-[9px] text-neutral-400">${Object.values(eventsMap).reduce((sum, arr) => sum + arr.length, 0)} ${isThai ? 'งาน' : 'Tasks'}</span>
        </div>
      `;

      legendEls.forEach(legendEl => {
        const daysWithEvents = Object.keys(eventsMap).map(Number).sort((a, b) => a - b);
        if (daysWithEvents.length === 0) {
          legendEl.innerHTML = `${statusLegendBar}<p class="text-[10px] text-neutral-400 italic py-2 text-center">${isThai ? 'ไม่มีกำหนดส่งงานของคุณในเดือนนี้' : 'No tasks due in this month.'}</p>`;
        } else {
          const monthAbbr = isThai
            ? ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][calendarMonth]
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][calendarMonth];
          const rowsHtml = daysWithEvents.map(day => {
            const dayItems = eventsMap[day];
            return dayItems.map(it => {
              const dotColor = it.color === 'emerald' ? 'bg-emerald-500' : it.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500';
              const tagCls = it.color === 'emerald'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                : it.color === 'amber'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60';
              const shortStatus = it.isDone ? (isThai ? 'ส่งแล้ว' : 'Done') : (it.isRevision ? (isThai ? 'รอแก้' : 'Revise') : (isThai ? 'ยังไม่ส่ง' : 'Due'));
              return `
                <div onclick="handleCalendarDayClick(${day})" class="flex items-center justify-between gap-2 p-2 rounded-xl bg-neutral-50/90 hover:bg-neutral-100 dark:bg-neutral-800/70 dark:hover:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700/70 transition pressable cursor-pointer group">
                  <div class="flex items-center gap-2 min-w-0 flex-1">
                    <span class="w-2 h-2 rounded-full ${dotColor} shrink-0"></span>
                    <span class="px-1.5 py-0.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-[9px] font-black text-neutral-700 dark:text-neutral-200 shrink-0">${day} ${monthAbbr}</span>
                    <span class="text-[10px] font-extrabold text-blue-600 dark:text-sky-400 shrink-0">${escapeHtml(it.courseCode)}</span>
                    <span class="truncate group-hover:text-blue-600 dark:group-hover:text-sky-300 transition font-semibold text-[11px] text-neutral-800 dark:text-neutral-100">${escapeHtml(it.title)}</span>
                  </div>
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${tagCls}">${shortStatus}</span>
                </div>
              `;
            }).join('');
          }).join('');
          legendEl.innerHTML = `${statusLegendBar}<div class="space-y-1.5">${rowsHtml}</div>`;
        }
      });

      if (selectedCalendarDate && selectedCalendarDate.year === calendarYear && selectedCalendarDate.month === calendarMonth) {
        renderCalendarTaskPreview(selectedCalendarDate.day);
      }
    }

    function openMobileCalendarModal() {
      const modal = document.getElementById('modalMobileCalendar');
      if (modal) {
        modal.classList.remove('hidden');
        renderCalendar();
      }
    }

    function closeMobileCalendarModal() {
      const modal = document.getElementById('modalMobileCalendar');
      if (modal) modal.classList.add('hidden');
    }

    function renderCalendarTaskPreview(day) {
      const isTeacher = currentUserRole === 'teacher';
      const targetBoxId = isTeacher ? 'teacherCalendarTaskPreviewBox' : 'calendarTaskPreviewBox';
      const mobileModalOpen = !document.getElementById('modalMobileCalendar')?.classList.contains('hidden');
      const box = document.getElementById(mobileModalOpen ? 'mobileCalendarTaskPreviewBox' : targetBoxId);
      if (!box) return;

      const isThai = currentLanguage === 'th';
      const monthNames = isThai
        ? ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      const weekDays = isThai
        ? ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์']
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      const dateObj = new Date(calendarYear, calendarMonth, day);
      const weekDayName = weekDays[dateObj.getDay()];
      const dateFormatted = isThai
        ? `${weekDayName}ที่ ${day} ${monthNames[calendarMonth]} ${calendarYear + 543}`
        : `${weekDayName}, ${monthNames[calendarMonth]} ${day}, ${calendarYear}`;

      const eventsMap = getCalendarEventsForMonth(calendarYear, calendarMonth);
      const items = eventsMap[day] || [];

      box.classList.remove('hidden');

      if (items.length === 0) {
        const noTasksAction = isTeacher
          ? `<button onclick="switchTeacherViewMode('assessment'); navigateTo('teacher-review')" class="text-xs font-semibold text-blue-600 hover:underline mt-1.5 inline-block">
               ${isThai ? 'ดูรายการงานและข้อกำหนดทั้งหมด →' : 'View Course Tasks & Assessments →'}
             </button>`
          : `<button onclick="openAllTasksHub()" class="text-xs font-semibold text-blue-600 hover:underline mt-1.5 inline-block">
               ${isThai ? 'ดูงานทั้งหมดในระบบ (Tasks Hub) →' : 'View All Tasks in Hub →'}
             </button>`;

        box.innerHTML = `
          <div class="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2">
            <span class="text-xs font-bold text-neutral-800 dark:text-white flex items-center gap-1.5">
              <span>📅</span>
              <span>${escapeHtml(dateFormatted)}</span>
            </span>
            <button onclick="closeCalendarTaskPreview()" title="Close" class="w-5 h-5 rounded-full bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs flex items-center justify-center font-bold">✕</button>
          </div>
          <div class="py-1">
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              ${isThai ? 'ไม่มีงานหรือกำหนดส่งที่ตรงกับวันนี้' : 'No assignment or course milestone due on this date.'}
            </p>
            ${noTasksAction}
          </div>
        `;
        return;
      }

      let itemsHTML = '';
      items.forEach(it => {
        if (it.isTask && it.task) {
          const task = it.task;
          const computedStatus = computeTaskStatus(task, it.courseCode);
          const statusColor = getTaskStatusBadgeClasses(computedStatus);

          const actionBtn = isTeacher
            ? `<button type="button" onclick="closeMobileCalendarModal(); inspectTeacherTaskAndGrade('${task.id}')" class="w-full mt-1.5 py-2 px-3 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition pressable touch-manipulation">
                 <span>${isThai ? 'ดูผลงานและให้คะแนน' : 'View Submissions & Grade'}</span>
                 <span>→</span>
               </button>`
            : `<button type="button" onclick="closeMobileCalendarModal(); openTaskDetails('${task.id}')" class="w-full mt-1.5 py-2 px-3 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition pressable touch-manipulation">
                 <span>${isThai ? 'เข้าสู่หน้ารายละเอียดงานนี้' : 'Go to Task Details'}</span>
                 <span>→</span>
               </button>`;

          itemsHTML += `
            <div class="bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-2xs space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  ${escapeHtml(it.courseCode)} • ${escapeHtml(it.courseTitle)}
                </span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg border ${statusColor}">
                  ${escapeHtml(computedStatus)}
                </span>
              </div>

              <div>
                <span class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">${isThai ? 'ตัวอย่างชื่องาน' : 'Task Preview'}</span>
                <h5 class="text-xs sm:text-sm font-black text-neutral-900 dark:text-white leading-snug">
                  ${escapeHtml(task.title)}
                </h5>
              </div>

              <div class="flex items-center gap-2 text-[10px] text-neutral-500 dark:text-neutral-400">
                <span>👥 ${escapeHtml(task.type || 'Individual')}</span>
                <span>•</span>
                <span>⏰ ${escapeHtml(task.due)}</span>
              </div>

              <p class="text-[11px] text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-lg border border-neutral-100 dark:border-neutral-700">
                ${escapeHtml(task.description)}
              </p>

              ${actionBtn}
            </div>
          `;
        } else {
          itemsHTML += `
            <div class="bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-2xs space-y-1">
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-bold text-sky-700 bg-sky-50 dark:bg-sky-950 dark:text-sky-300 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                  ${escapeHtml(it.courseCode)}
                </span>
                <span class="text-xs font-bold text-neutral-800 dark:text-white">${escapeHtml(it.title)}</span>
              </div>
            </div>
          `;
        }
      });

      box.innerHTML = `
        <div class="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2">
          <div class="flex items-center gap-1.5">
            <span class="text-xs">📅</span>
            <span class="text-xs font-bold text-neutral-800 dark:text-white">${escapeHtml(dateFormatted)}</span>
          </div>
          <button onclick="closeCalendarTaskPreview()" title="Close" class="w-5 h-5 rounded-full bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs flex items-center justify-center font-bold">✕</button>
        </div>
        <div class="space-y-2">
          ${itemsHTML}
        </div>
      `;
    }
