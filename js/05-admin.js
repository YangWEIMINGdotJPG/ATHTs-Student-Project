    let activeAdminTab = 'students';
    let pendingAdminDeleteUser = null;

    const defaultStudentDirectorySnapshot = JSON.parse(JSON.stringify(studentDirectory));
    const defaultTeacherDirectorySnapshot = JSON.parse(JSON.stringify(teacherDirectory));

    function loadAdminPersistedDirectories() {
      try {
        const savedStudents = localStorage.getItem('atht_admin_students');
        if (savedStudents) {
          const parsed = JSON.parse(savedStudents);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            Object.keys(studentDirectory).forEach(k => delete studentDirectory[k]);
            Object.assign(studentDirectory, parsed);
          }
        }
        const savedTeachers = localStorage.getItem('atht_admin_teachers');
        if (savedTeachers) {
          const parsedT = JSON.parse(savedTeachers);
          if (parsedT && typeof parsedT === 'object' && Object.keys(parsedT).length > 0) {
            Object.keys(teacherDirectory).forEach(k => delete teacherDirectory[k]);
            Object.assign(teacherDirectory, parsedT);
            const defaultCoursesMap = {
              'suripong.ler': ['CMM321', 'CMM320'],
              'nuttapong.pra': ['CMM349', 'CMM390'],
              'akek.pat': ['CMM310', 'GEN121']
            };
            Object.entries(defaultCoursesMap).forEach(([tid, cList]) => {
              if (teacherDirectory[tid] && (!Array.isArray(teacherDirectory[tid].courses) || teacherDirectory[tid].courses.length < 2)) {
                teacherDirectory[tid].courses = cList;
              }
            });
          }
        }
      } catch (e) {
        console.warn('Failed to load persisted admin directories:', e);
      }

      Object.values(studentDirectory).forEach(s => {
        if (!s.status) s.status = 'Active';
        if (!s.year) s.year = 'Year 2 (ID 67)';
      });
      Object.values(teacherDirectory).forEach(t => {
        if (!t.status) t.status = 'Active';
        if (!Array.isArray(t.courses)) t.courses = ['CMM321'];
      });
    }

    function saveAdminPersistedDirectories() {
      try {
        localStorage.setItem('atht_admin_students', JSON.stringify(studentDirectory));
        localStorage.setItem('atht_admin_teachers', JSON.stringify(teacherDirectory));
      } catch (e) {}
    }

    loadAdminPersistedDirectories();

    function getAdminAuditLogs() {
      try {
        const raw = localStorage.getItem('atht_admin_audit_logs');
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return [
        { time: 'Today, 09:00', action: 'System Initialized', detail: 'Loaded 81 Undergraduate Students and 3 Faculty Instructors into KMUTT Directory.', badge: 'SYSTEM' },
        { time: 'Today, 09:15', action: 'Course Roster Synced', detail: 'Verified CMM321, CMM349, and CMM310 instructor permissions.', badge: 'SYNC' }
      ];
    }

    function addAdminAuditLog(action, detail, badge = 'ADMIN') {
      const logs = getAdminAuditLogs();
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      logs.unshift({
        time: `Today, ${timeStr}`,
        action,
        detail,
        badge
      });
      if (logs.length > 25) logs.pop();
      try {
        localStorage.setItem('atht_admin_audit_logs', JSON.stringify(logs));
      } catch (e) {}
      renderAdminAuditLogs();
    }

    function clearAdminAuditLogs() {
      localStorage.removeItem('atht_admin_audit_logs');
      renderAdminAuditLogs();
      alertMessage('Audit log history cleared.');
    }

    function renderAdminAuditLogs() {
      const container = document.getElementById('adminAuditLogContainer');
      if (!container) return;
      const logs = getAdminAuditLogs();
      if (logs.length === 0) {
        container.innerHTML = `<p class="text-xs text-neutral-400 italic py-4 text-center">No recent directory changes recorded.</p>`;
        return;
      }
      container.innerHTML = logs.map(item => `
        <div class="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/70">
          <div class="flex items-start gap-2.5 min-w-0">
            <span class="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-neutral-900 text-white dark:bg-neutral-700 shrink-0 mt-0.5">${escapeHtml(item.badge || 'LOG')}</span>
            <div class="min-w-0">
              <span class="font-bold text-neutral-900 dark:text-white block text-xs">${escapeHtml(item.action)}</span>
              <span class="text-[11px] text-neutral-500 dark:text-neutral-400 block truncate">${escapeHtml(item.detail)}</span>
            </div>
          </div>
          <span class="text-[10px] font-mono text-neutral-400 shrink-0">${escapeHtml(item.time)}</span>
        </div>
      `).join('');
    }

    function switchAdminTab(tab) {
      activeAdminTab = tab;

      const btnStudents = document.getElementById('adminTabBtnStudents');
      const btnTeachers = document.getElementById('adminTabBtnTeachers');
      const btnAll = document.getElementById('adminTabBtnAll');

      const activeClass = 'px-4 py-2 rounded-xl text-xs font-extrabold transition pressable bg-neutral-900 text-white shadow-xs flex items-center gap-1.5';
      const inactiveClass = 'px-4 py-2 rounded-xl text-xs font-bold transition pressable text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 flex items-center gap-1.5';

      if (btnStudents) btnStudents.className = tab === 'students' ? activeClass : inactiveClass;
      if (btnTeachers) btnTeachers.className = tab === 'teachers' ? activeClass : inactiveClass;
      if (btnAll) btnAll.className = tab === 'all' ? activeClass : inactiveClass;

      const inlineBtnText = document.getElementById('adminInlineAddBtnText');
      const topBtnText = document.getElementById('adminTopCreateBtnLabel');
      if (tab === 'teachers') {
        if (inlineBtnText) inlineBtnText.innerText = 'Add Teacher';
        if (topBtnText) topBtnText.innerText = 'Add New Teacher';
      } else {
        if (inlineBtnText) inlineBtnText.innerText = 'Add Student';
        if (topBtnText) topBtnText.innerText = 'Add New Student';
      }

      updateBreadcrumbUI('admin');
      renderAdminScreen();
    }

    function renderAdminScreen() {
      const studentsList = Object.values(studentDirectory);
      const teachersList = Object.values(teacherDirectory);
      const totalUsers = studentsList.length + teachersList.length;

      const activeStudents = studentsList.filter(s => (s.status || 'Active') === 'Active').length;
      const activeTeachers = teachersList.filter(t => (t.status || 'Active') === 'Active').length;
      const totalActive = activeStudents + activeTeachers;
      const activePct = totalUsers > 0 ? Math.round((totalActive / totalUsers) * 100) : 100;

      const elTotal = document.getElementById('adminStatTotalUsers');
      if (elTotal) elTotal.innerText = totalUsers;
      const elStdCount = document.getElementById('adminStatStudentsCount');
      if (elStdCount) elStdCount.innerText = studentsList.length;
      const elTchCount = document.getElementById('adminStatTeachersCount');
      if (elTchCount) elTchCount.innerText = teachersList.length;

      const donutPctEl = document.getElementById('adminActiveDonutPct');
      if (donutPctEl) donutPctEl.innerText = `${activePct}%`;
      const donutPathEl = document.getElementById('adminActiveDonutPath');
      if (donutPathEl) donutPathEl.setAttribute('stroke-dasharray', `${activePct}, 100`);

      const kpiStd = document.getElementById('adminKpiStudents');
      if (kpiStd) kpiStd.innerText = studentsList.length;
      const kpiTch = document.getElementById('adminKpiTeachers');
      if (kpiTch) kpiTch.innerText = teachersList.length;
      const kpiAct = document.getElementById('adminKpiActive');
      if (kpiAct) kpiAct.innerText = totalActive;
      const kpiCrs = document.getElementById('adminKpiCourses');
      if (kpiCrs) kpiCrs.innerText = Object.keys(coursesCatalog).length;

      const badgeStd = document.getElementById('adminTabBadgeStudents');
      if (badgeStd) badgeStd.innerText = studentsList.length;
      const badgeTch = document.getElementById('adminTabBadgeTeachers');
      if (badgeTch) badgeTch.innerText = teachersList.length;
      const badgeAll = document.getElementById('adminTabBadgeAll');
      if (badgeAll) badgeAll.innerText = totalUsers;

      renderAdminUsersTable();
      renderAdminAuditLogs();
    }

    function renderAdminUsersTable() {
      const tbody = document.getElementById('adminUsersTableBody');
      if (!tbody) return;

      const query = (document.getElementById('adminUserSearchInput')?.value || '').toLowerCase().trim();
      const statusFilter = document.getElementById('adminStatusFilterSelect')?.value || 'ALL';
      const courseFilter = document.getElementById('adminCourseFilterSelect')?.value || 'ALL';

      let combined = [];

      if (activeAdminTab === 'students' || activeAdminTab === 'all') {
        Object.values(studentDirectory).forEach(s => {
          combined.push({
            role: 'student',
            id: s.id,
            codeDisplay: s.id,
            fullName: s.fullName,
            shortName: s.shortName,
            initials: s.initials || 'ST',
            email: s.email,
            deptOrCourses: s.major || 'Applied Computer Science - Multimedia',
            subMeta: s.year || 'Year 2 (ID 67)',
            courses: ['CMM321', 'CMM349', 'CMM310'],
            status: s.status || 'Active',
            raw: s
          });
        });
      }

      if (activeAdminTab === 'teachers' || activeAdminTab === 'all') {
        Object.values(teacherDirectory).forEach(t => {
          const coursesArr = Array.isArray(t.courses) && t.courses.length > 0 ? t.courses : ['CMM321'];
          combined.push({
            role: 'teacher',
            id: t.id,
            codeDisplay: t.facultyCode || 'FAC-CMM',
            fullName: t.fullName,
            shortName: t.shortName,
            initials: t.initials || 'TR',
            email: t.email,
            deptOrCourses: coursesArr.join(', '),
            subMeta: t.specialization || t.title || 'Course Instructor',
            courses: coursesArr,
            status: t.status || 'Active',
            raw: t
          });
        });
      }

      if (statusFilter !== 'ALL') {
        combined = combined.filter(u => u.status === statusFilter);
      }

      if (courseFilter !== 'ALL') {
        combined = combined.filter(u => u.courses.includes(courseFilter));
      }

      if (query) {
        combined = combined.filter(u =>
          u.id.toLowerCase().includes(query) ||
          u.codeDisplay.toLowerCase().includes(query) ||
          u.fullName.toLowerCase().includes(query) ||
          u.shortName.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.deptOrCourses.toLowerCase().includes(query) ||
          u.subMeta.toLowerCase().includes(query)
        );
      }

      const showingEl = document.getElementById('adminShowingCountText');
      if (showingEl) {
        const label = activeAdminTab === 'teachers' ? 'Teachers' : (activeAdminTab === 'students' ? 'Students' : 'Users');
        showingEl.innerText = `Showing ${combined.length} ${label}`;
      }

      tbody.innerHTML = '';

      if (combined.length === 0) {
        tbody.innerHTML = `
          <div class="py-14 text-center space-y-2 text-neutral-400">
            <span class="text-3xl block">🔍</span>
            <p class="text-xs font-bold text-neutral-700 dark:text-neutral-300">No matching user accounts found</p>
            <p class="text-[11px] text-neutral-400">Try clearing your search query or adding a new user account.</p>
          </div>
        `;
        return;
      }

      combined.forEach(u => {
        const isTeacher = u.role === 'teacher';
        const isActive = u.status === 'Active';

        const row = document.createElement('div');
        row.className = 'py-3 px-3 sm:px-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 rounded-xl transition grid grid-cols-1 md:grid-cols-12 gap-2.5 md:gap-3 items-center text-xs';

        const roleBadgeHtml = isTeacher
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200 dark:border-orange-800">👨‍🏫 Teacher</span>`
          : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"><img src="student-icon.png" alt="Student" class="w-3.5 h-3.5 object-contain" /><span>Student</span></span>`;

        const statusPillHtml = isActive
          ? `<button onclick="toggleAdminUserStatus('${u.role}', '${escapeHtml(u.id)}')" title="Click to toggle Active/Suspended" class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:opacity-80 transition cursor-pointer">● Active</button>`
          : `<button onclick="toggleAdminUserStatus('${u.role}', '${escapeHtml(u.id)}')" title="Click to activate account" class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:opacity-80 transition cursor-pointer">○ Suspended</button>`;

        row.innerHTML = `

          <div class="md:col-span-2 flex items-center justify-between md:justify-start gap-2">
            <span class="font-mono font-bold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-200/80 dark:border-neutral-700 text-[11px]">
              ${escapeHtml(u.codeDisplay)}
            </span>
            <span class="md:hidden">${statusPillHtml}</span>
          </div>

          <div class="md:col-span-3 flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-xl ${isTeacher ? 'bg-orange-600 text-white' : 'bg-neutral-900 dark:bg-neutral-700 text-white'} flex items-center justify-center text-[11px] font-extrabold shrink-0 shadow-2xs">
              ${escapeHtml(u.initials)}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-bold text-neutral-900 dark:text-white truncate">${escapeHtml(u.fullName)}</span>
              </div>
              <div class="flex items-center gap-1.5 mt-0.5">
                ${roleBadgeHtml}
                <span class="text-[10px] text-neutral-400 truncate">${escapeHtml(u.subMeta)}</span>
              </div>
            </div>
          </div>

          <div class="md:col-span-3 min-w-0">
            <span class="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold truncate block" title="${escapeHtml(u.email)}">
              ${escapeHtml(u.email)}
            </span>
            <span class="text-[10px] text-neutral-400 block">KMUTT SSO Verified</span>
          </div>

          <div class="md:col-span-2 min-w-0">
            ${isTeacher ? `
              <div class="flex flex-wrap gap-1">
                ${u.courses.map(c => `<span class="px-2 py-0.5 rounded-md bg-neutral-900 text-white dark:bg-neutral-700 text-[10px] font-bold">${escapeHtml(c)}</span>`).join('')}
              </div>
            ` : `
              <span class="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 truncate block">${escapeHtml(u.deptOrCourses)}</span>
              <span class="text-[10px] text-neutral-400">${Object.keys(coursesCatalog || {}).length} Enrolled Courses</span>
            `}
          </div>

          <div class="hidden md:flex md:col-span-1 justify-center">
            ${statusPillHtml}
          </div>

          <div class="md:col-span-1 flex items-center justify-end gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100 dark:border-neutral-800">
            <button onclick="adminImpersonateUser('${u.role}', '${escapeHtml(u.id)}')" title="Preview Portal as ${escapeHtml(u.shortName)}" class="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-bold text-[10px] transition pressable">
              View As
            </button>
            <button onclick="openAdminUserModal('edit', '${u.role}', '${escapeHtml(u.id)}')" title="Edit User" class="p-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs transition pressable">
              ✏️
            </button>
            <button onclick="openAdminDeleteModal('${u.role}', '${escapeHtml(u.id)}', '${escapeHtml(u.fullName)}')" title="Remove User" class="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs transition pressable">
              🗑️
            </button>
          </div>
        `;

        tbody.appendChild(row);
      });
    }

    function setAdminModalRoleType(role) {
      document.getElementById('adminFormRoleInput').value = role;
      const btnStd = document.getElementById('adminFormRoleBtnStudent');
      const btnTch = document.getElementById('adminFormRoleBtnTeacher');
      const iconEl = document.getElementById('adminModalRoleIcon');
      const idLabel = document.getElementById('adminFormIdLabel');
      const idInput = document.getElementById('adminFormIdInput');
      const stdGroup = document.getElementById('adminStudentFieldsGroup');
      const tchGroup = document.getElementById('adminTeacherFieldsGroup');
      const isEdit = document.getElementById('adminFormMode').value === 'edit';

      if (role === 'teacher') {
        if (btnTch) btnTch.className = 'py-2 rounded-lg font-extrabold text-xs transition bg-neutral-900 text-white shadow-2xs flex items-center justify-center gap-1.5';
        if (btnStd) btnStd.className = 'py-2 rounded-lg font-bold text-xs transition text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 flex items-center justify-center gap-1.5';
        if (iconEl) iconEl.innerText = '👨‍🏫';
        if (idLabel) idLabel.innerText = 'Faculty Code / Instructor ID *';
        if (idInput && !isEdit) {
          const nextNum = Object.keys(teacherDirectory).length + 101;
          idInput.value = `FAC-CMM-${nextNum}`;
        }
        if (stdGroup) stdGroup.classList.add('hidden');
        if (tchGroup) tchGroup.classList.remove('hidden');
      } else {
        if (btnStd) btnStd.className = 'py-2 rounded-lg font-extrabold text-xs transition bg-neutral-900 text-white shadow-2xs flex items-center justify-center gap-1.5';
        if (btnTch) btnTch.className = 'py-2 rounded-lg font-bold text-xs transition text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 flex items-center justify-center gap-1.5';
        if (iconEl) iconEl.innerHTML = '<img src="student-icon.png" alt="Student" class="w-full h-full object-contain" />';
        if (idLabel) idLabel.innerText = 'Student ID (11 Digits) *';
        if (idInput && !isEdit) {
          const maxId = Object.keys(studentDirectory)
            .map(k => parseInt(k, 10))
            .filter(n => !isNaN(n) && String(n).startsWith('670805'))
            .reduce((a, b) => Math.max(a, b), 67080500280);
          idInput.value = String(maxId + 1);
        }
        if (stdGroup) stdGroup.classList.remove('hidden');
        if (tchGroup) tchGroup.classList.add('hidden');
      }
    }

    function autoFillAdminShortNameAndEmail() {
      const mode = document.getElementById('adminFormMode').value;
      if (mode === 'edit') return;
      const fullName = (document.getElementById('adminFormFullNameInput')?.value || '').trim();
      const role = document.getElementById('adminFormRoleInput')?.value || 'student';
      const shortInput = document.getElementById('adminFormShortNameInput');
      const emailInput = document.getElementById('adminFormEmailInput');

      if (!fullName) return;
      const cleanName = fullName.replace(/^(Prof\.|Assoc\.\s*Prof\.|Asst\.\s*Prof\.|Dr\.)\s*/i, '').trim();
      const parts = cleanName.split(/\s+/);
      const first = parts[0] || '';
      const last = parts.length > 1 ? parts[parts.length - 1] : '';

      if (shortInput) {
        const prefix = role === 'teacher' ? 'Prof. ' : '';
        shortInput.value = last ? `${prefix}${first} ${last.charAt(0)}.` : `${prefix}${first}`;
      }
      if (emailInput) {
        const firstSlug = first.toLowerCase().replace(/[^a-z0-9]/g, '');
        const lastPrefix = last ? last.slice(0, 3).toLowerCase().replace(/[^a-z0-9]/g, '') : 'usr';
        const domain = role === 'teacher' ? 'kmutt.ac.th' : 'mail.kmutt.ac.th';
        emailInput.value = `${firstSlug}.${lastPrefix}@${domain}`;
      }
    }

    function openAdminUserModal(mode, role, userId) {
      const modal = document.getElementById('modalAdminUserForm');
      if (!modal) return;

      document.getElementById('adminFormMode').value = mode;
      const targetRole = role || (activeAdminTab === 'teachers' ? 'teacher' : 'student');
      setAdminModalRoleType(targetRole);

      const titleEl = document.getElementById('adminModalTitle');
      const submitBtn = document.getElementById('adminFormSubmitBtn');

      if (mode === 'edit' && userId) {
        document.getElementById('adminFormOriginalId').value = userId;
        if (targetRole === 'teacher') {
          const t = teacherDirectory[userId];
          if (!t) return;
          if (titleEl) titleEl.innerText = `Edit Teacher: ${t.shortName}`;
          if (submitBtn) submitBtn.innerText = 'Save Teacher Changes';
          document.getElementById('adminFormIdInput').value = t.facultyCode || t.id;
          document.getElementById('adminFormStatusInput').value = t.status || 'Active';
          document.getElementById('adminFormFullNameInput').value = t.fullName || '';
          document.getElementById('adminFormShortNameInput').value = t.shortName || '';
          document.getElementById('adminFormEmailInput').value = t.email || '';
          document.getElementById('adminFormTeacherTitleInput').value = t.title || 'Course Instructor';
          document.getElementById('adminFormSpecializationInput').value = t.specialization || 'Computer & Multimedia';

          const coursesArr = Array.isArray(t.courses) ? t.courses : ['CMM321'];
          document.querySelectorAll('.admin-course-checkbox').forEach(cb => {
            cb.checked = coursesArr.includes(cb.value);
          });
        } else {
          const s = studentDirectory[userId];
          if (!s) return;
          if (titleEl) titleEl.innerText = `Edit Student: ${s.id}`;
          if (submitBtn) submitBtn.innerText = 'Save Student Changes';
          document.getElementById('adminFormIdInput').value = s.id;
          document.getElementById('adminFormStatusInput').value = s.status || 'Active';
          document.getElementById('adminFormFullNameInput').value = s.fullName || '';
          document.getElementById('adminFormShortNameInput').value = s.shortName || '';
          document.getElementById('adminFormEmailInput').value = s.email || '';
          document.getElementById('adminFormMajorInput').value = s.major || 'Applied Computer Science - Multimedia';
          document.getElementById('adminFormYearInput').value = s.year || 'Year 2 (ID 67)';
        }
      } else {
        document.getElementById('adminFormOriginalId').value = '';
        if (titleEl) titleEl.innerText = targetRole === 'teacher' ? 'Add New Teacher / Instructor' : 'Add New Student';
        if (submitBtn) submitBtn.innerText = targetRole === 'teacher' ? 'Create Teacher Account' : 'Create Student Account';
        document.getElementById('adminFormStatusInput').value = 'Active';
        document.getElementById('adminFormFullNameInput').value = '';
        document.getElementById('adminFormShortNameInput').value = '';
        document.getElementById('adminFormEmailInput').value = '';
        setAdminModalRoleType(targetRole);
      }

      modal.classList.remove('hidden');
    }

    function closeAdminUserModal() {
      const modal = document.getElementById('modalAdminUserForm');
      if (modal) modal.classList.add('hidden');
    }

    function handleSaveAdminUser(e) {
      if (e && e.preventDefault) e.preventDefault();

      const mode = document.getElementById('adminFormMode').value;
      const origId = document.getElementById('adminFormOriginalId').value;
      const role = document.getElementById('adminFormRoleInput').value;
      const rawId = (document.getElementById('adminFormIdInput').value || '').trim();
      const status = document.getElementById('adminFormStatusInput').value || 'Active';
      const fullName = (document.getElementById('adminFormFullNameInput').value || '').trim();
      let shortName = (document.getElementById('adminFormShortNameInput').value || '').trim();
      const email = (document.getElementById('adminFormEmailInput').value || '').trim();

      if (!rawId || !fullName || !email) {
        alertMessage('Please fill in all required fields.');
        return;
      }

      const cleanWords = fullName.replace(/^(Prof\.|Assoc\.\s*Prof\.|Asst\.\s*Prof\.|Dr\.)\s*/i, '').trim().split(/\s+/);
      const initials = ((cleanWords[0]?.charAt(0) || 'U') + (cleanWords[1]?.charAt(0) || '')).toUpperCase();
      if (!shortName) {
        shortName = cleanWords.length > 1 ? `${cleanWords[0]} ${cleanWords[cleanWords.length - 1].charAt(0)}.` : fullName;
      }

      if (role === 'teacher') {
        const title = (document.getElementById('adminFormTeacherTitleInput').value || 'Instructor').trim();
        const spec = (document.getElementById('adminFormSpecializationInput').value || 'Computer Multimedia').trim();
        const checkedCourses = Array.from(document.querySelectorAll('.admin-course-checkbox:checked')).map(cb => cb.value);
        const courses = checkedCourses.length > 0 ? checkedCourses : ['CMM321'];

        const keyId = mode === 'edit' && origId ? origId : (email.split('@')[0].toLowerCase() || rawId.toLowerCase());
        teacherDirectory[keyId] = {
          id: keyId,
          fullName,
          shortName,
          initials,
          email,
          facultyCode: rawId.toUpperCase(),
          title,
          dept: 'Department of Applied Computer Science - Multimedia',
          faculty: 'Faculty of Industrial Education and Technology',
          specialization: spec,
          courses,
          status
        };

        courses.forEach(cCode => {
          if (coursesCatalog[cCode]) {
            coursesCatalog[cCode].teacher = fullName.replace(/^(Prof\.|Assoc\.\s*Prof\.|Asst\.\s*Prof\.)\s*/i, '');
          }
        });

        addAdminAuditLog(
          mode === 'edit' ? 'Updated Teacher Account' : 'Created Teacher Account',
          `${fullName} (${rawId}) • Courses: ${courses.join(', ')}`,
          'TEACHER'
        );
      } else {
        const major = (document.getElementById('adminFormMajorInput').value || 'Applied Computer Science - Multimedia').trim();
        const year = document.getElementById('adminFormYearInput').value || 'Year 2 (ID 67)';

        if (mode === 'edit' && origId && origId !== rawId) {
          delete studentDirectory[origId];
        }

        studentDirectory[rawId] = {
          id: rawId,
          fullName,
          shortName,
          email,
          initials,
          major,
          dept: 'Department of Applied Computer Science - Multimedia',
          year,
          status
        };

        addAdminAuditLog(
          mode === 'edit' ? 'Updated Student Account' : 'Created Student Account',
          `${rawId} - ${fullName} (${email})`,
          'STUDENT'
        );
      }

      saveAdminPersistedDirectories();
      closeAdminUserModal();
      renderAdminScreen();
      updateBreadcrumbUI('admin');
      alertMessage(`${role === 'teacher' ? 'Teacher' : 'Student'} "${fullName}" saved successfully!`);
    }

    function toggleAdminUserStatus(role, id) {
      if (role === 'teacher') {
        const t = teacherDirectory[id];
        if (!t) return;
        t.status = (t.status || 'Active') === 'Active' ? 'Inactive' : 'Active';
        addAdminAuditLog('Status Changed', `Teacher ${t.shortName} set to ${t.status}`, 'STATUS');
        alertMessage(`${t.shortName} status changed to ${t.status}`);
      } else {
        const s = studentDirectory[id];
        if (!s) return;
        s.status = (s.status || 'Active') === 'Active' ? 'Inactive' : 'Active';
        addAdminAuditLog('Status Changed', `Student ${s.id} (${s.shortName}) set to ${s.status}`, 'STATUS');
        alertMessage(`${s.shortName} (${s.id}) status changed to ${s.status}`);
      }
      saveAdminPersistedDirectories();
      renderAdminScreen();
    }

    function openAdminDeleteModal(role, id, name) {
      pendingAdminDeleteUser = { role, id, name };
      const textEl = document.getElementById('adminDeleteConfirmText');
      if (textEl) {
        textEl.innerText = `Are you sure you want to remove ${role.toUpperCase()} "${name}" (${id}) from the portal directory?`;
      }
      const modal = document.getElementById('modalAdminDeleteConfirm');
      if (modal) modal.classList.remove('hidden');
    }

    function closeAdminDeleteModal() {
      pendingAdminDeleteUser = null;
      const modal = document.getElementById('modalAdminDeleteConfirm');
      if (modal) modal.classList.add('hidden');
    }

    function confirmAdminDeleteUser() {
      if (!pendingAdminDeleteUser) return;
      const { role, id, name } = pendingAdminDeleteUser;

      if (role === 'teacher') {
        delete teacherDirectory[id];
        addAdminAuditLog('Removed Teacher', `Deleted instructor ${name} (${id})`, 'DELETE');
      } else {
        delete studentDirectory[id];
        addAdminAuditLog('Removed Student', `Deleted student ${name} (${id})`, 'DELETE');
      }

      saveAdminPersistedDirectories();
      closeAdminDeleteModal();
      renderAdminScreen();
      updateBreadcrumbUI('admin');
      alertMessage(`Removed ${name} from directory.`);
    }

    function adminImpersonateUser(role, id) {
      if (role === 'teacher') {
        currentUserRole = 'teacher';
        localStorage.setItem('atht_user_role', 'teacher');
        localStorage.setItem('atht_teacher_id', id);
        const t = getTeacherProfile(id);
        navigateTo('teacher-dashboard');
        alertMessage(`Viewing portal as Teacher: ${t.fullName}`);
      } else {
        currentUserRole = 'student';
        localStorage.setItem('atht_user_role', 'student');
        localStorage.setItem('atht_student_id', id);
        const s = getStudentProfile(id);
        navigateTo('dashboard');
        alertMessage(`Viewing portal as Student: ${s.fullName} (${s.id})`);
      }
    }

    function switchRoleFromAdmin(targetRole) {
      if (targetRole === 'teacher') {
        const firstTeacherId = Object.keys(teacherDirectory)[0] || 'suripong.ler';
        adminImpersonateUser('teacher', firstTeacherId);
      } else {
        const firstStudentId = Object.keys(studentDirectory)[0] || '67080200501';
        adminImpersonateUser('student', firstStudentId);
      }
    }

    function resetAdminDirectoryToDefaults() {
      if (!confirm('Reset all Student and Teacher accounts back to default factory roster (81 Students & 3 Teachers)?')) return;
      localStorage.removeItem('atht_admin_students');
      localStorage.removeItem('atht_admin_teachers');

      Object.keys(studentDirectory).forEach(k => delete studentDirectory[k]);
      Object.assign(studentDirectory, JSON.parse(JSON.stringify(defaultStudentDirectorySnapshot)));

      Object.keys(teacherDirectory).forEach(k => delete teacherDirectory[k]);
      Object.assign(teacherDirectory, JSON.parse(JSON.stringify(defaultTeacherDirectorySnapshot)));

      loadAdminPersistedDirectories();
      addAdminAuditLog('Directory Reset', 'Restored default 81 Students and 3 Faculty Instructors.', 'RESET');
      renderAdminScreen();
      updateBreadcrumbUI('admin');
      alertMessage('Directory restored to default 81 Students & 3 Teachers.');
    }

    function exportAdminUsersCSV() {
      const rows = [['Role', 'ID_Code', 'Full_Name', 'Short_Name', 'Email', 'Department_Courses', 'Status']];
      Object.values(studentDirectory).forEach(s => {
        rows.push(['Student', s.id, `"${s.fullName}"`, `"${s.shortName}"`, s.email, `"${s.major || 'CSM'}"`, s.status || 'Active']);
      });
      Object.values(teacherDirectory).forEach(t => {
        rows.push(['Teacher', t.facultyCode || t.id, `"${t.fullName}"`, `"${t.shortName}"`, t.email, `"${(t.courses || []).join(';')}"`, t.status || 'Active']);
      });
      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ATHT_KMUTT_Users_Directory_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addAdminAuditLog('Exported CSV', `Exported ${rows.length - 1} user records to CSV.`, 'EXPORT');
      alertMessage('Exported User Directory CSV!');
    }


    function debounceFn(fn, delay = 150) {
      let timer = null;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    }

    const debouncedFilterProjectsList = debounceFn(() => {
      if (typeof filterProjectsList === 'function') filterProjectsList();
    }, 150);
    const debouncedRenderTeacherQuickSub = debounceFn(() => {
      if (typeof renderTeacherQuickSubmissionResults === 'function') renderTeacherQuickSubmissionResults();
    }, 150);
    const debouncedRenderTeacherCourseMembers = debounceFn(() => {
      if (typeof renderTeacherCourseMembersPanel === 'function') renderTeacherCourseMembersPanel();
    }, 150);
    const debouncedFilterTeacherStudentTable = debounceFn(() => {
      if (typeof filterTeacherStudentTable === 'function') filterTeacherStudentTable();
    }, 150);
    const debouncedRenderAdminUsersTable = debounceFn(() => {
      if (typeof renderAdminUsersTable === 'function') renderAdminUsersTable();
    }, 150);

    function closeAllOpenModals() {
      const ids = [
        'modalMemberEdit', 'modalAddTask', 'modalStudentAddTask', 'modalStudentEditTask',
        'createProjectModal', 'modalTeacherAddTask', 'modalStepComment', 'modalUserProfile',
        'modalLogout', 'modalProjectStep', 'modalSubmitStepProgress', 'modalTeacherStepInspect',
        'modalMobileCalendar', 'modalAdminUserForm', 'modalAdminDeleteConfirm'
      ];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.classList.contains('hidden')) el.classList.add('hidden');
      });
    }

    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      document.addEventListener('keydown', (e) => {
        if (e && e.key === 'Escape') closeAllOpenModals();
      });
    }
