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
              if (teacherDirectory[tid] && !teacherDirectory[tid]._adminEdited && (!Array.isArray(teacherDirectory[tid].courses) || teacherDirectory[tid].courses.length < 2)) {
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
        if (typeof translateDOM === 'function') translateDOM(currentLanguage);
        return;
      }
      container.innerHTML = logs.map(item => `
        <div class="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/70">
          <div class="flex items-start gap-2.5 min-w-0">
            <span class="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-neutral-900 text-white dark:bg-neutral-700 shrink-0 mt-0.5">${escapeHtml(item.badge || 'LOG')}</span>
            <div class="min-w-0">
              <span class="font-bold text-neutral-900 dark:text-white block text-xs">${escapeHtml(item.action)}</span>
              <span class="text-[11px] text-neutral-500 dark:text-neutral-400 block leading-snug break-words">${escapeHtml(item.detail)}</span>
            </div>
          </div>
          <span class="text-[10px] font-mono text-neutral-400 shrink-0">${escapeHtml(item.time)}</span>
        </div>
      `).join('');
      if (typeof translateDOM === 'function') translateDOM(currentLanguage);
    }

    function switchAdminTab(tab) {
      activeAdminTab = tab;

      const btnStudents = document.getElementById('adminTabBtnStudents');
      const btnTeachers = document.getElementById('adminTabBtnTeachers');
      const btnAll = document.getElementById('adminTabBtnAll');

      const activeClass = 'px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-extrabold transition pressable bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 min-w-0 text-center';
      const inactiveClass = 'px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition pressable text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 min-w-0 text-center';

      if (btnStudents) btnStudents.className = tab === 'students' ? activeClass : inactiveClass;
      if (btnTeachers) btnTeachers.className = tab === 'teachers' ? activeClass : inactiveClass;
      if (btnAll) btnAll.className = tab === 'all' ? activeClass : inactiveClass;

      const activeBadgeClass = 'sm:order-last px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 dark:bg-neutral-900/15 text-white dark:text-neutral-900 shrink-0';
      const inactiveBadgeClass = 'sm:order-last px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 shrink-0';
      const bStd = document.getElementById('adminTabBadgeStudents');
      const bTch = document.getElementById('adminTabBadgeTeachers');
      const bAll = document.getElementById('adminTabBadgeAll');
      if (bStd) bStd.className = tab === 'students' ? activeBadgeClass : inactiveBadgeClass;
      if (bTch) bTch.className = tab === 'teachers' ? activeBadgeClass : inactiveBadgeClass;
      if (bAll) bAll.className = tab === 'all' ? activeBadgeClass : inactiveBadgeClass;

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
      if (typeof ensureRelationalIntegrity === 'function') ensureRelationalIntegrity();
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

      const courseKeys = Object.keys(coursesCatalog || {});
      const totalProjCount = Array.isArray(studentProjectsList) ? studentProjectsList.length : 0;
      const totalTaskCount = Object.values(coursesCatalog || {}).reduce((acc, c) => acc + ((c && Array.isArray(c.tasks)) ? c.tasks.length : 0), 0);
      const syncStatsEl = document.getElementById('adminLiveSyncStats');
      if (syncStatsEl) {
        const isTh = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
        syncStatsEl.innerText = isTh
          ? `${courseKeys.length} วิชา • ${totalProjCount} โปรเจกต์ • ${totalTaskCount} งาน`
          : `${courseKeys.length} Courses • ${totalProjCount} Projects • ${totalTaskCount} Tasks`;
      }

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
      if (kpiCrs) kpiCrs.innerText = courseKeys.length;
      const kpiCrsList = document.getElementById('adminKpiCoursesList');
      if (kpiCrsList) {
        kpiCrsList.innerText = courseKeys.join(' • ');
        kpiCrsList.title = courseKeys.join(' • ');
      }

      const badgeStd = document.getElementById('adminTabBadgeStudents');
      if (badgeStd) badgeStd.innerText = studentsList.length;
      const badgeTch = document.getElementById('adminTabBadgeTeachers');
      if (badgeTch) badgeTch.innerText = teachersList.length;
      const badgeAll = document.getElementById('adminTabBadgeAll');
      if (badgeAll) badgeAll.innerText = totalUsers;

      syncDynamicCourseSelectors();
      renderAdminUsersTable();
      renderAdminCoursesManager();
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
            courses: Object.keys(coursesCatalog || {}),
            status: s.status || 'Active',
            raw: s
          });
        });
      }

      if (activeAdminTab === 'teachers' || activeAdminTab === 'all') {
        Object.values(teacherDirectory).forEach(t => {
          const coursesArr = Array.isArray(t.courses) ? t.courses.filter(c => Boolean(coursesCatalog[c])) : ['CMM321'];
          combined.push({
            role: 'teacher',
            id: t.id,
            codeDisplay: t.facultyCode || 'FAC-CMM',
            fullName: t.fullName,
            shortName: t.shortName,
            initials: t.initials || 'TR',
            email: t.email,
            deptOrCourses: coursesArr.length > 0 ? coursesArr.join(', ') : 'No Assigned Courses',
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
        if (typeof translateDOM === 'function') translateDOM(currentLanguage);
        return;
      }

      combined.forEach(u => {
        const isTeacher = u.role === 'teacher';
        const isActive = u.status === 'Active';

        const row = document.createElement('div');
        row.className = 'p-3.5 md:py-3 md:px-4 bg-neutral-50/60 md:bg-transparent dark:bg-neutral-800/35 md:dark:bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/60 border border-neutral-200/80 md:border-0 rounded-2xl md:rounded-xl transition grid grid-cols-1 md:grid-cols-12 gap-2.5 md:gap-3 items-center text-xs';

        const roleBadgeHtml = isTeacher
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200 dark:border-orange-800 whitespace-nowrap shrink-0">👨‍🏫 Teacher</span>`
          : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 whitespace-nowrap shrink-0"><img src="student-icon.png" alt="Student" class="w-3.5 h-3.5 object-contain" /><span>Student</span></span>`;

        const statusPillHtml = isActive
          ? `<button onclick="toggleAdminUserStatus('${u.role}', '${escapeHtml(u.id)}')" title="Click to toggle Active/Suspended" class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:opacity-80 transition cursor-pointer whitespace-nowrap">● Active</button>`
          : `<button onclick="toggleAdminUserStatus('${u.role}', '${escapeHtml(u.id)}')" title="Click to activate account" class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:opacity-80 transition cursor-pointer whitespace-nowrap">○ Suspended</button>`;

        row.innerHTML = `

          <div class="md:col-span-2 flex items-center justify-between md:justify-start gap-2">
            <span class="font-mono font-bold text-neutral-900 dark:text-white bg-white md:bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-200/80 dark:border-neutral-700 text-[11px] whitespace-nowrap">
              ${escapeHtml(u.codeDisplay)}
            </span>
            <span class="md:hidden shrink-0">${statusPillHtml}</span>
          </div>

          <div class="md:col-span-3 flex items-center gap-2.5 min-w-0">
            <div class="w-9 h-9 md:w-8 md:h-8 rounded-xl ${isTeacher ? 'bg-orange-600 text-white' : 'bg-neutral-900 dark:bg-neutral-700 text-white'} flex items-center justify-center text-[11px] font-extrabold shrink-0 shadow-2xs">
              ${escapeHtml(u.initials)}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-bold text-neutral-900 dark:text-white truncate block">${escapeHtml(u.fullName)}</span>
              </div>
              <div class="flex items-center gap-1.5 mt-1 flex-wrap">
                ${roleBadgeHtml}
                <span class="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">${escapeHtml(u.subMeta)}</span>
              </div>
            </div>
          </div>

          <div class="md:col-span-3 min-w-0 pt-1.5 md:pt-0 border-t md:border-t-0 border-neutral-200/60 dark:border-neutral-700/60">
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

          <div class="md:col-span-1 flex items-center justify-between md:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-200/70 dark:border-neutral-800">
            <button onclick="adminImpersonateUser('${u.role}', '${escapeHtml(u.id)}')" title="Preview Portal as ${escapeHtml(u.shortName)}" class="flex-1 md:flex-initial py-2 md:py-1.5 px-3 md:px-2.5 rounded-xl md:rounded-lg bg-white md:bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200 md:border-0 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-[11px] md:text-[10px] transition pressable whitespace-nowrap text-center">
              View As
            </button>
            <div class="flex items-center gap-1.5 shrink-0">
              <button onclick="openAdminUserModal('edit', '${u.role}', '${escapeHtml(u.id)}')" title="Edit User" class="w-8 h-8 md:w-auto md:h-auto md:p-1.5 rounded-xl md:rounded-lg bg-neutral-900 hover:bg-black text-white text-xs transition pressable flex items-center justify-center">
                ✏️
              </button>
              <button onclick="openAdminDeleteModal('${u.role}', '${escapeHtml(u.id)}', '${escapeHtml(u.fullName)}')" title="Remove User" class="w-8 h-8 md:w-auto md:h-auto md:p-1.5 rounded-xl md:rounded-lg bg-white md:bg-transparent dark:bg-neutral-800 md:dark:bg-transparent border border-neutral-200 md:border-0 dark:border-neutral-700 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs transition pressable flex items-center justify-center">
                🗑️
              </button>
            </div>
          </div>
        `;

        tbody.appendChild(row);
      });
      if (typeof translateDOM === 'function') translateDOM(currentLanguage);
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
      if (typeof translateDOM === 'function') translateDOM(currentLanguage);
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

    function renderAdminUserCourseCheckboxes(selectedList = ['CMM321']) {
      const box = document.getElementById('adminFormCourseCheckboxes');
      if (!box) return;
      const selectedSet = new Set(Array.isArray(selectedList) ? selectedList : []);
      box.innerHTML = Object.values(coursesCatalog || {}).map(c => {
        const checked = selectedSet.has(c.code) ? 'checked' : '';
        return `
          <label class="inline-flex items-center gap-1.5 cursor-pointer font-semibold">
            <input type="checkbox" class="admin-course-checkbox rounded text-neutral-900" value="${escapeHtml(c.code)}" ${checked} />
            <span>${escapeHtml(c.code)} (${escapeHtml(c.title)})</span>
          </label>
        `;
      }).join('');
    }

    function openAdminUserModal(mode, role, userId) {
      const modal = document.getElementById('modalAdminUserForm');
      if (!modal) return;

      document.getElementById('adminFormMode').value = mode;
      const targetRole = role || (activeAdminTab === 'teachers' ? 'teacher' : 'student');
      const roleSelectorGroup = document.getElementById('adminFormRoleSelectorGroup');
      if (roleSelectorGroup) roleSelectorGroup.classList.toggle('hidden', mode === 'edit');
      setAdminModalRoleType(targetRole);
      renderAdminUserCourseCheckboxes(targetRole === 'teacher' ? [] : ['CMM321']);

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

          const coursesArr = Array.isArray(t.courses) ? t.courses : [];
          renderAdminUserCourseCheckboxes(coursesArr);
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
      if (typeof translateDOM === 'function') translateDOM(currentLanguage);
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
        const courses = mode === 'edit' ? checkedCourses : (checkedCourses.length > 0 ? checkedCourses : []);

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
          status,
          _adminEdited: true
        };

        Object.values(coursesCatalog || {}).forEach(c => {
          if (c) c._adminManagedTeachers = true;
        });
        syncCourseTeachersFromDirectory();
        localStorage.setItem('atht_admin_courses_synced', 'true');
        if (typeof saveCoursesCatalog === 'function') saveCoursesCatalog();

        addAdminAuditLog(
          mode === 'edit' ? 'Updated Teacher Account' : 'Created Teacher Account',
          `${fullName} (${rawId}) • Courses: ${courses.length > 0 ? courses.join(', ') : 'None'}`,
          'TEACHER'
        );
      } else {
        const major = (document.getElementById('adminFormMajorInput').value || 'Applied Computer Science - Multimedia').trim();
        const year = document.getElementById('adminFormYearInput').value || 'Year 2 (ID 67)';

        if (mode === 'edit' && origId && origId !== rawId) {
          delete studentDirectory[origId];
          (studentProjectsList || []).forEach(p => {
            if (p.createdBy === origId) p.createdBy = rawId;
            if (Array.isArray(p.members)) {
              p.members = p.members.map(m => String(m || '').includes(origId) ? `${rawId} ${shortName}` : m);
            }
          });
          Object.values(coursesCatalog || {}).forEach(c => {
            (c.tasks || []).forEach(t => {
              if (t.createdBy === origId) t.createdBy = rawId;
              (t.members || []).forEach(m => {
                if (m && m.id === origId) {
                  m.id = rawId;
                  m.name = shortName;
                }
              });
              if (t.studentSubmissions && t.studentSubmissions[origId]) {
                t.studentSubmissions[rawId] = t.studentSubmissions[origId];
                delete t.studentSubmissions[origId];
              }
            });
          });
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
      if (typeof syncAllATHTData === 'function') syncAllATHTData();
      if (typeof populateLoginDemoDropdowns === 'function') populateLoginDemoDropdowns();
      if (typeof renderCalendar === 'function') renderCalendar();
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
      if (typeof syncAllATHTData === 'function') syncAllATHTData();
      renderAdminScreen();
    }

    function openAdminDeleteModal(role, id, name) {
      pendingAdminDeleteUser = { role, id, name };
      const textEl = document.getElementById('adminDeleteConfirmText');
      if (textEl) {
        const isThai = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
        if (role === 'course') {
          textEl.innerText = isThai
            ? `คุณแน่ใจหรือไม่ว่าต้องการลบรายวิชา "${id} - ${name}" ออกจากระบบ (อาจารย์และนักศึกษาจะไม่เห็นวิชานี้)?`
            : `Are you sure you want to remove course "${id} - ${name}"? It will be removed from Teacher and Student views.`;
        } else {
          const roleTh = role === 'teacher' ? 'อาจารย์' : 'นักศึกษา';
          textEl.innerText = isThai
            ? `คุณแน่ใจหรือไม่ว่าต้องการลบ${roleTh} "${name}" (${id}) ออกจากระบบ มจธ.?`
            : `Are you sure you want to remove ${role.toUpperCase()} "${name}" (${id}) from the portal directory?`;
        }
      }
      const modal = document.getElementById('modalAdminDeleteConfirm');
      if (modal) modal.classList.remove('hidden');
      if (typeof translateDOM === 'function') translateDOM(currentLanguage);
    }

    function closeAdminDeleteModal() {
      pendingAdminDeleteUser = null;
      const modal = document.getElementById('modalAdminDeleteConfirm');
      if (modal) modal.classList.add('hidden');
    }

    function confirmAdminDeleteUser() {
      if (!pendingAdminDeleteUser) return;
      const { role, id, name } = pendingAdminDeleteUser;

      if (role === 'course') {
        delete coursesCatalog[id];
        Object.values(teacherDirectory || {}).forEach(t => {
          if (t && Array.isArray(t.courses) && t.courses.includes(id)) {
            t.courses = t.courses.filter(c => c !== id);
            t._adminEdited = true;
          }
        });
        localStorage.setItem('atht_admin_courses_synced', 'true');
        if (typeof saveCoursesCatalog === 'function') saveCoursesCatalog();
        addAdminAuditLog('Removed Course', `Deleted course ${id} (${name})`, 'COURSE');
      } else if (role === 'teacher') {
        delete teacherDirectory[id];
        syncCourseTeachersFromDirectory();
        if (typeof saveCoursesCatalog === 'function') saveCoursesCatalog();
        addAdminAuditLog('Removed Teacher', `Deleted instructor ${name} (${id})`, 'DELETE');
      } else {
        delete studentDirectory[id];
        addAdminAuditLog('Removed Student', `Deleted student ${name} (${id})`, 'DELETE');
      }

      saveAdminPersistedDirectories();
      if (typeof syncAllATHTData === 'function') syncAllATHTData();
      if (typeof populateLoginDemoDropdowns === 'function') populateLoginDemoDropdowns();
      if (typeof renderCalendar === 'function') renderCalendar();
      closeAdminDeleteModal();
      renderAdminScreen();
      updateBreadcrumbUI('admin');
      alertMessage(`Removed ${name} cleanly.`);
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
      if (!confirm('Reset all Student, Teacher, and Course records back to default factory data (81 Students, 3 Teachers, 6 Courses)?')) return;
      localStorage.removeItem('atht_admin_students');
      localStorage.removeItem('atht_admin_teachers');
      localStorage.removeItem('atht_admin_courses_synced');

      if (typeof defaultCoursesCatalogSnapshot !== 'undefined') {
        Object.keys(coursesCatalog).forEach(k => delete coursesCatalog[k]);
        Object.assign(coursesCatalog, JSON.parse(JSON.stringify(defaultCoursesCatalogSnapshot)));
      }

      Object.keys(studentDirectory).forEach(k => delete studentDirectory[k]);
      Object.assign(studentDirectory, JSON.parse(JSON.stringify(defaultStudentDirectorySnapshot)));

      Object.keys(teacherDirectory).forEach(k => delete teacherDirectory[k]);
      Object.assign(teacherDirectory, JSON.parse(JSON.stringify(defaultTeacherDirectorySnapshot)));

      loadAdminPersistedDirectories();
      if (typeof syncAllATHTData === 'function') syncAllATHTData();
      if (typeof populateLoginDemoDropdowns === 'function') populateLoginDemoDropdowns();
      if (typeof renderCalendar === 'function') renderCalendar();
      addAdminAuditLog('Directory Reset', 'Restored default 81 Students, 3 Faculty Instructors, and 6 Courses.', 'RESET');
      renderAdminScreen();
      updateBreadcrumbUI('admin');
      alertMessage('Directory & Courses restored to defaults.');
    }

    function scrollToAdminCoursesPanel() {
      const panel = document.getElementById('adminCourseManagerSection');
      if (panel && typeof panel.scrollIntoView === 'function') {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    function syncCourseTeachersFromDirectory() {
      const teachersList = Object.values(teacherDirectory || {});
      Object.entries(coursesCatalog || {}).forEach(([cCode, course]) => {
        if (!course) return;
        const assigned = teachersList.filter(t => t && Array.isArray(t.courses) && t.courses.includes(cCode));
        course.assignedTeacherIds = assigned.map(t => t.id);
        if (assigned.length > 0) {
          course.teacher = assigned
            .map(t => String(t.fullName || t.shortName || '').replace(/^(Prof\.|Assoc\.\s*Prof\.|Asst\.\s*Prof\.|Dr\.)\s*/i, '').trim())
            .filter(Boolean)
            .join(', ');
        } else {
          course.teacher = 'TBA';
        }
      });
    }

    function syncDynamicCourseSelectors() {
      const allCodes = Object.keys(coursesCatalog || {});
      const adminFilterSel = document.getElementById('adminCourseFilterSelect');
      if (adminFilterSel) {
        const prev = adminFilterSel.value || 'ALL';
        const isTh = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
        adminFilterSel.innerHTML = `<option value="ALL">${isTh ? 'ทุกรายวิชา' : 'All Courses'}</option>` +
          allCodes.map(code => {
            const c = coursesCatalog[code];
            return `<option value="${escapeHtml(code)}">${escapeHtml(code)} ${escapeHtml(c ? c.title : '')}</option>`;
          }).join('');
        adminFilterSel.value = allCodes.includes(prev) ? prev : 'ALL';
      }

      if (typeof renderProjectsFilterPills === 'function') {
        renderProjectsFilterPills();
      }
      if (typeof populateLoginDemoDropdowns === 'function') {
        populateLoginDemoDropdowns();
      }
    }

    function renderAdminCoursesManager() {
      const grid = document.getElementById('adminCoursesGrid');
      if (!grid) return;
      const isTh = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
      const titleEl = document.getElementById('adminCoursesPanelTitle');
      const descEl = document.getElementById('adminCoursesPanelDesc');
      const addLabelEl = document.getElementById('adminAddCourseBtnLabel');
      if (titleEl) titleEl.innerText = isTh ? 'จัดการรายวิชาและสิทธิ์อาจารย์ผู้สอน' : 'Course Management & Instructor Access';
      if (descEl) {
        descEl.innerText = isTh
          ? 'เพิ่ม แก้ไข หรือลบรายวิชา พร้อมกำหนดว่าอาจารย์ท่านใดเห็นรายวิชานี้ได้ และซิงค์กับอาจารย์-นักศึกษาทันที'
          : 'Create courses, assign which instructors can view/manage each subject, and sync immediately with teachers & students.';
      }
      if (addLabelEl) addLabelEl.innerText = isTh ? 'เพิ่มรายวิชา' : 'Add Course';

      const query = (document.getElementById('adminCourseSearchInput')?.value || '').toLowerCase().trim();
      const teachersList = Object.values(teacherDirectory || {});
      const courses = Object.values(coursesCatalog || {}).filter(c => {
        if (!c) return false;
        if (!query) return true;
        return (c.code || '').toLowerCase().includes(query) ||
          (c.title || '').toLowerCase().includes(query) ||
          (c.teacher || '').toLowerCase().includes(query);
      });

      if (courses.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-10 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">${isTh ? 'ไม่พบรายวิชาที่ค้นหา' : 'No courses match your search.'}</div>`;
        return;
      }

      grid.innerHTML = courses.map(c => {
        const assignedTeachers = teachersList.filter(t => Array.isArray(t.courses) && t.courses.includes(c.code));
        const projCount = (typeof studentProjectsList !== 'undefined' && Array.isArray(studentProjectsList))
          ? studentProjectsList.filter(p => p && p.course === c.code).length
          : 0;
        const taskCount = Array.isArray(c.tasks) ? c.tasks.length : 0;
        const isHiddenStu = c.studentVisibility === 'hidden';
        const stuBadge = isHiddenStu
          ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">${isTh ? 'ซ่อนจากนักศึกษา' : 'Hidden from Students'}</span>`
          : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">${isTh ? 'ซิงค์นักศึกษาทุกคน' : 'Synced: All Students'}</span>`;

        const teachersHtml = assignedTeachers.length > 0
          ? assignedTeachers.map(t => `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 border border-blue-200/70 dark:border-blue-800/50">👨‍🏫 ${escapeHtml(t.shortName || t.fullName)}</span>`).join(' ')
          : `<span class="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">${isTh ? 'ยังไม่ได้กำหนดอาจารย์' : 'No Instructor Assigned'}</span>`;

        const safeCodeAttr = escapeHtml(c.code).replace(/'/g, "\\'");
        const safeTitleAttr = escapeHtml(c.title || c.code).replace(/'/g, "\\'");

        return `
          <div class="p-4 rounded-2xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/80 flex flex-col justify-between gap-3">
            <div class="space-y-2">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <span class="text-xs font-black tracking-wide block" style="color: var(--gz-primary)">${escapeHtml(c.code)}</span>
                  <h4 class="text-sm font-bold text-neutral-900 dark:text-white leading-snug">${escapeHtml(c.title)}</h4>
                </div>
                ${stuBadge}
              </div>
              <p class="text-[11px] text-neutral-500 dark:text-neutral-400">${escapeHtml(typeof formatBilingualSchedule === 'function' ? formatBilingualSchedule(c.schedule || '', currentLanguage) : (c.schedule || ''))}</p>
              <div class="flex flex-wrap gap-1.5 pt-0.5">${teachersHtml}</div>
            </div>

            <div class="pt-2.5 border-t border-neutral-200/70 dark:border-neutral-700/60 flex items-center justify-between gap-2 text-[11px]">
              <span class="text-neutral-400 font-mono">${projCount} ${isTh ? 'โปรเจกต์' : 'Proj'} • ${taskCount} ${isTh ? 'งาน' : 'Tasks'}</span>
              <div class="flex items-center gap-1.5">
                <button type="button" onclick="openAdminCourseModal('edit', '${safeCodeAttr}')" class="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 font-bold transition">
                  ${isTh ? 'แก้ไข / กำหนดสิทธิ์' : 'Edit / Assign'}
                </button>
                <button type="button" onclick="openAdminDeleteCourseModal('${safeCodeAttr}', '${safeTitleAttr}')" class="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold transition" title="Remove Course">
                  🗑
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function openAdminCourseModal(mode = 'create', courseCode = '') {
      const modal = document.getElementById('modalAdminCourseForm');
      if (!modal) return;
      const isTh = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';

      document.getElementById('adminCourseFormMode').value = mode;
      document.getElementById('adminCourseOrigCode').value = mode === 'edit' ? courseCode : '';

      const titleEl = document.getElementById('adminCourseModalTitle');
      const submitBtn = document.getElementById('adminCourseFormSubmitBtn');
      const codeInput = document.getElementById('adminCourseCodeInput');
      const schedInput = document.getElementById('adminCourseScheduleInput');
      const nameInput = document.getElementById('adminCourseTitleInput');
      const visSelect = document.getElementById('adminCourseStudentVisibilitySelect');

      const course = mode === 'edit' ? coursesCatalog[courseCode] : null;
      if (mode === 'edit' && course) {
        if (titleEl) titleEl.innerText = isTh ? `แก้ไขรายวิชา: ${course.code}` : `Edit Course: ${course.code}`;
        if (submitBtn) submitBtn.innerText = isTh ? 'บันทึกรายวิชา' : 'Save Course Changes';
        if (codeInput) codeInput.value = course.code;
        if (nameInput) nameInput.value = course.title || '';
        if (schedInput) schedInput.value = course.schedule || 'Wednesday (13:30 - 16:30)';
        if (visSelect) visSelect.value = course.studentVisibility || 'all';
      } else {
        if (titleEl) titleEl.innerText = isTh ? 'เพิ่มรายวิชาใหม่' : 'Add New Course';
        if (submitBtn) submitBtn.innerText = isTh ? 'สร้างและซิงค์รายวิชา' : 'Create & Sync Course';
        if (codeInput) codeInput.value = '';
        if (nameInput) nameInput.value = '';
        if (schedInput) schedInput.value = 'Wednesday (13:30 - 16:30)';
        if (visSelect) visSelect.value = 'all';
      }

      const teachersBox = document.getElementById('adminCourseTeachersCheckboxes');
      if (teachersBox) {
        const teachers = Object.values(teacherDirectory || {});
        if (teachers.length === 0) {
          teachersBox.innerHTML = `<p class="text-[11px] text-neutral-400 italic">${isTh ? 'ไม่พบบัญชีอาจารย์ในระบบ' : 'No teacher accounts found.'}</p>`;
        } else {
          teachersBox.innerHTML = teachers.map(t => {
            const isAssigned = course
              ? (Array.isArray(t.courses) && t.courses.includes(course.code))
              : false;
            return `
              <label class="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-700/80 cursor-pointer hover:border-blue-400 transition">
                <span class="flex items-center gap-2 min-w-0">
                  <input type="checkbox" class="admin-course-teacher-cb rounded text-blue-600" value="${escapeHtml(t.id)}" ${isAssigned ? 'checked' : ''} />
                  <span class="font-bold text-neutral-900 dark:text-white truncate">${escapeHtml(t.fullName)}</span>
                </span>
                <span class="text-[10px] font-mono text-neutral-400 shrink-0">${escapeHtml(t.facultyCode || t.id)}</span>
              </label>
            `;
          }).join('');
        }
      }

      modal.classList.remove('hidden');
    }

    function closeAdminCourseModal() {
      const modal = document.getElementById('modalAdminCourseForm');
      if (modal) modal.classList.add('hidden');
    }

    function toggleAdminCourseAllTeachers(checkAll) {
      document.querySelectorAll('.admin-course-teacher-cb').forEach(cb => {
        cb.checked = !!checkAll;
      });
    }

    function openAdminDeleteCourseModal(courseCode, courseTitle) {
      if (Object.keys(coursesCatalog || {}).length <= 1) {
        alertMessage(currentLanguage === 'th' ? 'ไม่สามารถลบรายวิชาสุดท้ายของระบบได้' : 'Cannot delete the last remaining course.');
        return;
      }
      openAdminDeleteModal('course', courseCode, courseTitle);
    }

    function handleSaveAdminCourse(e, overrideTeacherIds = null) {
      if (e && e.preventDefault) e.preventDefault();
      const mode = document.getElementById('adminCourseFormMode').value;
      const origCode = (document.getElementById('adminCourseOrigCode').value || '').trim().toUpperCase();
      const rawCode = (document.getElementById('adminCourseCodeInput').value || '').trim().toUpperCase().replace(/\s+/g, '');
      const title = (document.getElementById('adminCourseTitleInput').value || '').trim();
      const schedule = (document.getElementById('adminCourseScheduleInput').value || '').trim() || 'Wednesday (13:30 - 16:30)';
      const studentVisibility = document.getElementById('adminCourseStudentVisibilitySelect').value || 'all';

      if (!rawCode || !title) {
        alertMessage(currentLanguage === 'th' ? 'กรุณากรอกรหัสวิชาและชื่อรายวิชาให้ครบ' : 'Please fill in Course Code and Course Title.');
        return;
      }
      if (mode === 'create' && coursesCatalog[rawCode]) {
        alertMessage(currentLanguage === 'th' ? `มีรายวิชา ${rawCode} อยู่ในระบบแล้ว` : `Course code "${rawCode}" already exists.`);
        return;
      }
      if (mode === 'edit' && origCode && origCode !== rawCode && coursesCatalog[rawCode]) {
        alertMessage(currentLanguage === 'th' ? `มีรายวิชา ${rawCode} อยู่ในระบบแล้ว` : `Course code "${rawCode}" already exists.`);
        return;
      }

      const selectedTeacherIds = Array.isArray(overrideTeacherIds)
        ? overrideTeacherIds
        : Array.from(document.querySelectorAll('.admin-course-teacher-cb:checked')).map(cb => cb.value);

      if (mode === 'edit' && origCode && origCode !== rawCode && coursesCatalog[origCode]) {
        const oldCourse = coursesCatalog[origCode];
        delete coursesCatalog[origCode];
        coursesCatalog[rawCode] = { ...oldCourse, code: rawCode };
        (studentProjectsList || []).forEach(p => {
          if (p && p.course === origCode) p.course = rawCode;
        });
        Object.values(teacherDirectory || {}).forEach(t => {
          if (t && Array.isArray(t.courses) && t.courses.includes(origCode)) {
            t.courses = t.courses.map(c => c === origCode ? rawCode : c);
          }
        });
      }

      const existing = coursesCatalog[rawCode] || {};
      coursesCatalog[rawCode] = {
        ...existing,
        code: rawCode,
        title,
        schedule,
        progress: typeof existing.progress === 'number' ? existing.progress : 0,
        tasks: Array.isArray(existing.tasks) ? existing.tasks : [],
        isAdminCreated: existing.isAdminCreated !== undefined ? existing.isAdminCreated : (mode === 'create'),
        _adminManagedTeachers: true,
        studentVisibility
      };

      Object.values(teacherDirectory || {}).forEach(t => {
        if (!t) return;
        if (!Array.isArray(t.courses)) t.courses = [];
        const hasCourse = t.courses.includes(rawCode);
        const shouldHave = selectedTeacherIds.includes(t.id);
        if (shouldHave && !hasCourse) {
          t.courses.push(rawCode);
          t._adminEdited = true;
        } else if (!shouldHave && hasCourse) {
          t.courses = t.courses.filter(c => c !== rawCode);
          t._adminEdited = true;
        }
      });

      syncCourseTeachersFromDirectory();
      localStorage.setItem('atht_admin_courses_synced', 'true');
      saveAdminPersistedDirectories();
      if (typeof saveCoursesCatalog === 'function') saveCoursesCatalog();
      if (typeof syncAllATHTData === 'function') syncAllATHTData();
      if (typeof renderCalendar === 'function') renderCalendar();

      const teacherNamesLog = selectedTeacherIds.length > 0
        ? selectedTeacherIds.map(id => teacherDirectory[id]?.shortName || id).join(', ')
        : 'None';
      addAdminAuditLog(
        mode === 'edit' ? 'Updated Course' : 'Created Course',
        `${rawCode} - ${title} • Instructors: ${teacherNamesLog} • Students: ${studentVisibility}`,
        'COURSE'
      );

      closeAdminCourseModal();
      renderAdminScreen();
      if (typeof currentScreen !== 'undefined' && currentScreen === 'courses' && typeof renderCoursesCatalog === 'function') {
        renderCoursesCatalog();
      }
      updateBreadcrumbUI(typeof currentScreen !== 'undefined' ? currentScreen : 'admin');
      alertMessage(currentLanguage === 'th'
        ? `บันทึกรายวิชา ${rawCode} และซิงค์กับอาจารย์/นักศึกษาเรียบร้อย`
        : `Course "${rawCode}" saved and synced cleanly!`);
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
        'modalMobileCalendar', 'modalAdminUserForm', 'modalAdminDeleteConfirm', 'modalAdminCourseForm'
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

    /* === ATHT_OPTIONAL_WEB_ANIMATIONS_JS_START === */
    (function initATHTInteractiveMotion() {
      if (typeof window === 'undefined' || typeof document === 'undefined' || typeof document.addEventListener !== 'function') return;

      const cardSelectors = [
        '#dashboardCourseCards > div',
        '#teacherCourseCards > div',
        '#allCoursesListContainer > div',
        '#globalTasksListContainer > div',
        '#detailTasksScrollContainer > div',
        '#projectsCardsContainer > div',
        '#teacherAssessmentTasksContainer > div',
        '#notificationsContainer > div',
        '#adminKpiGrid > div'
      ].join(',');

      let activeTiltCard = null;
      let lastSparkTime = 0;
      let lastSparkX = -999;
      let lastSparkY = -999;
      let activeSparkCount = 0;
      let sparkCounter = 0;

      const resetTiltCard = (card) => {
        if (!card) return;
        card.style.removeProperty('--atht-rx');
        card.style.removeProperty('--atht-ry');
        card.style.removeProperty('--atht-mx');
        card.style.removeProperty('--atht-my');
      };

      const handlePointer = (e) => {
        if (!e || typeof e.clientX !== 'number') return;
        if (e.pointerType === 'touch') return;

        // 1) Interactive 3D tilt + spotlight on hovered card
        const target = e.target && typeof e.target.closest === 'function' ? e.target.closest(cardSelectors) : null;
        if (activeTiltCard && activeTiltCard !== target) {
          resetTiltCard(activeTiltCard);
          activeTiltCard = null;
        }
        if (target && typeof target.getBoundingClientRect === 'function') {
          if (!target.classList.contains('atht-tilt-card')) target.classList.add('atht-tilt-card');
          activeTiltCard = target;
          const rect = target.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            const rx = ((0.5 - py) * 12).toFixed(2) + 'deg';
            const ry = ((px - 0.5) * 12).toFixed(2) + 'deg';
            target.style.setProperty('--atht-rx', rx);
            target.style.setProperty('--atht-ry', ry);
            target.style.setProperty('--atht-mx', `${Math.round(px * 100)}%`);
            target.style.setProperty('--atht-my', `${Math.round(py * 100)}%`);
          }
        }

        // 2) Throttled cursor sparkle trail
        const now = Date.now();
        const dist = Math.hypot(e.clientX - lastSparkX, e.clientY - lastSparkY);
        if (now - lastSparkTime >= 24 && dist >= 8 && activeSparkCount < 16 && document.body) {
          lastSparkTime = now;
          lastSparkX = e.clientX;
          lastSparkY = e.clientY;
          activeSparkCount++;
          sparkCounter++;
          const spark = document.createElement('span');
          const isStar = sparkCounter % 2 === 0;
          spark.className = isStar ? 'atht-cursor-spark atht-cursor-spark--star' : 'atht-cursor-spark';
          if (isStar) spark.textContent = '✦';
          const driftX = (((sparkCounter * 7) % 21) - 10) + 'px';
          spark.style.setProperty('--atht-sx', driftX);
          spark.style.left = `${e.clientX}px`;
          spark.style.top = `${e.clientY}px`;
          document.body.appendChild(spark);
          const cleanup = () => {
            if (spark.parentNode) spark.parentNode.removeChild(spark);
            activeSparkCount = Math.max(0, activeSparkCount - 1);
          };
          spark.addEventListener('animationend', cleanup, { once: true });
          setTimeout(cleanup, 780);
        }
      };

      const moveEvent = typeof window.PointerEvent !== 'undefined' ? 'pointermove' : 'mousemove';
      document.addEventListener(moveEvent, handlePointer, { passive: true });

      document.addEventListener('mouseleave', () => {
        resetTiltCard(activeTiltCard);
        activeTiltCard = null;
      }, { passive: true });
    })();
    /* === ATHT_OPTIONAL_WEB_ANIMATIONS_JS_END === */
