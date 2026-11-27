    function renderTeacherDashboard() {
      const currentTeacher = getCurrentTeacher();
      const isThai = currentLanguage === 'th';

      const teacherAvatarEl = document.getElementById('teacherDashboardAvatar');
      if (teacherAvatarEl) teacherAvatarEl.innerText = currentTeacher.initials || 'SL';

      const teacherNameEl = document.getElementById('teacherDashboardName');
      if (teacherNameEl) {
        teacherNameEl.innerText = `${currentTeacher.fullName.toUpperCase()}!`;
      }
      const mobileWelcomeEl = document.getElementById('teacherMobileWelcomeName');
      if (mobileWelcomeEl) {
        mobileWelcomeEl.innerText = isThai
          ? `ยินดีต้อนรับ, ${currentTeacher.shortName}!`
          : `Welcome, ${currentTeacher.shortName}!`;
      }

      const teacherDeptEl = document.getElementById('teacherDashboardDept');
      if (teacherDeptEl) {
        teacherDeptEl.innerText = isThai
          ? `อาจารย์ผู้สอน • ${currentTeacher.dept} (${currentTeacher.facultyCode})`
          : `Instructor • ${currentTeacher.dept} (${currentTeacher.facultyCode})`;
      }

      const teacherDateTodayEl = document.getElementById('teacherDashboardDateToday');
      if (teacherDateTodayEl) {
        const today = new Date();
        const dateFormatted = isThai
          ? today.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' })
          : today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        teacherDateTodayEl.innerText = dateFormatted;
        const mobileDateEl = document.getElementById('teacherMobileDateBadge');
        if (mobileDateEl) mobileDateEl.innerText = dateFormatted;
      }

      const totalStudents = typeof studentDirectory === 'object' ? Object.keys(studentDirectory).length : 81;
      const membersBtn = document.getElementById('teacherDashboardMembersBtn');
      if (membersBtn) {
        membersBtn.innerText = isThai ? `สมาชิกทั้งหมด (${totalStudents}) →` : `All Members (${totalStudents}) →`;
      }

      const allowedCodes = getTeacherAssignedCourseCodes(currentTeacher);
      const coursesContainer = document.getElementById('teacherCourseCards');
      if (coursesContainer) {
        coursesContainer.className = allowedCodes.length >= 3
          ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5'
          : 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5';
        coursesContainer.innerHTML = '';
        const teacherCourses = allowedCodes.map(code => coursesCatalog[code]).filter(Boolean);
        if (teacherCourses.length === 0) {
          coursesContainer.className = 'grid grid-cols-1 gap-4';
          coursesContainer.innerHTML = `
            <div class="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-dashed border-neutral-300 dark:border-neutral-700 text-center text-xs text-neutral-500 dark:text-neutral-400">
              ${isThai ? 'ยังไม่มีรายวิชาที่ได้รับมอบหมาย กรุณาติดต่อผู้ดูแลระบบ (Admin) เพื่อกำหนดรายวิชา' : 'No courses assigned yet. Contact System Admin to assign your teaching courses.'}
            </div>
          `;
        }
        teacherCourses.forEach(c => {
          const doneCount = c.tasks.filter(t => t.isFinished).length;
          const pct = c.tasks.length > 0 ? Math.round((doneCount / c.tasks.length) * 100) : c.progress;
          const card = document.createElement('div');
          card.className = 'bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-neutral-200/90 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-neutral-400 transition pressable cursor-pointer space-y-3';
          card.onclick = () => {
            activeCourseId = c.code;
            activeProjectsFilter = c.code;
            activeProjectId = null;
            switchTeacherViewMode('assessment');
            navigateTo('teacher-review');
          };

          card.innerHTML = `
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="text-sm font-black block" style="color: var(--gz-primary)">${escapeHtml(c.code)}</span>
                <h4 class="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 leading-tight mt-0.5">${escapeHtml(c.title)}</h4>
              </div>
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 shrink-0">${pct}%</span>
            </div>

            <div class="space-y-1.5">
              <p class="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">${isThai ? 'อาจารย์ผู้สอน' : 'Teacher'}: ${escapeHtml(c.teacher)}</p>
              <div class="w-full h-2 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500" style="width: ${pct}%; background: linear-gradient(90deg, var(--gz-primary), var(--gz-secondary));"></div>
              </div>
            </div>

            <div class="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between pt-0.5">
              <span>${escapeHtml(typeof formatBilingualSchedule === 'function' ? formatBilingualSchedule(c.schedule, currentLanguage) : c.schedule)}</span>
              <span class="text-[10px] text-neutral-400 font-normal">${doneCount}/${c.tasks.length}</span>
            </div>
          `;
          coursesContainer.appendChild(card);
        });
      }

      const container = document.getElementById('teacherProjectsContainer');
      if (!container) return;
      container.innerHTML = '';

      let studentProjs = studentProjectsList.filter(p => allowedCodes.includes(p.course));
      if (teacherCourseFilter !== 'ALL') {
        studentProjs = studentProjs.filter(p => p.course === teacherCourseFilter);
      }
      studentProjs.forEach(sp => {
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200/90 dark:border-neutral-800 shadow-xs space-y-3 hover:border-neutral-400 dark:hover:border-neutral-600 transition cursor-pointer';
        card.onclick = () => openProjectTasks(sp.id);

        const membersBadges = (sp.members || []).map(m => {
          return `<span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">👤 ${escapeHtml(m)}</span>`;
        }).join(' ');

        const stLower = (sp.status || '').toLowerCase();
        let statusBadgeClass = 'text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700';
        if (stLower.includes('progress')) {
          statusBadgeClass = 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
        } else if (stLower.includes('review')) {
          statusBadgeClass = 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
        }

        card.innerHTML = `
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-1.5">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">${escapeHtml(sp.course)}</span>
                <span class="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">★ Student Project</span>
              </div>
              <h4 class="text-sm font-bold text-neutral-900 dark:text-white leading-tight mt-1">${escapeHtml(sp.title)}</h4>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">${escapeHtml(sp.description)}</p>
              <div class="mt-2 space-y-1">
                <span class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Created by: ${escapeHtml(sp.createdByName || sp.createdBy)}</span>
                <div class="flex items-center gap-1 flex-wrap">${membersBadges}</div>
              </div>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${statusBadgeClass}">
              ${escapeHtml(sp.status || 'Active')}
            </span>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span class="text-[10px] text-neutral-400">${sp.createdAt || 'Recent'}</span>
            <button onclick="event.stopPropagation(); openProjectTasks('${sp.id}')" class="px-3 py-1.5 bg-neutral-900 hover:bg-black dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white text-xs font-bold rounded-xl shadow-2xs transition pressable flex items-center gap-1">
              <span>View Tasks</span>
              <span class="text-[10px]">→</span>
            </button>
          </div>
        `;
        container.appendChild(card);
      });

      let list = teacherProjects;
      if (teacherCourseFilter !== 'ALL') {
        list = list.filter(p => p.courseCode === teacherCourseFilter);
      }

      list.forEach(proj => {
        const completedSteps = proj.steps.filter(s => s.status === 'Approved').length;
        const totalSteps = proj.steps.length;
        const pct = Math.round((completedSteps / totalSteps) * 100);

        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-xs space-y-3 hover:border-neutral-300 transition';

        card.innerHTML = `
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold text-neutral-900">${escapeHtml(proj.courseCode)}</span>
                <span class="text-[10px] text-neutral-400 font-medium">${escapeHtml(proj.groupName)}</span>
              </div>
              <h4 class="text-xs font-bold text-neutral-800 leading-tight mt-0.5">${escapeHtml(proj.taskTitle)}</h4>
              <div class="mt-1 space-y-1">
                <span class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Group Members (Click to Review):</span>
                <div class="flex items-center gap-1.5 flex-wrap">
                  ${proj.students.map(s => {
                    const prof = getStudentProfile(s.id || s.name);
                    return `
                      <button onclick="event.stopPropagation(); openTeacherProjectReview('${proj.id}', '${prof.id}')" title="Review ${escapeHtml(prof.fullName)}" class="px-2 py-0.5 rounded-lg bg-neutral-100 hover:bg-blue-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[10px] text-neutral-700 hover:text-blue-700 dark:text-neutral-300 font-medium border border-neutral-200 dark:border-neutral-700 transition pressable flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full ${s.role === 'Leader' ? 'bg-amber-500' : 'bg-neutral-400'}"></span>
                        <span>${escapeHtml(prof.shortName)}</span>
                        <span class="text-[8px] text-neutral-400">(${escapeHtml(s.role)})</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
            <span class="text-[10px] font-semibold ${proj.overallStatus === 'Needs Review' ? 'text-amber-700 bg-amber-50 border border-amber-200' : 'text-emerald-700 bg-emerald-50'} px-2 py-0.5 rounded">
              ${escapeHtml(proj.overallStatus)}
            </span>
          </div>

          <div class="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 space-y-1.5">
            <div class="flex items-center justify-between text-[10px]">
              <span class="font-medium text-neutral-500">Project Milestone Progress</span>
              <span class="font-bold text-neutral-800">${completedSteps}/${totalSteps} Steps (${pct}%)</span>
            </div>
            <div class="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div class="h-full bg-neutral-900 rounded-full" style="width: ${pct}%"></div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-1">
            <span class="text-[10px] text-neutral-400 font-mono">${proj.steps.length} Steps Attached</span>
            <button onclick="openTeacherProjectReview('${proj.id}')" class="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition pressable flex items-center gap-1">
              <span>Inspect & Comment Steps</span>
              <span class="text-[10px]">→</span>
            </button>
          </div>
        `;
        container.appendChild(card);
      });

      renderCalendar();
    }

    function setTeacherCourseFilter(filter) {
      teacherCourseFilter = filter;
      ['ALL', 'CMM321', 'CMM349', 'CMM310', 'CMM390', 'CMM320', 'GEN121'].forEach(f => {
        const btn = document.getElementById(`filterCourse${f}`);
        if (btn) {
          if (f === filter) {
            btn.className = 'px-2 py-0.5 rounded-md font-bold bg-neutral-900 text-white';
          } else {
            btn.className = 'px-2 py-0.5 rounded-md text-neutral-500 hover:text-neutral-900';
          }
        }
      });
      renderTeacherDashboard();
    }

    let teacherCurrentTab = 'home';

    function navigateToTeacherHome() {
      teacherCurrentTab = 'home';
      navigateTo('teacher-dashboard');
      const main = document.querySelector('main');
      if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function navigateToTeacherProjects() {
      teacherCurrentTab = 'projects';
      navigateTo('teacher-dashboard');
    }

    let teacherReviewViewMode = 'assessment';
    let selectedTeacherAssessmentTaskId = null;

    function formatWireframeDate(dateStr) {
      if (!dateStr) return { date: 'October 1, 2026', time: 'at 23:00' };
      if (typeof dateStr !== 'string') return { date: String(dateStr), time: 'at 23:00' };
      if (dateStr.includes(' at ')) {
        const parts = dateStr.split(' at ');
        return { date: parts[0], time: 'at ' + parts[1] };
      }
      const m = dateStr.match(/^(.+?)\s*\((.+?)\)$/);
      if (m) {
        return { date: m[1], time: 'at ' + m[2] };
      }
      return { date: dateStr, time: 'at 23:00' };
    }

    function closeAddTaskModal() {
      closeTeacherAddTaskModal();
    }

    function saveNewAssessmentTask() {
      saveTeacherNewAssessmentTask();
    }

    function switchTeacherViewMode(mode) {
      teacherReviewViewMode = mode;
      if (currentScreen === 'teacher-review') syncBrowserHistory('teacher-review', true);
      const assessView = document.getElementById('teacherAssessmentListView');
      const projTasksView = document.getElementById('teacherProjectTasksView');
      const studentsView = document.getElementById('teacherStudentListView');
      const taskEditView = document.getElementById('teacherTaskEditView');
      const gradeView = document.getElementById('teacherGradingDetailView');

      if (assessView) assessView.classList.toggle('hidden', mode !== 'assessment');
      if (projTasksView) projTasksView.classList.toggle('hidden', mode !== 'projectTasks');
      if (studentsView) studentsView.classList.toggle('hidden', mode !== 'students');
      if (taskEditView) taskEditView.classList.toggle('hidden', mode !== 'editTask');
      if (gradeView) gradeView.classList.toggle('hidden', mode !== 'grading');
      if (mode === 'projectTasks') renderTeacherProjectTasks();

      const bc = document.getElementById('teacherMasterBreadcrumb');
      if (bc) {
        const isTh = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
        const proj = studentProjectsList.find(p => p.id === activeProjectId) || (activeCourseId && studentProjectsList.find(p => p.course === activeCourseId));
        const projName = proj ? (proj.title.length > 22 ? proj.title.slice(0, 22) + '...' : proj.title) : '';
        const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
        const cCode = course ? course.code : 'Course';

        const s = '<span class="text-neutral-400 dark:text-neutral-500 font-normal">/</span>';
        const hBtn = `<button onclick="handleLogoClick()" class="hover:underline text-neutral-600 dark:text-neutral-400">${isTh ? 'หน้าหลัก' : 'Home'}</button>`;
        const cBtn = `<button onclick="selectCourse('${cCode}')" class="hover:underline text-neutral-600 dark:text-neutral-400">${cCode}</button>`;
        const pBtn = proj ? `<button onclick="openProjectTasks('${proj.id}')" class="hover:underline text-neutral-600 dark:text-neutral-400">${escapeHtml(projName)}</button>` : '';
        const tLabel = isTh ? 'รายการงาน' : 'Tasks';
        const mLabel = isTh ? 'สมาชิก' : 'Members';

        if (mode === 'assessment') {
          bc.innerHTML = `${hBtn} ${s} ${cBtn} ${s} <span class="font-bold text-neutral-900 dark:text-white">${isTh ? 'โปรเจกต์ทั้งหมด' : 'Projects'}</span>`;
        } else if (mode === 'projectTasks') {
          bc.innerHTML = proj ? `${hBtn} ${s} ${cBtn} ${s} <span class="font-bold text-neutral-900 dark:text-white">${escapeHtml(projName)}</span>` : `${hBtn} ${s} ${cBtn} ${s} <span class="font-bold text-neutral-900 dark:text-white">${tLabel}</span>`;
        } else if (mode === 'editTask') {
          bc.innerHTML = `${hBtn} ${s} ${cBtn} ${s} <button onclick="switchTeacherViewMode('assessment')" class="hover:underline text-neutral-600 dark:text-neutral-400">${tLabel}</button> ${s} <span class="font-bold text-neutral-900 dark:text-white">${isTh ? 'แก้ไขงาน' : 'Edit Task'}</span>`;
        } else if (mode === 'students') {
          bc.innerHTML = proj ? `${hBtn} ${s} ${cBtn} ${s} ${pBtn} ${s} <span class="font-bold text-neutral-900 dark:text-white">${mLabel}</span>` : `${hBtn} ${s} ${cBtn} ${s} <span class="font-bold text-neutral-900 dark:text-white">${mLabel}</span>`;
        } else if (mode === 'grading') {
          bc.innerHTML = proj ? `${hBtn} ${s} ${cBtn} ${s} ${pBtn} ${s} <button onclick="switchTeacherViewMode('students')" class="hover:underline text-neutral-600 dark:text-neutral-400">${mLabel}</button> ${s} <span class="font-bold text-neutral-900 dark:text-white">${isTh ? 'ตรวจงาน' : 'Review'}</span>` : `${hBtn} ${s} ${cBtn} ${s} <span class="font-bold text-neutral-900 dark:text-white">${isTh ? 'ตรวจงาน' : 'Review'}</span>`;
        }
      }

      renderTeacherReviewScreen();
      updateBreadcrumbUI(currentScreen);
      renderDynamicPills(currentScreen);
    }

    let teacherCameFromStudentRoster = false;

    function navigateTeacherBack() {
      if (teacherReviewViewMode === 'grading') {
        if (teacherCameFromProjects) {
          switchTeacherViewMode('assessment');
        } else {
          switchTeacherViewMode('students');
        }
      } else if (teacherReviewViewMode === 'students') {
        if (teacherCameFromStudentRoster) {
          teacherCameFromStudentRoster = false;
          navigateTo('teacher-dashboard');
        } else {
          switchTeacherViewMode('assessment');
        }
      } else if (teacherReviewViewMode === 'editTask') {
        switchTeacherViewMode('assessment');
      } else {
        if (teacherCameFromProjects) {
          teacherCameFromProjects = false;
          navigateTo('projects');
        } else {
          navigateTo('teacher-dashboard');
        }
      }
    }

    let teacherTaskScope = 'all';

    function setTeacherTaskScope(scope) {
      teacherTaskScope = scope;
      const btnAll = document.getElementById('btnTaskScopeAll');
      const btnMember = document.getElementById('btnTaskScopeMember');
      if (btnAll && btnMember) {
        if (scope === 'member') {
          btnMember.className = 'px-3 py-1 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white font-bold shadow-2xs transition';
          btnAll.className = 'px-3 py-1 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition';
        } else {
          btnAll.className = 'px-3 py-1 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white font-bold shadow-2xs transition';
          btnMember.className = 'px-3 py-1 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition';
        }
      }
      renderTeacherReviewScreen();
    }

    function selectTeacherReviewMember(studentId) {
      if (activeReviewStudentId === studentId && teacherTaskScope === 'member') {

        teacherTaskScope = 'all';
      } else {
        activeReviewStudentId = studentId;
        teacherTaskScope = 'member';
      }
      setTeacherTaskScope(teacherTaskScope);
    }

    function clearTeacherMemberFilter() {
      activeReviewStudentId = null;
      setTeacherTaskScope('all');
    }

    function openTeacherStudentProjects(studentId) {
      activeReviewStudentId = studentId;
      teacherCameFromStudentRoster = true;
      if (!activeCourseId || activeCourseId === 'ALL') activeCourseId = 'CMM321';
      activeProjectsFilter = activeCourseId;
      navigateTo('projects');
    }

    function openTeacherStudentTasks(studentId, preferredCourse = null, preferredTaskTitle = null) {
      activeReviewStudentId = studentId;
      teacherTaskScope = 'member';
      const summary = getStudentSubmissionSummary(studentId);
      const firstSubmitted = (summary.items || []).find(it => it.isSubmitted) || (summary.items || [])[0];
      const targetCourse = preferredCourse || (firstSubmitted && coursesCatalog[firstSubmitted.course] ? firstSubmitted.course : null);
      if (targetCourse && coursesCatalog[targetCourse]) {
        activeCourseId = targetCourse;
      } else if (!activeCourseId || activeCourseId === 'ALL') {
        activeCourseId = 'CMM321';
      }
      const course = coursesCatalog[activeCourseId];
      if (course && course.tasks && course.tasks.length > 0) {
        const titleToFind = preferredTaskTitle || (firstSubmitted ? firstSubmitted.title : null);
        const matchedTask = titleToFind ? course.tasks.find(t => t.title === titleToFind) : null;
        selectedTeacherAssessmentTaskId = (matchedTask || course.tasks[0]).id;
      }
      teacherReviewViewMode = 'grading';
      navigateTo('teacher-review');
      switchTeacherViewMode('grading');
    }

    function inspectTeacherTaskAndGrade(taskId) {
      let targetCourseCode = null;
      let targetTask = null;
      for (const [cCode, cObj] of Object.entries(coursesCatalog || {})) {
        const found = (cObj && Array.isArray(cObj.tasks)) ? cObj.tasks.find(t => t.id === taskId) : null;
        if (found) {
          targetCourseCode = cCode;
          targetTask = found;
          break;
        }
      }
      if (targetCourseCode) {
        activeCourseId = targetCourseCode;
        activeProjectsFilter = targetCourseCode;
      }
      if (targetTask) {
        if (targetTask.projectId) activeProjectId = targetTask.projectId;
        if (Array.isArray(targetTask.members) && targetTask.members.length > 0) {
          const firstMem = targetTask.members[0];
          activeReviewStudentId = firstMem.id || (firstMem.name ? getStudentProfile(firstMem.name).id : activeReviewStudentId);
        } else if (targetTask.createdBy) {
          activeReviewStudentId = targetTask.createdBy;
        }
      }
      selectedTeacherAssessmentTaskId = taskId;
      teacherReviewViewMode = 'grading';
      if (currentScreen !== 'teacher-review') {
        navigateTo('teacher-review');
      } else {
        switchTeacherViewMode('grading');
        renderTeacherReviewScreen();
      }
    }

    function openTeacherProjectReview(projectId, studentId = null) {
      activeReviewProjectId = projectId;
      const tProj = (typeof teacherProjects !== 'undefined' && Array.isArray(teacherProjects))
        ? teacherProjects.find(p => p.id === projectId)
        : null;
      const sp = Array.isArray(studentProjectsList)
        ? studentProjectsList.find(p => p.id === projectId)
        : null;

      if (tProj) {
        if (tProj.courseCode && coursesCatalog[tProj.courseCode]) {
          activeCourseId = tProj.courseCode;
          activeProjectsFilter = tProj.courseCode;
        }
        const matchedSp = (studentProjectsList || []).find(p =>
          p.id === projectId || (p.course === activeCourseId && (p.title === tProj.taskTitle || (tProj.groupName && p.title.includes(tProj.groupName))))
        ) || (studentProjectsList || []).find(p => p.course === activeCourseId);
        if (matchedSp) activeProjectId = matchedSp.id;
        const c = coursesCatalog[activeCourseId];
        const matchedTask = c && Array.isArray(c.tasks)
          ? (c.tasks.find(t => t.projectId === activeProjectId) || c.tasks.find(t => t.title === tProj.taskTitle) || null)
          : null;
        if (matchedTask) selectedTeacherAssessmentTaskId = matchedTask.id;
        if (!studentId && Array.isArray(tProj.students) && tProj.students[0]) {
          const firstS = tProj.students[0];
          studentId = firstS.id || (firstS.name ? getStudentProfile(firstS.name).id : null);
        }
      } else if (sp) {
        activeCourseId = sp.course || activeCourseId;
        activeProjectsFilter = activeCourseId;
        activeProjectId = sp.id;
        const c = coursesCatalog[activeCourseId];
        const matchedTask = c && Array.isArray(c.tasks) ? c.tasks.find(t => t.projectId === sp.id) : null;
        selectedTeacherAssessmentTaskId = matchedTask ? matchedTask.id : null;
        if (!studentId && sp.createdBy) studentId = sp.createdBy;
      }

      activeReviewStudentId = studentId || activeReviewStudentId || null;
      teacherReviewViewMode = 'grading';
      navigateTo('teacher-review');
    }

    function inspectTeacherTask(idOrProjId) {
      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      const proj = studentProjectsList.find(p => p.id === idOrProjId);
      let task = course ? course.tasks.find(t => t.id === idOrProjId) : null;
      if (proj) {
        activeProjectId = proj.id;
        if (proj.course && coursesCatalog[proj.course]) {
          activeCourseId = proj.course;
          activeProjectsFilter = proj.course;
        }
        const c = coursesCatalog[activeCourseId] || course;
        task = (c.tasks || []).find(t => t.projectId === proj.id) || null;
        selectedTeacherAssessmentTaskId = task ? task.id : null;
      } else if (task) {
        selectedTeacherAssessmentTaskId = task.id;
        if (task.projectId) activeProjectId = task.projectId;
      }

      const activeCourse = coursesCatalog[activeCourseId] || course;
      const activeProj = proj || studentProjectsList.find(p => p.id === activeProjectId && p.course === activeCourse.code) || studentProjectsList.find(p => p.course === activeCourse.code);

      const codeEl = document.getElementById('teacherStudentCourseCode');
      if (codeEl && activeCourse) codeEl.innerText = activeCourse.code;
      const nameEl = document.getElementById('teacherStudentCourseName');
      if (nameEl && activeCourse) nameEl.innerText = activeCourse.title;

      const badgeEl = document.getElementById('teacherStudentListTaskBadge');
      if (badgeEl) {
        const cleanTitle = activeProj
          ? activeProj.title
          : (task ? task.title.replace(/^Task\s*\d+\s*:\s*/i, '') : activeCourse.title);
        badgeEl.innerText = `Project : ${cleanTitle}`;
      }

      renderTeacherStudentTable(document.getElementById('teacherStudentSearchInput')?.value || '');
      switchTeacherViewMode('students');
    }

    function renderTeacherProjectTasks() {
      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      if (!course) return;
      ensureRelationalIntegrity();
      const courseProjs = studentProjectsList.filter(p => p.course === course.code);
      const proj = courseProjs.find(p => p.id === activeProjectId) || courseProjs[0] || null;
      if (proj) activeProjectId = proj.id;

      const titleEl = document.getElementById('teacherProjectTasksTitle');
      if (titleEl) titleEl.innerText = proj ? proj.title : `${course.code} Project Tasks`;
      const subEl = document.getElementById('teacherProjectTasksCourseSub');
      if (subEl) subEl.innerText = `${course.code} • ${course.title}`;

      let tasks = proj ? (course.tasks || []).filter(t => t.projectId === proj.id) : (course.tasks || []);

      const countEl = document.getElementById('teacherProjectTasksCountBadge');
      if (countEl) countEl.innerText = `${tasks.length} ${tasks.length === 1 ? 'Task' : 'Tasks'}`;

      const container = document.getElementById('teacherProjectTasksContainer');
      if (!container) return;
      container.innerHTML = '';

      if (tasks.length === 0) {
        const isTh = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
        container.innerHTML = `
          <div class="p-8 text-center text-neutral-400 space-y-2 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl">
            <span class="text-2xl">📝</span>
            <p class="text-xs">${isTh ? 'ยังไม่มีงานในโปรเจกต์นี้ นักศึกษาจะเป็นผู้สร้าง Task ในโปรเจกต์นี้เอง' : 'No tasks created in this project yet. Students will add their own tasks.'}</p>
          </div>
        `;
        return;
      }

      tasks.forEach(task => {
        const membersList = (task.members && task.members.length > 0)
          ? task.members
          : [{ name: (proj && proj.createdByName) || 'Student', id: (proj && proj.createdBy) || '67080200501', role: 'Leader' }];
        const totalMembers = membersList.length;
        const leaderName = membersList[0].name || 'Student';
        const tLowP = (task.status || '').toLowerCase();
        const isDone = !!(task.submitted || task.isFinished || (tLowP.includes('graded') || (tLowP.includes('finish') && !tLowP.includes('unfinish'))));
        const statusLabel = tLowP.includes('graded') ? task.status : (isDone ? 'Complete' : 'Unfinished');

        const row = document.createElement('div');
        row.onclick = () => openTeacherTaskMembers(task.id);
        row.className = 'bg-white dark:bg-neutral-900 hover:bg-slate-50/80 dark:hover:bg-neutral-800/80 rounded-2xl p-4 sm:p-5 border border-neutral-200/80 dark:border-neutral-800 transition pressable cursor-pointer shadow-xs';

        row.innerHTML = `
          <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div class="sm:col-span-5 min-w-0">
              <h4 class="text-sm sm:text-base font-bold text-neutral-900 dark:text-white truncate">
                ${escapeHtml(task.title)}
              </h4>
              <div class="flex flex-wrap items-center gap-2 mt-1">
                <span class="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-100">
                  👤 ${escapeHtml(leaderName)}
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 border border-blue-200/70 dark:border-blue-800/50">
                  ${totalMembers} ${totalMembers === 1 ? 'Member' : 'Members'}
                </span>
              </div>
              <p class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-1">
                ${escapeHtml(task.description || 'Project task deliverable')}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2 mt-1 border-t border-neutral-200/70 dark:border-neutral-800 sm:border-t-0 sm:pt-0 sm:mt-0 sm:col-span-4">
              <div class="text-xs min-w-0">
                <span class="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 block">${currentLanguage === 'th' ? 'วันที่ประกาศ' : 'Publish Date'}</span>
                <span class="text-[11px] text-neutral-700 dark:text-neutral-300 font-medium truncate block">${escapeHtml(typeof formatBilingualDate === 'function' ? formatBilingualDate(task.publishDate || 'Sep 18, 2026', currentLanguage) : (task.publishDate || 'Sep 18, 2026'))}</span>
              </div>
              <div class="text-xs min-w-0">
                <span class="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 block">${currentLanguage === 'th' ? 'กำหนดส่ง' : 'Due Date'}</span>
                <span class="text-[11px] text-neutral-700 dark:text-neutral-300 font-medium truncate block">${escapeHtml(typeof formatBilingualDate === 'function' ? formatBilingualDate(task.due || 'Sep 30, 2026', currentLanguage) : (task.due || 'Sep 30, 2026'))}</span>
              </div>
            </div>

            <div class="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2">
              <span class="px-3 py-1 rounded-full text-[11px] font-bold ${isDone ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'}">
                ${escapeHtml(statusLabel)}
              </span>
              <span class="px-3 py-1 rounded-full bg-blue-50 dark:bg-neutral-800 text-blue-700 dark:text-sky-300 border border-blue-200/80 dark:border-neutral-700 text-[11px] font-bold">
                View →
              </span>
            </div>
          </div>
        `;
        container.appendChild(row);
      });
    }

    function openTeacherTaskMembers(taskId) {
      selectedTeacherAssessmentTaskId = taskId;
      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      const task = course && course.tasks ? course.tasks.find(t => t.id === taskId) : null;
      if (task && task.members && task.members.length > 0) {
        activeReviewStudentId = task.members[0].id || getStudentProfile(task.members[0].name).id;
      }
      renderTeacherReviewScreen();
      switchTeacherViewMode('grading');
    }

    function handleTeacherMemberProjectChange(newProjectId) {
      if (!newProjectId) return;
      activeProjectId = newProjectId;
      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      if (course && course.tasks) {
        const linkedTask = course.tasks.find(t => t.projectId === newProjectId);
        selectedTeacherAssessmentTaskId = linkedTask ? linkedTask.id : null;
      }
      renderTeacherStudentTable(document.getElementById('teacherStudentSearchInput')?.value || '');
      if (currentScreen === 'teacher-review') syncBrowserHistory('teacher-review', true);
    }

    function handleTeacherMemberCourseChange(newCourseCode) {
      if (!newCourseCode || !coursesCatalog[newCourseCode]) return;
      activeCourseId = newCourseCode;
      activeProjectsFilter = newCourseCode;
      activeProjectId = null;
      renderTeacherReviewScreen();
      updateBreadcrumbUI(currentScreen);
    }

    function syncTeacherEditTaskDueCombined() {
      const dateVal = document.getElementById('teacherEditTaskDueDate')?.value;
      const timeVal = document.getElementById('teacherEditTaskDueTime')?.value || '23:00';
      const hiddenInput = document.getElementById('teacherEditTaskDueInput');
      if (hiddenInput && dateVal) {
        hiddenInput.value = formatTaskDueDateTime(dateVal, timeVal);
      }
    }

    function openTeacherEditTaskScreen(taskId) {
      selectedTeacherAssessmentTaskId = taskId;
      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      const task = course ? course.tasks.find(t => t.id === taskId) : null;
      if (!task) return;

      const titleInput = document.getElementById('teacherEditTaskTitleInput');
      if (titleInput) titleInput.value = task.title;
      const dueInput = document.getElementById('teacherEditTaskDueInput');
      if (dueInput) dueInput.value = task.due;

      const parsed = parseTaskDueDateTime(task.due);
      const dateInput = document.getElementById('teacherEditTaskDueDate');
      const timeInput = document.getElementById('teacherEditTaskDueTime');
      if (dateInput) dateInput.value = parsed.dateVal;
      if (timeInput) timeInput.value = parsed.timeVal;

      const descInput = document.getElementById('teacherEditTaskDescInput');
      if (descInput) descInput.value = task.description || '';
      const heading = document.getElementById('teacherEditTaskHeading');
      if (heading) heading.innerText = `Edit ${task.title}`;
      const codeTag = document.getElementById('teacherEditTaskCourseCodeTag');
      if (codeTag && course) codeTag.innerText = course.code;

      switchTeacherViewMode('editTask');
    }

    function saveTeacherEditedTask() {
      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      if (!course) return;

      const title = document.getElementById('teacherEditTaskTitleInput')?.value.trim();
      const dateVal = document.getElementById('teacherEditTaskDueDate')?.value;
      const timeVal = document.getElementById('teacherEditTaskDueTime')?.value || '23:00';
      let due = document.getElementById('teacherEditTaskDueInput')?.value.trim();
      if (dateVal) {
        due = formatTaskDueDateTime(dateVal, timeVal);
      }
      const desc = document.getElementById('teacherEditTaskDescInput')?.value.trim();

      const task = course.tasks.find(t => t.id === selectedTeacherAssessmentTaskId);
      if (task) {
        if (title) task.title = title;
        if (due) {
          task.due = due;
          task.publishDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        if (desc) task.description = desc;
        if (task.projectId) {
          const linkedProj = studentProjectsList.find(p => p.id === task.projectId);
          if (linkedProj) {
            if (due) linkedProj.dueDate = due;
            const projTasks = course.tasks.filter(t => t.projectId === linkedProj.id);
            if (projTasks.length === 1 && desc) linkedProj.description = desc;
            saveStoredProjects(studentProjectsList);
          }
        }
        if (typeof syncAllATHTData === 'function') syncAllATHTData();
        else {
          if (typeof ensureRelationalIntegrity === 'function') ensureRelationalIntegrity();
          if (typeof saveCoursesCatalog === 'function') saveCoursesCatalog();
        }
      }

      alertMessage("Assessment task updated successfully! Publish date updated to current date.");
      switchTeacherViewMode('assessment');
    }

    let activeTeacherGradingRevisionIndex = -1;

    function selectTeacherGradingRevision(idx) {
      activeTeacherGradingRevisionIndex = idx;
      renderTeacherReviewScreen();
    }

    function gradeStudentTask(studentId, taskId = null) {
      activeReviewStudentId = studentId;
      activeTeacherGradingRevisionIndex = -1;
      if (taskId) {
        selectedTeacherAssessmentTaskId = taskId;
        const cObj = coursesCatalog[activeCourseId];
        const tObj = cObj && Array.isArray(cObj.tasks) ? cObj.tasks.find(t => t.id === taskId) : null;
        if (tObj && tObj.projectId) activeProjectId = tObj.projectId;
      } else {
        const info = getStudentCourseTaskInfo(studentId, activeCourseId || 'CMM321', activeProjectId);
        if (info && info.taskId) selectedTeacherAssessmentTaskId = info.taskId;
      }
      teacherReviewViewMode = 'grading';
      if (currentScreen !== 'teacher-review') {
        navigateTo('teacher-review');
      }
      renderTeacherReviewScreen();
      switchTeacherViewMode('grading');
    }

    function getStudentSubmissionSummary(studentId) {
      const prof = getStudentProfile(studentId);
      const items = [];
      let submittedCount = 0;
      let totalCount = 0;

      Object.entries(coursesCatalog).forEach(([cCode, course]) => {
        (course.tasks || []).forEach(task => {
          const memberMatch = (task.members || []).find(m =>
            m.id === studentId ||
            (m.name && prof.shortName && m.name.toLowerCase().includes(prof.shortName.toLowerCase()))
          );
          if (task.createdBy === studentId || memberMatch) {
            totalCount++;
            const revs = ensureStudentSubmissionRevisions(task, studentId, cCode);
            const latestRev = revs.length > 0 ? revs[revs.length - 1] : null;
            const isSub = !!(latestRev && latestRev.status === 'complete');
            const isRev = !!(latestRev && latestRev.status === 'revision');
            if (isSub) submittedCount++;
            const statusText = isSub
              ? (latestRev.score && latestRev.score !== 'Pending' && latestRev.score !== '-' ? `Graded (${latestRev.score})` : 'ส่งแล้ว')
              : (isRev ? 'รอแก้' : 'ยังไม่ส่ง');
            items.push({
              course: cCode,
              title: task.title,
              statusText,
              isSubmitted: isSub,
              isRevision: isRev,
              due: (latestRev && latestRev.submittedAt) || task.due
            });
          }
        });
      });

      (studentProjectsList || []).forEach(proj => {
        const isCreator = proj.createdBy === studentId;
        const isMember = (proj.members || []).some(m => m.includes(studentId) || (prof.shortName && m.includes(prof.shortName)));
        if (isCreator || isMember) {
          const steps = proj.tasks || [];
          const doneSteps = steps.filter(s => s.status === 'Approved' || s.status === 'Needs Review').length;
          if (steps.length > 0) {
            totalCount++;
            const hasSub = doneSteps > 0;
            if (hasSub) submittedCount++;
            items.push({
              course: proj.course,
              title: `Project: ${proj.title}`,
              statusText: hasSub ? `ส่งแล้ว ${doneSteps}/${steps.length} Steps` : 'ยังไม่ส่งความคืบหน้า',
              isSubmitted: hasSub,
              due: 'Milestone'
            });
          }
        }
      });

      const hasSubmittedAny = totalCount > 0 ? submittedCount > 0 : (parseInt(studentId.slice(-1), 10) % 2 === 0);
      if (totalCount === 0) {
        totalCount = 1;
        submittedCount = hasSubmittedAny ? 1 : 0;
        items.push({
          course: 'CMM321',
          title: 'Task 1: Math Shaders & Matrix Pipeline',
          statusText: hasSubmittedAny ? 'ส่งงานแล้ว (Submitted)' : 'ยังไม่ส่งงาน (Not Submitted)',
          isSubmitted: hasSubmittedAny,
          due: 'Oct 1, 2026'
        });
      }

      return {
        student: prof,
        submittedCount,
        totalCount,
        hasSubmittedAny,
        allSubmitted: submittedCount === totalCount,
        items
      };
    }

    let teacherMemberSortMode = 'id-asc';

    function onTeacherSortDropdownChange(val) {
      teacherMemberSortMode = val || 'id-asc';
      filterTeacherStudentTable();
    }

    function toggleTeacherSortColumn(col) {
      const sortSel = document.getElementById('teacherStudentSortSelect');
      if (col === 'id') {
        teacherMemberSortMode = teacherMemberSortMode === 'id-asc' ? 'id-desc' : 'id-asc';
        if (sortSel) sortSel.value = teacherMemberSortMode;
      } else if (col === 'date') {
        teacherMemberSortMode = teacherMemberSortMode === 'date-desc' ? 'date-asc' : 'date-desc';
      } else if (col === 'status') {
        teacherMemberSortMode = teacherMemberSortMode === 'status-complete' ? 'status-pending' : 'status-complete';
      }
      filterTeacherStudentTable();
    }

    function parseTeacherTaskDateMs(str) {
      if (!str) return 0;
      const cleaned = String(str).replace(/\s+at\s+/i, ' ').replace(/[()]/g, '');
      const t = Date.parse(cleaned);
      return Number.isNaN(t) ? 0 : t;
    }

    function renderTeacherStudentTable(searchFilter = '') {
      const container = document.getElementById('teacherStudentTableBody');
      if (!container) return;
      container.innerHTML = '';

      const query = (searchFilter || '').toLowerCase().trim();
      const statusFilter = document.getElementById('teacherStudentStatusFilter')?.value || 'all';
      const sortMode = teacherMemberSortMode || 'id-asc';

      const idArrow = document.getElementById('teacherIdSortArrow');
      if (idArrow) {
        idArrow.innerText = sortMode === 'id-asc' ? '↑' : sortMode === 'id-desc' ? '↓' : '↕';
        idArrow.classList.toggle('opacity-100', sortMode.startsWith('id-'));
        idArrow.classList.toggle('opacity-50', !sortMode.startsWith('id-'));
      }
      const dateArrow = document.getElementById('teacherDateSortArrow');
      if (dateArrow) {
        dateArrow.innerText = sortMode === 'date-asc' ? '↑' : sortMode === 'date-desc' ? '↓' : '↕';
        dateArrow.classList.toggle('opacity-100', sortMode.startsWith('date-'));
        dateArrow.classList.toggle('opacity-50', !sortMode.startsWith('date-'));
      }
      const statusArrow = document.getElementById('teacherStatusSortArrow');
      if (statusArrow) {
        statusArrow.innerText = sortMode === 'status-complete' ? '↑' : sortMode === 'status-pending' ? '↓' : '↕';
        statusArrow.classList.toggle('opacity-100', sortMode.startsWith('status-'));
        statusArrow.classList.toggle('opacity-50', !sortMode.startsWith('status-'));
      }

      const allowedTeacherCodes = currentUserRole === 'teacher' ? getTeacherAssignedCourseCodes() : Object.keys(coursesCatalog);
      const curCourseCode = (coursesCatalog[activeCourseId] && allowedTeacherCodes.includes(activeCourseId))
        ? activeCourseId
        : (allowedTeacherCodes[0] || 'CMM321');
      if (activeCourseId !== curCourseCode) activeCourseId = curCourseCode;

      const courseSelEl = document.getElementById('teacherMemberCourseSelect');
      if (courseSelEl) {
        courseSelEl.innerHTML = allowedTeacherCodes.map(c => `<option value="${c}">${c}</option>`).join('');
        courseSelEl.value = curCourseCode;
      }
      const courseProjs = studentProjectsList.filter(p => p.course === curCourseCode);
      const curProj = courseProjs.find(p => p.id === activeProjectId) || courseProjs[0] || null;
      if (curProj) activeProjectId = curProj.id;

      const projSel = document.getElementById('teacherMemberProjectSelect');
      if (projSel) {
        if (courseProjs.length > 0) {
          projSel.innerHTML = courseProjs.map(p =>
            `<option value="${escapeHtml(p.id)}" class="text-neutral-900 dark:text-white bg-white dark:bg-neutral-900">Project : ${escapeHtml(p.title)}</option>`
          ).join('');
          projSel.value = curProj.id;
        } else {
          const courseObj = coursesCatalog[curCourseCode];
          projSel.innerHTML = `<option value="">Project : ${escapeHtml(courseObj ? courseObj.title : curCourseCode)}</option>`;
        }
      }

      const badgeEl = document.getElementById('teacherStudentListTaskBadge');
      if (badgeEl && curProj) {
        badgeEl.innerText = `Project : ${curProj.title}`;
      }

      const curCourseObj = coursesCatalog[curCourseCode];
      const activeTaskObj = curCourseObj && curCourseObj.tasks
        ? (curCourseObj.tasks.find(t => t.id === selectedTeacherAssessmentTaskId) || curCourseObj.tasks.find(t => curProj && t.projectId === curProj.id) || curCourseObj.tasks[0])
        : null;

      const allStudentIds = Object.keys(studentDirectory);

      const filtered = allStudentIds
        .map(id => getStudentCourseTaskInfo(id, curCourseCode, curProj ? curProj.id : null, null))
        .filter(info => {
          const s = info.student;
          if (!s) return false;
          const matchQuery = !query ||
            s.id.toLowerCase().includes(query) ||
            s.fullName.toLowerCase().includes(query) ||
            s.email.toLowerCase().includes(query) ||
            (info.taskTitle || '').toLowerCase().includes(query);
          if (!matchQuery) return false;
          if (statusFilter === 'submitted') return info.submissionStatus === 'complete';
          if (statusFilter === 'revision') return info.submissionStatus === 'revision';
          if (statusFilter === 'pending') return info.submissionStatus === 'pending';
          return true;
        })
        .sort((a, b) => {
          if (sortMode === 'id-desc') {
            return b.student.id.localeCompare(a.student.id, undefined, { numeric: true });
          }
          if (sortMode === 'name-asc') {
            return a.student.fullName.localeCompare(b.student.fullName);
          }
          if (sortMode === 'date-asc' || sortMode === 'date-desc') {
            const da = parseTeacherTaskDateMs(a.due);
            const db = parseTeacherTaskDateMs(b.due);
            if (da !== db) return sortMode === 'date-asc' ? da - db : db - da;
          }
          if (sortMode === 'status-complete' || sortMode === 'status-pending') {
            const rankMap = sortMode === 'status-complete'
              ? { complete: 0, revision: 1, pending: 2 }
              : { pending: 0, revision: 1, complete: 2 };
            const ra = rankMap[a.submissionStatus] ?? 2;
            const rb = rankMap[b.submissionStatus] ?? 2;
            if (ra !== rb) return ra - rb;
          }
          return a.student.id.localeCompare(b.student.id, undefined, { numeric: true });
        });

      const totalBadge = document.getElementById('teacherStudentTotalBadge');
      if (totalBadge) totalBadge.innerText = `${filtered.length} Students`;

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="py-12 text-center text-neutral-400 space-y-2">
            <span class="text-3xl">🔍</span>
            <p class="text-xs">No students found matching "${escapeHtml(query)}"</p>
          </div>
        `;
        return;
      }

      const isThRow = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
      filtered.forEach(info => {
        const prof = info.student;
        const st = info.submissionStatus;
        const statusCls = st === 'complete'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
          : st === 'revision'
            ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800'
            : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800';
        const statusLabel = info.taskCount > 1
          ? (st === 'complete'
              ? (isThRow ? `ส่งแล้ว (${info.submittedTasksCount}/${info.taskCount} งาน)` : `Submitted (${info.submittedTasksCount}/${info.taskCount} Tasks)`)
              : st === 'revision'
                ? (isThRow ? `รอแก้ (${info.submittedTasksCount}/${info.taskCount} งาน)` : `Revision (${info.submittedTasksCount}/${info.taskCount} Tasks)`)
                : (isThRow ? `ยังไม่ส่ง (0/${info.taskCount} งาน)` : `Not Submitted (0/${info.taskCount} Tasks)`))
          : (st === 'complete'
              ? (isThRow ? 'ส่งแล้ว' : 'Submitted')
              : st === 'revision'
                ? (isThRow ? 'รอแก้' : 'Revision')
                : (isThRow ? 'ยังไม่ส่ง' : 'Not Submitted'));

        const row = document.createElement('div');
        row.className = 'grid grid-cols-12 items-center py-3 px-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition';

        row.innerHTML = `
          <div class="col-span-4 sm:col-span-3 flex items-center gap-2.5 min-w-0 pr-2">
            <div class="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 border border-blue-200/70 dark:border-blue-800/50 flex items-center justify-center font-bold text-xs shrink-0">
              ${escapeHtml(prof.initials)}
            </div>
            <div class="min-w-0">
              <span class="font-mono text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate block">${escapeHtml(prof.id)}</span>
              <span class="text-[10px] text-neutral-500 dark:text-neutral-400 truncate block">${escapeHtml(prof.fullName)}</span>
            </div>
          </div>

          <div class="col-span-3 sm:col-span-3 pl-2 min-w-0">
            <span class="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate block">
              ${escapeHtml(info.taskTitle)}
            </span>
            ${info.taskCount > 1 ? `<span class="text-[10px] font-bold text-blue-600 dark:text-sky-400 block">${isThRow ? `งานครั้งที่ ${info.taskCount} (รวม ${info.taskCount} งาน)` : `Task #${info.taskCount} (${info.taskCount} Tasks)`}</span>` : ''}
          </div>

          <div class="col-span-2 sm:col-span-2 hidden sm:block text-xs text-neutral-600 dark:text-neutral-400 font-medium truncate">
            ${escapeHtml(info.due)}
          </div>

          <div class="col-span-3 sm:col-span-2 text-center shrink-0">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${statusCls}">
              ${statusLabel}
            </span>
          </div>

          <div class="col-span-2 sm:col-span-2 text-center shrink-0">
            ${info.taskId ? `
            <button onclick="gradeStudentTask('${prof.id}', '${info.taskId}')" class="px-4 py-1 rounded-full bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-neutral-800 dark:hover:bg-blue-600 text-blue-700 dark:text-sky-300 dark:hover:text-white border border-blue-200/80 dark:border-neutral-700 font-bold text-xs transition shadow-2xs pressable">
              View
            </button>` : '<span class="text-[11px] text-neutral-400">—</span>'}
          </div>
        `;
        container.appendChild(row);
      });
    }

    function filterTeacherStudentTable() {
      const input = document.getElementById('teacherStudentSearchInput');
      renderTeacherStudentTable(input ? input.value : '');
      translateDOM(currentLanguage);
    }

    function dataUrlToBlob(dataUrl) {
      if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.includes(',')) return null;
      const parts = dataUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      const raw = atob(parts[1]);
      const arr = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
      return new Blob([arr], { type: mime });
    }

    function crc32Bytes(buf) {
      let c = 0xffffffff;
      for (let i = 0; i < buf.length; i++) {
        c ^= buf[i];
        for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      }
      return (c ^ 0xffffffff) >>> 0;
    }

    function buildValidZipBlob(entryName, textContent) {
      const enc = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
      const nameBytes = enc ? enc.encode(entryName) : Uint8Array.from(entryName.split('').map(c => c.charCodeAt(0) & 0xff));
      const dataBytes = enc ? enc.encode(textContent) : Uint8Array.from(textContent.split('').map(c => c.charCodeAt(0) & 0xff));
      const crc = crc32Bytes(dataBytes);
      const localLen = 30 + nameBytes.length + dataBytes.length;
      const centralLen = 46 + nameBytes.length;
      const eocdLen = 22;
      const out = new Uint8Array(localLen + centralLen + eocdLen);
      const dv = new DataView(out.buffer);
      // Local File Header
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(8, 0, true);
      dv.setUint32(14, crc, true);
      dv.setUint32(18, dataBytes.length, true);
      dv.setUint32(22, dataBytes.length, true);
      dv.setUint16(26, nameBytes.length, true);
      out.set(nameBytes, 30);
      out.set(dataBytes, 30 + nameBytes.length);
      // Central Directory Header
      let o = localLen;
      dv.setUint32(o, 0x02014b50, true);
      dv.setUint16(o + 4, 20, true);
      dv.setUint16(o + 6, 20, true);
      dv.setUint32(o + 16, crc, true);
      dv.setUint32(o + 20, dataBytes.length, true);
      dv.setUint32(o + 24, dataBytes.length, true);
      dv.setUint16(o + 28, nameBytes.length, true);
      out.set(nameBytes, o + 46);
      // End of Central Directory
      o += centralLen;
      dv.setUint32(o, 0x06054b50, true);
      dv.setUint16(o + 8, 1, true);
      dv.setUint16(o + 10, 1, true);
      dv.setUint32(o + 12, centralLen, true);
      dv.setUint32(o + 16, localLen, true);
      return typeof Blob !== 'undefined' ? new Blob([out], { type: 'application/zip' }) : out;
    }

    function resolveTeacherReviewTask(course, studentId) {
      if (!course || !Array.isArray(course.tasks) || course.tasks.length === 0) return null;
      const explicitTask = selectedTeacherAssessmentTaskId
        ? course.tasks.find(t => t.id === selectedTeacherAssessmentTaskId)
        : null;
      const scopeProjId = activeProjectId || (explicitTask && explicitTask.projectId) || null;
      const studentTasks = typeof getStudentTasksInCourse === 'function'
        ? getStudentTasksInCourse(studentId, course.code, scopeProjId)
        : [];
      if (studentTasks.length > 0) {
        const matched = studentTasks.find(t => t.id === selectedTeacherAssessmentTaskId);
        if (matched) return matched;
        selectedTeacherAssessmentTaskId = studentTasks[0].id;
        return studentTasks[0];
      }
      if (explicitTask) return explicitTask;
      if (scopeProjId) {
        const projTask = course.tasks.find(t => t.projectId === scopeProjId);
        if (projTask) return projTask;
      }
      return course.tasks[0];
    }

    async function downloadTeacherGradingFile() {
      const fileEl = document.getElementById('teacherGradingFileName');
      const displayedFile = fileEl ? fileEl.innerText.trim() : '';
      if (!displayedFile || displayedFile === 'ยังไม่มีไฟล์ส่งงาน' || displayedFile === 'No file submitted yet') {
        alertMessage(currentLanguage === 'th' ? 'ยังไม่มีไฟล์ส่งงานสำหรับนักศึกษาคนนี้' : 'No file submitted yet.');
        return;
      }

      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      const stu = getStudentProfile(activeReviewStudentId || '67080500208');
      const activeTask = resolveTeacherReviewTask(course, stu.id);
      const stuInfo = course ? getStudentCourseTaskInfo(stu.id, course.code, activeProjectId, activeTask ? activeTask.id : null) : null;
      const revs = (stuInfo && stuInfo.revisions) || [];
      const revIdx = (activeTeacherGradingRevisionIndex >= 0 && activeTeacherGradingRevisionIndex < revs.length) ? activeTeacherGradingRevisionIndex : (revs.length - 1);
      const activeRev = revIdx >= 0 ? revs[revIdx] : null;

      let fileBlob = null;
      if (activeRev && activeRev.fileKey && typeof loadUploadedFileFromDB === 'function') {
        fileBlob = await loadUploadedFileFromDB(activeRev.fileKey);
      }
      if (!fileBlob && activeRev && activeRev.fileDataUrl) {
        fileBlob = dataUrlToBlob(activeRev.fileDataUrl);
      }

      let downloadName = displayedFile;
      if (!fileBlob) {
        const receipt = `ATHT Submission Summary\r\nStudent: ${stu.id} ${stu.fullName}\r\nCourse: ${course ? course.code : 'CMM321'}\r\nTask: ${activeTask ? activeTask.title : ''}\r\nFile: ${displayedFile}\r\nSubmitted: ${activeRev ? activeRev.submittedAt : ''}\r\nNote: Sample seeded archive generated cleanly.\r\n`;
        if (displayedFile.toLowerCase().endsWith('.zip')) {
          fileBlob = buildValidZipBlob('README_submission.txt', receipt);
        } else {
          fileBlob = typeof Blob !== 'undefined' ? new Blob([receipt], { type: 'text/plain;charset=utf-8' }) : null;
          downloadName = `${displayedFile}.txt`;
        }
      }

      try {
        if (fileBlob && typeof URL !== 'undefined' && URL.createObjectURL) {
          const url = URL.createObjectURL(fileBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = downloadName;
          if (document.body && typeof document.body.appendChild === 'function') {
            document.body.appendChild(a);
            a.click();
            if (typeof a.remove === 'function') a.remove();
          }
          setTimeout(() => URL.revokeObjectURL(url), 2000);
        }
      } catch (e) {}
      alertMessage(currentLanguage === 'th' ? `ดาวน์โหลดไฟล์สำเร็จ: ${downloadName}` : `Downloaded: ${downloadName}`);
    }

    function clampTeacherScoreNumber(rawVal) {
      const cleaned = String(rawVal ?? '').split('/')[0].trim();
      if (!cleaned) return null;
      const num = Number(cleaned);
      if (!Number.isFinite(num)) return null;
      const clamped = Math.max(0, Math.min(10, num));
      return Number(clamped.toFixed(2));
    }

    function handleTeacherScoreFocus(el) {
      if (!el) return;
      const num = clampTeacherScoreNumber(el.value);
      el.value = num !== null ? String(num) : '';
    }

    function handleTeacherScoreTyping(el) {
      if (!el) return;
      const raw = String(el.value || '');
      if (!raw.trim()) {
        el.value = '';
        return;
      }
      if (raw.trim().startsWith('-')) {
        el.value = '0';
        return;
      }
      const noSlash = raw.split('/')[0];
      let filtered = noSlash.replace(/[^0-9.]/g, '');
      const dotIdx = filtered.indexOf('.');
      if (dotIdx !== -1) {
        filtered = filtered.slice(0, dotIdx + 1) + filtered.slice(dotIdx + 1).replace(/\./g, '');
      }
      if (!filtered) {
        el.value = '';
        return;
      }
      if (filtered === '.') {
        el.value = '0.';
        return;
      }
      const num = parseFloat(filtered);
      if (Number.isFinite(num)) {
        if (num > 10) {
          el.value = '10';
          return;
        }
        if (num < 0) {
          el.value = '0';
          return;
        }
      }
      el.value = filtered;
    }

    function handleTeacherScoreBlur(el) {
      if (!el) return;
      const num = clampTeacherScoreNumber(el.value);
      el.value = num !== null ? `${num} / 10` : '';
    }

    function sendTeacherFeedbackNote() {
      const input = document.getElementById('teacherFeedbackNoteInput');
      const text = input ? input.value.trim() : '';
      const scoreInput = document.getElementById('teacherGradingScoreInput');
      const rawScoreStr = scoreInput ? scoreInput.value.trim() : '';
      const parsedScore = clampTeacherScoreNumber(rawScoreStr);
      if (parsedScore === null && !text) {
        alertMessage(currentLanguage === 'th'
          ? 'กรุณากรอกคะแนน (0 - 10) หรือพิมพ์ข้อเสนอแนะก่อนส่ง'
          : 'Please enter a score (0 - 10) or feedback note before sending.');
        return;
      }
      const hasScoreEntered = parsedScore !== null;
      const scoreVal = hasScoreEntered ? `${parsedScore} / 10` : '';
      if (scoreInput && hasScoreEntered) {
        scoreInput.value = scoreVal;
      }

      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      const student = getStudentProfile(activeReviewStudentId || '67080500208');
      if (course) {
        ensureRelationalIntegrity();
        const task = resolveTeacherReviewTask(course, student.id);
        if (task) {
          const revs = ensureStudentSubmissionRevisions(task, student.id, course.code);
          const msgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const teacherMsg = text ? {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            author: `T. ${course.teacher}`,
            role: 'teacher',
            time: msgTime,
            statusTag: hasScoreEntered ? 'ส่งแล้ว' : '',
            text
          } : null;

          if (hasScoreEntered) {
            if (revs.length === 0) {
              revs.push({
                attempt: 1,
                file: `student_${student.id}_${task.id}_v1.zip`,
                submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: 'complete',
                statusLabel: 'ส่งแล้ว',
                score: scoreVal,
                notes: []
              });
            }
            const idx = (activeTeacherGradingRevisionIndex >= 0 && activeTeacherGradingRevisionIndex < revs.length)
              ? activeTeacherGradingRevisionIndex
              : revs.length - 1;
            const targetRev = revs[idx];
            targetRev.status = 'complete';
            targetRev.statusLabel = 'ส่งแล้ว';
            targetRev.score = scoreVal;
            if (teacherMsg) {
              if (!Array.isArray(targetRev.notes)) targetRev.notes = [];
              targetRev.notes.push({ ...teacherMsg });
            }
            task.score = scoreVal;
            task.status = `Graded (${scoreVal})`;
            task.isFinished = true;
            syncGroupSubmissionSnapshot(task, student.id, {
              submitted: true,
              score: scoreVal,
              status: `Graded (${scoreVal})`,
              memberTaskStatus: `Graded (${scoreVal})`,
              file: targetRev.file,
              submittedAt: targetRev.submittedAt,
              revisions: revs
            });
          } else if (revs.length > 0 && teacherMsg) {
            const idx = (activeTeacherGradingRevisionIndex >= 0 && activeTeacherGradingRevisionIndex < revs.length)
              ? activeTeacherGradingRevisionIndex
              : revs.length - 1;
            const targetRev = revs[idx];
            if (!Array.isArray(targetRev.notes)) targetRev.notes = [];
            targetRev.notes.push({ ...teacherMsg });
          }

          if (teacherMsg) {
            if (!Array.isArray(task.comments)) task.comments = [];
            task.comments.push({ ...teacherMsg });
          }
          if (typeof markNotificationsReadForTarget === 'function') {
            markNotificationsReadForTarget({ course: course.code, taskId: task.id, studentId: student.id });
          }
          if (typeof pushAppNotification === 'function') {
            pushAppNotification({
              type: hasScoreEntered ? 'grade' : 'comment',
              targetRole: 'student',
              targetStudentIds: getGroupSyncStudentIds(task, student.id),
              course: course.code,
              title: hasScoreEntered ? `ตรวจงานแล้ว (${scoreVal}): ${task.title}` : `ข้อเสนอแนะจากอาจารย์: ${task.title}`,
              taskTitle: text || `บันทึกคะแนน ${scoreVal}`,
              taskId: task.id,
              studentId: student.id,
              time: 'Just now',
              isNew: true
            });
          }
          saveCoursesCatalog();
          if (window.__ATHT_SQL_SYNC && typeof window.__ATHT_SQL_SYNC.flushNow === 'function') {
            setTimeout(() => window.__ATHT_SQL_SYNC.flushNow(), 20);
          }
        }
      }

      if (input) input.value = '';
      renderTeacherReviewScreen();
      updateBreadcrumbUI(currentScreen);
      alertMessage(hasScoreEntered
        ? `บันทึกคะแนน (${scoreVal}) และข้อเสนอแนะสำหรับ ${student.shortName} เรียบร้อยแล้ว!`
        : `ส่งข้อเสนอแนะสำหรับ ${student.shortName} เรียบร้อยแล้ว!`);
    }

    function requestTeacherRevision() {
      const input = document.getElementById('teacherFeedbackNoteInput');
      const text = (input ? input.value.trim() : '') || 'กรุณาแก้ไขงานตามข้อเสนอแนะและส่งใหม่อีกครั้ง';
      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      const student = getStudentProfile(activeReviewStudentId || '67080500208');
      if (course) {
        ensureRelationalIntegrity();
        const task = resolveTeacherReviewTask(course, student.id);
        if (task) {
          const revs = ensureStudentSubmissionRevisions(task, student.id, course.code);
          if (revs.length === 0) {
            revs.push({
              attempt: 1,
              file: `student_${student.id}_${task.id}_v1.zip`,
              submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              status: 'revision',
              statusLabel: 'รอแก้',
              score: 'Revise',
              notes: []
            });
          }
          const idx = (activeTeacherGradingRevisionIndex >= 0 && activeTeacherGradingRevisionIndex < revs.length)
            ? activeTeacherGradingRevisionIndex
            : revs.length - 1;
          const targetRev = revs[idx];
          targetRev.status = 'revision';
          targetRev.statusLabel = 'รอแก้';
          targetRev.score = 'Revise';
          const msgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const revMsg = {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            author: `T. ${course.teacher}`,
            role: 'teacher',
            time: msgTime,
            statusTag: 'รอแก้',
            text
          };
          if (!Array.isArray(targetRev.notes)) targetRev.notes = [];
          targetRev.notes.push({ ...revMsg });
          if (!Array.isArray(task.comments)) task.comments = [];
          task.comments.push({ ...revMsg });

          task.status = 'Revision Requested';
          task.isFinished = false;
          syncGroupSubmissionSnapshot(task, student.id, {
            submitted: false,
            score: 'Revise',
            status: 'Revision Requested',
            memberTaskStatus: 'Revision Requested',
            file: targetRev.file,
            submittedAt: targetRev.submittedAt,
            revisions: revs
          });
          if (typeof markNotificationsReadForTarget === 'function') {
            markNotificationsReadForTarget({ course: course.code, taskId: task.id, studentId: student.id });
          }
          if (typeof pushAppNotification === 'function') {
            pushAppNotification({
              type: 'comment',
              targetRole: 'student',
              targetStudentIds: getGroupSyncStudentIds(task, student.id),
              course: course.code,
              title: `สั่งแก้ไขงาน (รอแก้): ${task.title}`,
              taskTitle: text,
              taskId: task.id,
              studentId: student.id,
              time: 'Just now',
              isNew: true
            });
          }
          saveCoursesCatalog();
          if (window.__ATHT_SQL_SYNC && typeof window.__ATHT_SQL_SYNC.flushNow === 'function') {
            setTimeout(() => window.__ATHT_SQL_SYNC.flushNow(), 20);
          }
        }
      }
      if (input) input.value = '';
      renderTeacherReviewScreen();
      updateBreadcrumbUI(currentScreen);
      alertMessage(`ส่งกลับให้ ${student.shortName} แก้ไข (สถานะ: รอแก้) เรียบร้อยแล้ว!`);
    }

    let teacherProjSubTab = 'projects';

    function setTeacherProjSubTab(tab) {
      teacherProjSubTab = tab === 'members' ? 'members' : 'projects';
      const btnProj = document.getElementById('btnTeacherSubTabProjects');
      const btnMem = document.getElementById('btnTeacherSubTabMembers');
      const projList = document.getElementById('teacherAssessmentTasksContainer');
      const memPanel = document.getElementById('teacherCourseMembersPanel');
      const createBtn = document.getElementById('btnTeacherCreateProject');

      const activeCls = 'px-4 py-1.5 rounded-full bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs transition pressable';
      const inactiveCls = 'px-4 py-1.5 rounded-full text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition pressable';

      if (btnProj) btnProj.className = teacherProjSubTab === 'projects' ? activeCls : inactiveCls;
      if (btnMem) btnMem.className = teacherProjSubTab === 'members' ? activeCls : inactiveCls;
      if (projList) projList.classList.toggle('hidden', teacherProjSubTab !== 'projects');
      if (memPanel) memPanel.classList.toggle('hidden', teacherProjSubTab !== 'members');
      if (createBtn) createBtn.classList.toggle('hidden', teacherProjSubTab !== 'projects');

      if (teacherProjSubTab === 'members') {
        renderTeacherCourseMembersPanel();
      }
    }

    function renderTeacherCourseMembersPanel() {
      const body = document.getElementById('teacherCourseMembersBody');
      if (!body) return;
      body.innerHTML = '';

      const query = (document.getElementById('teacherCourseMembersSearchInput')?.value || '').toLowerCase().trim();
      const sortMode = document.getElementById('teacherCourseMembersSortSelect')?.value || 'id-asc';
      const allIds = Object.keys(studentDirectory || {});

      const countSpan = document.getElementById('teacherSubTabMembersCount');
      if (countSpan) countSpan.innerText = allIds.length;

      const list = allIds
        .map(id => getStudentSubmissionSummary(id))
        .filter(sum => {
          const s = sum.student;
          if (!s) return false;
          if (!query) return true;
          return s.id.toLowerCase().includes(query) ||
            s.fullName.toLowerCase().includes(query) ||
            s.email.toLowerCase().includes(query);
        })
        .sort((a, b) => {
          if (sortMode === 'id-desc') return b.student.id.localeCompare(a.student.id, undefined, { numeric: true });
          if (sortMode === 'name-asc') return a.student.fullName.localeCompare(b.student.fullName);
          return a.student.id.localeCompare(b.student.id, undefined, { numeric: true });
        });

      if (list.length === 0) {
        body.innerHTML = '<div class="py-10 text-center text-xs text-neutral-400">ไม่พบรายชื่อนักศึกษาที่ค้นหา</div>';
        return;
      }

      list.forEach(sum => {
        const s = sum.student;
        const row = document.createElement('div');
        row.className = 'grid grid-cols-12 items-center py-2.5 px-4 hover:bg-slate-50 dark:hover:bg-neutral-800/60 transition text-xs';
        row.innerHTML = `
          <div class="col-span-5 sm:col-span-4 flex items-center gap-2.5 min-w-0 pr-2">
            <div class="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 border border-blue-200/70 dark:border-blue-800/50 flex items-center justify-center font-bold text-xs shrink-0">
              ${escapeHtml(s.initials)}
            </div>
            <div class="min-w-0">
              <span class="font-mono font-bold text-neutral-900 dark:text-white truncate block">${escapeHtml(s.id)}</span>
              <span class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate block">${escapeHtml(s.fullName)}</span>
            </div>
          </div>
          <div class="col-span-5 sm:col-span-5 hidden sm:block text-[11px] text-neutral-500 dark:text-neutral-400 truncate pr-2">
            ${escapeHtml(s.email)}
          </div>
          <div class="col-span-7 sm:col-span-3 flex items-center justify-end gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${sum.hasSubmittedAny ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'}">
              ${sum.submittedCount}/${sum.totalCount} Tasks
            </span>
          </div>
        `;
        body.appendChild(row);
      });
    }

    function renderTeacherReviewScreen() {
      const currentTeacher = getCurrentTeacher();
      const allowedCodes = getTeacherAssignedCourseCodes(currentTeacher);
      if (currentUserRole === 'teacher' && (!activeCourseId || !allowedCodes.includes(activeCourseId))) {
        activeCourseId = allowedCodes[0] || 'CMM321';
      }
      const course = coursesCatalog[activeCourseId] || coursesCatalog[allowedCodes[0]] || coursesCatalog['CMM321'];
      if (!course) return;

      const assessView = document.getElementById('teacherAssessmentListView');
      const studentsView = document.getElementById('teacherStudentListView');
      const taskEditView = document.getElementById('teacherTaskEditView');
      const gradeView = document.getElementById('teacherGradingDetailView');

      const projTasksView = document.getElementById('teacherProjectTasksView');
      if (assessView) assessView.classList.toggle('hidden', teacherReviewViewMode !== 'assessment');
      if (projTasksView) projTasksView.classList.toggle('hidden', teacherReviewViewMode !== 'projectTasks');
      if (studentsView) studentsView.classList.toggle('hidden', teacherReviewViewMode !== 'students');
      if (teacherReviewViewMode === 'projectTasks') renderTeacherProjectTasks();
      if (taskEditView) taskEditView.classList.toggle('hidden', teacherReviewViewMode !== 'editTask');
      if (gradeView) gradeView.classList.toggle('hidden', teacherReviewViewMode !== 'grading');

      const memberFilterPill = document.getElementById('teacherMemberFilterPill');
      if (memberFilterPill) {
        if (teacherTaskScope === 'member' && activeReviewStudentId) {
          const prof = getStudentProfile(activeReviewStudentId);
          memberFilterPill.classList.remove('hidden');
          memberFilterPill.innerHTML = `
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold shadow-2xs">
              <span>Viewing: ${escapeHtml(prof.shortName)} (${prof.id})</span>
              <button onclick="clearTeacherMemberFilter()" title="Clear member filter and view all tasks" class="hover:opacity-75 text-[11px] ml-1">✕</button>
            </span>
          `;
        } else {
          memberFilterPill.classList.add('hidden');
          memberFilterPill.innerHTML = '';
        }
      }

      ensureRelationalIntegrity();
      const tasksList = course.tasks || [];
      const courseProjects = studentProjectsList.filter(p => p.course === course.code);
      const totalStudentsInDir = Object.keys(studentDirectory).length;

      const completedTasksCount = tasksList.filter(t => t.isFinished || (t.status && t.status.toLowerCase().includes('graded'))).length;
      const pctCourse = tasksList.length > 0 ? Math.round((completedTasksCount / tasksList.length) * 100) : 0;

      const courseCodeEl = document.getElementById('teacherReviewCourseCode');
      if (courseCodeEl) courseCodeEl.innerText = course.code;
      const courseNameEl = document.getElementById('teacherReviewCourseName');
      if (courseNameEl) courseNameEl.innerText = course.title;
      const instructorEl = document.getElementById('teacherReviewInstructor');
      if (instructorEl) instructorEl.innerText = `Instructor: ${course.teacher || currentTeacher.fullName}`;
      const tasksCountEl = document.getElementById('teacherTotalTasksCount');
      if (tasksCountEl) tasksCountEl.innerText = courseProjects.length || tasksList.length;
      const studentsCountEl = document.getElementById('teacherTotalStudentsCount');
      if (studentsCountEl) studentsCountEl.innerText = totalStudentsInDir;
      const subTabCountEl = document.getElementById('teacherSubTabMembersCount');
      if (subTabCountEl) subTabCountEl.innerText = totalStudentsInDir;
      if (teacherProjSubTab === 'members') renderTeacherCourseMembersPanel();
      const donutPercentEl = document.getElementById('teacherReviewDonutPercent');
      if (donutPercentEl) donutPercentEl.innerText = `${pctCourse}%`;
      const donutPathEl = document.getElementById('teacherReviewDonutPath');
      if (donutPathEl) donutPathEl.setAttribute('stroke-dasharray', `${pctCourse}, 100`);

      const tableContainer = document.getElementById('teacherAssessmentTasksContainer');
      if (tableContainer) {
        tableContainer.innerHTML = '';

        const itemsToRender = courseProjects.length > 0
          ? courseProjects.map(p => {
              const projTasks = tasksList.filter(t => t.projectId === p.id);
              const linkedTask = projTasks[0] || tasksList[0];
              const taskCount = projTasks.length;
              const memberNamesSet = new Set();
              (p.members || []).forEach(mStr => {
                const parts = String(mStr).trim().split(/\s+/);
                const name = /^\d+$/.test(parts[0]) ? parts.slice(1).join(' ') : mStr;
                if (name) memberNamesSet.add(name);
              });
              projTasks.forEach(t => {
                (t.members || []).forEach(m => {
                  if (m && m.name) memberNamesSet.add(m.name);
                });
              });
              const projMembers = [...memberNamesSet];
              return {
                id: p.id,
                title: p.title,
                description: p.description || 'Course student project deliverables',
                publishDate: p.createdAt || (linkedTask ? linkedTask.publishDate : 'Sep 18, 2026'),
                due: p.dueDate || (linkedTask ? linkedTask.due : 'Sep 30, 2026'),
                members: projMembers,
                statusText: `${taskCount} ${taskCount === 1 ? 'Task' : 'Tasks'}`,
                isDone: false,
                pct: 55
              };
            })
          : tasksList.map(t => ({
              id: t.id,
              title: t.title.replace(/^Task\s*\d+\s*:\s*/i, ''),
              description: t.description || 'Course project deliverable',
              publishDate: t.publishDate || 'Sep 18, 2026',
              due: t.due,
              statusText: t.isFinished ? 'Complete' : 'In Progress',
              isDone: !!t.isFinished,
              pct: t.isFinished ? 100 : 45
            }));

        if (itemsToRender.length === 0) {
          tableContainer.innerHTML = `
            <div class="p-8 text-center text-neutral-400 space-y-2 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl">
              <span class="text-2xl">📁</span>
              <p class="text-xs">No projects created for this course yet.</p>
            </div>
          `;
        } else {
          itemsToRender.forEach((item, idx) => {
            const isSelected = activeProjectId === item.id || selectedTeacherAssessmentTaskId === item.id || (idx === 0 && !activeProjectId);

            const row = document.createElement('div');
            row.onclick = () => inspectTeacherTask(item.id);
            row.className = 'bg-white dark:bg-neutral-900 hover:bg-slate-50/80 dark:hover:bg-neutral-800/80 rounded-2xl p-4 sm:p-5 border ' +
              (isSelected ? 'border-blue-500 ring-2 ring-blue-500/15' : 'border-neutral-200/80 dark:border-neutral-800') +
              ' transition pressable cursor-pointer shadow-xs';

            row.innerHTML = `
              <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div class="sm:col-span-5 min-w-0">
                  <h4 class="text-sm sm:text-base font-bold text-neutral-900 dark:text-white truncate">
                    ${escapeHtml(item.title)}
                  </h4>
                  <p class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    ${escapeHtml(item.description)}
                  </p>
                </div>

                <div class="grid grid-cols-2 gap-3 pt-2 mt-1 border-t border-neutral-200/70 dark:border-neutral-800 sm:border-t-0 sm:pt-0 sm:mt-0 sm:col-span-4 sm:grid-cols-2">
                  <div class="text-xs min-w-0">
                    <span class="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 block">${currentLanguage === 'th' ? 'วันที่ประกาศ' : 'Publish Date'}</span>
                    <span class="text-[11px] text-neutral-700 dark:text-neutral-300 font-medium truncate block">${escapeHtml(typeof formatBilingualDate === 'function' ? formatBilingualDate(item.publishDate, currentLanguage) : item.publishDate)}</span>
                  </div>
                  <div class="text-xs min-w-0">
                    <span class="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 block">${currentLanguage === 'th' ? 'กำหนดส่ง' : 'Due Date'}</span>
                    <span class="text-[11px] text-neutral-700 dark:text-neutral-300 font-medium truncate block">${escapeHtml(typeof formatBilingualDate === 'function' ? formatBilingualDate(item.due, currentLanguage) : item.due)}</span>
                  </div>
                </div>

                <div class="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2">
                  <span class="px-3 py-1 rounded-full text-[11px] font-bold ${item.isDone ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' : 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'}">
                    ${escapeHtml(item.statusText)}
                  </span>
                  <button type="button" onclick="event.stopPropagation(); openTeacherEditProjectModal('${item.id}')" class="px-3.5 py-1 rounded-full bg-slate-800 hover:bg-black dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white text-[10px] font-extrabold uppercase tracking-wider transition pressable shadow-2xs">
                    EDIT
                  </button>
                </div>
              </div>
            `;
            tableContainer.appendChild(row);
          });
        }
      }

      const memberCourseSelect = document.getElementById('teacherMemberCourseSelect');
      if (memberCourseSelect) {
        const selectableCodes = currentUserRole === 'teacher'
          ? allowedCodes
          : Object.keys(coursesCatalog || {});
        if (selectableCodes.length > 0) {
          memberCourseSelect.innerHTML = selectableCodes.map(code =>
            `<option value="${escapeHtml(code)}">${escapeHtml(code)}</option>`
          ).join('');
        }
        memberCourseSelect.value = course.code;
      }
      const stCourseCode = document.getElementById('teacherStudentCourseCode');
      if (stCourseCode) stCourseCode.innerText = course.code;
      const stCourseName = document.getElementById('teacherStudentCourseName');
      if (stCourseName) stCourseName.innerText = course.title;
      renderTeacherStudentTable(document.getElementById('teacherStudentSearchInput')?.value || '');

      const currentStudent = getStudentProfile(activeReviewStudentId || '67080500208');
      const activeTask = resolveTeacherReviewTask(course, currentStudent.id);

      const grCourseCode = document.getElementById('teacherGradingCourseCode');
      if (grCourseCode) grCourseCode.innerText = course.code;
      const grCourseTitle = document.getElementById('teacherGradingCourseTitle');
      if (grCourseTitle) grCourseTitle.innerText = course.title;
      const grTaskTitle = document.getElementById('teacherGradingTaskTitle');
      if (grTaskTitle && activeTask) grTaskTitle.innerText = activeTask.title;
      const grPubDate = document.getElementById('teacherGradingPublishDate');
      if (grPubDate && activeTask) grPubDate.innerText = activeTask.publishDate || 'October 1, 2026 at 23:00';
      const grDueDate = document.getElementById('teacherGradingDueDate');
      if (grDueDate && activeTask) grDueDate.innerText = activeTask.due || 'October 1, 2026 at 23:00';
      const grTaskDesc = document.getElementById('teacherGradingTaskDesc');
      if (grTaskDesc && activeTask) grTaskDesc.innerText = activeTask.description || 'Implement required math shaders and verify unit matrix transformations.';

      const teamContainer = document.getElementById('teacherGradingTeamMembersList');
      if (teamContainer) {
        teamContainer.innerHTML = '';
        const taskMembers = (activeTask && activeTask.members) || [];
        const members = taskMembers.length > 0
          ? taskMembers
          : [{ id: currentStudent.id, name: currentStudent.shortName, role: 'Leader' }];
        const teamCountEl = document.getElementById('teacherGradingTeamCount') || (teamContainer.parentElement && teamContainer.parentElement.querySelector('span'));
        if (teamCountEl) teamCountEl.innerText = `${members.length} ${members.length === 1 ? 'Member' : 'Members'}`;
        members.forEach(m => {
          const prof = getStudentProfile(m.id || m.name);
          const isTarget = prof.id === currentStudent.id;
          const chip = document.createElement('div');
          chip.className = `flex items-center gap-2.5 p-2.5 rounded-xl border transition ${
            isTarget
              ? 'bg-neutral-200/90 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 shadow-xs'
              : 'bg-neutral-100/90 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700'
          }`;
          chip.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
              ${escapeHtml(prof.initials.charAt(0))}
            </div>
            <div class="min-w-0">
              <span class="text-xs font-bold text-neutral-900 dark:text-white truncate block">${escapeHtml(prof.shortName)}</span>
              <span class="text-[10px] text-neutral-500 dark:text-neutral-400 block font-mono truncate">${prof.id} <span class="font-sans font-medium text-[9px]">(${escapeHtml(m.role)})</span></span>
            </div>
          `;
          teamContainer.appendChild(chip);
        });
      }

      const stuInfo = getStudentCourseTaskInfo(currentStudent.id, course.code, activeProjectId, activeTask ? activeTask.id : null);
      const revs = stuInfo.revisions || [];
      const revIdx = revs.length > 0 ? revs.length - 1 : -1;
      activeTeacherGradingRevisionIndex = revIdx;
      const activeRev = revIdx >= 0 ? revs[revIdx] : null;

      const stuBadgeEl = document.getElementById('teacherGradingStudentBadge');
      if (stuBadgeEl) stuBadgeEl.innerText = `${currentStudent.id} • ${currentStudent.fullName}`;

      const isThGr = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
      const scopeProjId = (activeTask && activeTask.projectId) || activeProjectId || null;
      const studentTasksInCourse = typeof getStudentTasksInCourse === 'function'
        ? getStudentTasksInCourse(currentStudent.id, course.code, scopeProjId)
        : (activeTask ? [activeTask] : []);
      const taskCountBadgeEl = document.getElementById('teacherGradingTaskCountBadge');
      if (taskCountBadgeEl) {
        const cnt = studentTasksInCourse.length || (activeTask ? 1 : 0);
        taskCountBadgeEl.innerText = isThGr ? `${cnt} งาน` : `${cnt} ${cnt === 1 ? 'Task' : 'Tasks'}`;
      }
      const taskSelectorBar = document.getElementById('teacherGradingTaskSelectorBar');
      if (taskSelectorBar) {
        const listToRender = studentTasksInCourse.length > 0 ? studentTasksInCourse : (activeTask ? [activeTask] : []);
        taskSelectorBar.innerHTML = listToRender.map((tItem, idx) => {
          const isSelected = activeTask && tItem.id === activeTask.id;
          const tRevs = ensureStudentSubmissionRevisions(tItem, currentStudent.id, course.code);
          const tLatest = tRevs.length > 0 ? tRevs[tRevs.length - 1] : null;
          const tStatusTag = !tLatest
            ? (isThGr ? 'ยังไม่ส่ง' : 'Not Submitted')
            : (tLatest.status === 'revision' ? (isThGr ? 'รอแก้' : 'Revision') : (isThGr ? 'ส่งแล้ว' : 'Submitted'));
          const pillCls = isSelected
            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
            : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700';
          const prefixLabel = isThGr ? `งานครั้งที่ ${idx + 1}:` : `Task #${idx + 1}:`;
          return `<button type="button" onclick="gradeStudentTask('${currentStudent.id}', '${tItem.id}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border transition pressable flex items-center gap-1.5 ${pillCls}"><span>${prefixLabel} ${escapeHtml(tItem.title)}</span><span class="text-[10px] opacity-80">(${tStatusTag})</span></button>`;
        }).join('');
      }

      const stuStatusBadgeEl = document.getElementById('teacherGradingStudentStatusBadge');
      if (stuStatusBadgeEl) {
        const st = stuInfo.submissionStatus;
        stuStatusBadgeEl.className = st === 'complete'
          ? 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
          : st === 'revision'
            ? 'px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
            : 'px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
        stuStatusBadgeEl.innerText = st === 'complete'
          ? (isThGr ? 'ส่งแล้ว' : 'Submitted')
          : st === 'revision'
            ? (isThGr ? 'รอแก้' : 'Revision')
            : (isThGr ? 'ยังไม่ส่ง' : 'Not Submitted');
      }

      const fileNameEl = document.getElementById('teacherGradingFileName');
      if (fileNameEl) {
        fileNameEl.innerText = activeRev ? activeRev.file : (isThGr ? 'ยังไม่มีไฟล์ส่งงาน' : 'No file submitted yet');
      }
      const fileMetaEl = document.getElementById('teacherGradingFileMeta');
      if (fileMetaEl) {
        const sizeLabel = (activeRev && activeRev.fileSize) ? activeRev.fileSize : '14.2 MB';
        const revStatusDisp = activeRev && activeRev.status === 'revision'
          ? (isThGr ? 'รอแก้' : 'Revision')
          : (isThGr ? 'ส่งแล้ว' : 'Submitted');
        fileMetaEl.innerText = activeRev
          ? (isThGr ? `${sizeLabel} • ส่งเมื่อ ${activeRev.submittedAt} (${revStatusDisp})` : `${sizeLabel} • Submitted ${activeRev.submittedAt} (${revStatusDisp})`)
          : (isThGr ? 'นักศึกษายังไม่ได้อัปโหลดไฟล์งาน' : 'Student has not uploaded a file yet');
      }
      const dlBtn = document.getElementById('btnTeacherGradingDownload');
      if (dlBtn) {
        dlBtn.classList.toggle('opacity-40', !activeRev);
        dlBtn.classList.toggle('pointer-events-none', !activeRev);
      }

      const scoreInputEl = document.getElementById('teacherGradingScoreInput');
      if (scoreInputEl && document.activeElement !== scoreInputEl) {
        const existingScoreNum = (activeRev && activeRev.score && activeRev.score !== 'Pending' && activeRev.score !== '-' && activeRev.score !== 'Revise')
          ? clampTeacherScoreNumber(activeRev.score)
          : null;
        scoreInputEl.value = existingScoreNum !== null ? `${existingScoreNum} / 10` : '';
      }

      const instNameEl = document.getElementById('teacherGradingInstructorName');
      if (instNameEl) instNameEl.innerText = `T. ${course.teacher || currentTeacher.fullName}`;

      const notesContainer = document.getElementById('teacherFeedbackNotesContainer');
      if (notesContainer && activeTask) {
        notesContainer.innerHTML = '';
        ensureRelationalIntegrity();
        const notesToShow = typeof getUnifiedTaskChatMessages === 'function'
          ? getUnifiedTaskChatMessages(activeTask, currentStudent.id, course.code)
          : (activeRev && Array.isArray(activeRev.notes) && activeRev.notes.length > 0 ? activeRev.notes : (activeTask.comments || []));
        if (notesToShow.length === 0) {
          notesContainer.innerHTML = '<p class="text-xs text-slate-400 italic">ยังไม่มีข้อเสนอแนะ</p>';
        } else {
          notesToShow.forEach(c => {
            const item = document.createElement('div');
            const isStd = c.role === 'student';
            item.className = isStd
              ? 'bg-sky-950/60 border border-sky-700/50 rounded-xl p-2.5 space-y-1'
              : 'space-y-1 pb-2.5 border-b border-slate-700/60 last:border-b-0';
            item.innerHTML = `
              <div class="flex items-center justify-between text-[11px] text-slate-400">
                <span class="font-bold ${isStd ? 'text-sky-300' : 'text-slate-200'}">${escapeHtml(c.author)}</span>
                <span class="text-[10px]">${escapeHtml(c.time || 'Just now')}</span>
              </div>
              <p class="text-xs text-white leading-relaxed font-medium">${escapeHtml(c.text)}</p>
            `;
            notesContainer.appendChild(item);
          });
          notesContainer.scrollTop = notesContainer.scrollHeight;
        }
      }
    }

    function openTeacherAddTaskModal() {
      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      const nextNum = (course.tasks.length + 1);
      const editIdEl = document.getElementById('teacherModalEditingTaskId');
      if (editIdEl) editIdEl.value = '';
      const rmBtn = document.getElementById('teacherModalRemoveTaskBtn');
      if (rmBtn) rmBtn.classList.add('hidden');

      const titleInput = document.getElementById('teacherAddTaskTitleInput');
      if (titleInput) titleInput.value = `Student Project ${nextNum}`;
      const dueInput = document.getElementById('teacherAddTaskDueInput');
      if (dueInput) dueInput.value = '2026-09-30';
      const timeInput = document.getElementById('teacherAddTaskTimeInput');
      if (timeInput) timeInput.value = '22:59';

      const modal = document.getElementById('modalTeacherAddTask');
      if (modal) modal.classList.remove('hidden');
    }

    function openTeacherEditProjectModal(itemId) {
      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      const proj = studentProjectsList.find(p => p.id === itemId);
      const task = course ? course.tasks.find(t => t.id === itemId || (proj && t.projectId === proj.id)) : null;
      if (!proj && !task) return;

      const editIdEl = document.getElementById('teacherModalEditingTaskId');
      if (editIdEl) editIdEl.value = proj ? proj.id : task.id;
      const rmBtn = document.getElementById('teacherModalRemoveTaskBtn');
      if (rmBtn) rmBtn.classList.remove('hidden');

      const titleInput = document.getElementById('teacherAddTaskTitleInput');
      if (titleInput) titleInput.value = proj ? proj.title : (task.title || '');
      const rawDue = (proj && proj.dueDate) || (task && task.due) || 'Sep 30, 2026';
      const parsedDue = typeof parseTaskDueDateTime === 'function' ? parseTaskDueDateTime(rawDue) : { dateVal: '2026-09-30', timeVal: '22:59' };
      const dueInput = document.getElementById('teacherAddTaskDueInput');
      if (dueInput) dueInput.value = parsedDue.dateVal || '2026-09-30';
      const timeInput = document.getElementById('teacherAddTaskTimeInput');
      if (timeInput) timeInput.value = parsedDue.timeVal || '22:59';

      const modal = document.getElementById('modalTeacherAddTask');
      if (modal) modal.classList.remove('hidden');
    }

    function closeTeacherAddTaskModal() {
      const modal = document.getElementById('modalTeacherAddTask');
      if (modal) modal.classList.add('hidden');
    }

    function removeSelectedTeacherTaskFromModal() {
      const editId = document.getElementById('teacherModalEditingTaskId')?.value;
      if (!editId) return;
      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      studentProjectsList = studentProjectsList.filter(p => p.id !== editId);
      saveStoredProjects(studentProjectsList);
      if (course) {
        course.tasks = course.tasks.filter(t => t.id !== editId && t.projectId !== editId);
        saveCoursesCatalog();
      }
      closeTeacherAddTaskModal();
      renderTeacherReviewScreen();
      alertMessage('Project removed successfully!');
    }

    function saveTeacherNewAssessmentTask() {
      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      const editId = document.getElementById('teacherModalEditingTaskId')?.value;
      const title = document.getElementById('teacherAddTaskTitleInput')?.value.trim() || `Student Project ${course.tasks.length + 1}`;
      const dueDatePart = document.getElementById('teacherAddTaskDueInput')?.value.trim() || '2026-09-30';
      const dueTimePart = document.getElementById('teacherAddTaskTimeInput')?.value.trim() || '22:59';
      const due = typeof formatTaskDueDateTime === 'function' ? formatTaskDueDateTime(dueDatePart, dueTimePart) : `${dueDatePart} (${dueTimePart})`;

      if (editId) {
        const existingProj = studentProjectsList.find(p => p.id === editId);
        if (existingProj) {
          existingProj.title = title;
          existingProj.dueDate = due;
          saveStoredProjects(studentProjectsList);
        }
        const matchingTasks = course.tasks.filter(t => t.id === editId || t.projectId === editId);
        matchingTasks.forEach(t => {
          if (t.id === editId || matchingTasks.length === 1) t.title = title;
          t.due = due;
        });
        if (typeof syncAllATHTData === 'function') syncAllATHTData();
        else saveCoursesCatalog();
        closeTeacherAddTaskModal();
        renderTeacherReviewScreen();
        alertMessage(`Project "${title}" updated!`);
        return;
      }

      const newProjId = `proj-${course.code.toLowerCase()}-${Date.now()}`;
      const curTch = typeof getCurrentTeacher === 'function' ? getCurrentTeacher() : { id: 'suripong.ler', shortName: 'Prof. Suripong L.' };

      studentProjectsList.push({
        id: newProjId,
        title: title,
        course: course.code,
        description: 'Course project deliverable.',
        url: 'https://github.com/atht-kmutt/course-project',
        createdBy: curTch.id,
        createdByName: curTch.shortName,
        members: [],
        status: 'In Progress',
        createdAt: new Date().toISOString().slice(0, 10),
        dueDate: due
      });
      activeProjectId = newProjId;
      activeProjectsFilter = course.code;
      selectedTeacherAssessmentTaskId = null;
      saveStoredProjects(studentProjectsList);
      if (typeof syncAllATHTData === 'function') syncAllATHTData();
      else saveCoursesCatalog();
      if (typeof pushAppNotification === 'function') {
        pushAppNotification({
          type: 'submission',
          targetRole: 'student',
          course: course.code,
          title: `${curTch.shortName} เพิ่มโปรเจกต์ใหม่: ${title}`,
          taskTitle: `${course.code} • Due ${due}`,
          projectId: newProjId,
          time: 'Just now',
          isNew: true
        });
      }
      if (window.__ATHT_SQL_SYNC && typeof window.__ATHT_SQL_SYNC.flushNow === 'function') {
        setTimeout(() => window.__ATHT_SQL_SYNC.flushNow(), 20);
      }

      closeTeacherAddTaskModal();
      renderTeacherReviewScreen();
      alertMessage(currentLanguage === 'th'
        ? `สร้างโปรเจกต์ "${title}" เรียบร้อย! นักศึกษาสามารถเข้าไปสร้าง Task เองได้`
        : `Project "${title}" created! Students can now add their own tasks.`);
    }

    function removeSelectedTeacherTask() {
      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      if (!selectedTeacherAssessmentTaskId) {
        if (course.tasks.length === 0) {
          alertMessage("No tasks available to remove.");
          return;
        }
        const confirmRemove = confirm(`No task selected. Do you want to remove the last task: "${course.tasks[course.tasks.length - 1].title}"?`);
        if (confirmRemove) {
          const removed = course.tasks.pop();
          if (typeof syncAllATHTData === 'function') syncAllATHTData();
          else {
            if (typeof ensureRelationalIntegrity === 'function') ensureRelationalIntegrity();
            if (typeof saveCoursesCatalog === 'function') saveCoursesCatalog();
          }
          renderTeacherReviewScreen();
          alertMessage(`Removed task: "${removed.title}"`);
        }
        return;
      }

      const taskIndex = course.tasks.findIndex(t => t.id === selectedTeacherAssessmentTaskId);
      if (taskIndex !== -1) {
        const removed = course.tasks.splice(taskIndex, 1)[0];
        selectedTeacherAssessmentTaskId = null;
        if (typeof syncAllATHTData === 'function') syncAllATHTData();
        else {
          if (typeof ensureRelationalIntegrity === 'function') ensureRelationalIntegrity();
          if (typeof saveCoursesCatalog === 'function') saveCoursesCatalog();
        }
        renderTeacherReviewScreen();
        alertMessage(`Task "${removed.title}" removed successfully!`);
      }
    }

    function openStepCommentModal(stepId) {
      activeReviewStepId = stepId;
      const proj = teacherProjects.find(p => p.id === activeReviewProjectId);
      if (!proj) return;
      const step = proj.steps.find(s => s.id === stepId);
      if (!step) return;

      const currentStudent = getStudentProfile(activeReviewStudentId || proj.students[0]?.id);
      const studentMember = proj.students.find(s => s.id === currentStudent.id) || { role: 'Member' };

      if (!step.evaluationsByStudent) step.evaluationsByStudent = {};
      if (!step.evaluationsByStudent[currentStudent.id]) {
        step.evaluationsByStudent[currentStudent.id] = {
          status: step.status,
          score: step.score,
          comments: [...step.comments]
        };
      }
      const studentEval = step.evaluationsByStudent[currentStudent.id];

      document.getElementById('modalStepNumberTag').innerText = `Step ${step.number} Evaluation`;
      document.getElementById('modalStepTitleText').innerText = step.title;
      document.getElementById('modalStepFileName').innerText = `Attachment: student_${currentStudent.id}_${step.fileName}`;

      const studentTextEl = document.getElementById('modalStepStudentText');
      if (studentTextEl) {
        studentTextEl.innerText = `${currentStudent.fullName} (${currentStudent.id}) • ${studentMember.role}`;
      }

      document.getElementById('modalStepStatusSelect').value = studentEval.status;
      document.getElementById('modalStepScoreInput').value = studentEval.score === 'Pending' ? '9.0' : parseFloat(studentEval.score) || 9.0;
      document.getElementById('modalStepCommentText').value = '';

      const historyContainer = document.getElementById('modalStepCommentsHistory');
      if (historyContainer) {
        historyContainer.innerHTML = studentEval.comments.map(c => `
          <div class="bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg text-xs space-y-0.5 border border-neutral-200 dark:border-neutral-700">
            <div class="flex items-center justify-between text-[9px] text-neutral-500">
              <span class="font-bold text-neutral-800 dark:text-neutral-200">${escapeHtml(c.author)}</span>
              <span>${escapeHtml(c.time)}</span>
            </div>
            <p class="text-neutral-700 dark:text-neutral-300 text-[11px]">${escapeHtml(c.text)}</p>
          </div>
        `).join('') || '<p class="text-[10px] text-neutral-400 italic">No feedback posted yet.</p>';
      }

      const modal = document.getElementById('modalStepComment');
      if (modal) modal.classList.remove('hidden');
    }

    function closeStepCommentModal() {
      const modal = document.getElementById('modalStepComment');
      if (modal) modal.classList.add('hidden');
    }

    function saveStepEvaluation() {
      const proj = teacherProjects.find(p => p.id === activeReviewProjectId);
      if (!proj) return;
      const step = proj.steps.find(s => s.id === activeReviewStepId);
      if (!step) return;

      const currentStudent = getStudentProfile(activeReviewStudentId || proj.students[0]?.id);

      const newStatus = document.getElementById('modalStepStatusSelect').value;
      const newScore = document.getElementById('modalStepScoreInput').value;
      const commentText = document.getElementById('modalStepCommentText').value.trim();

      if (!step.evaluationsByStudent) step.evaluationsByStudent = {};
      if (!step.evaluationsByStudent[currentStudent.id]) {
        step.evaluationsByStudent[currentStudent.id] = {
          status: step.status,
          score: step.score,
          comments: [...step.comments]
        };
      }
      const studentEval = step.evaluationsByStudent[currentStudent.id];

      studentEval.status = newStatus;
      studentEval.score = `${newScore}/10`;

      if (commentText) {
        studentEval.comments.push({
          author: `Prof. Suripong Lertkul (to ${currentStudent.shortName})`,
          time: 'Just now',
          text: commentText
        });

        step.comments.push({
          author: `Prof. Suripong Lertkul (to ${currentStudent.shortName})`,
          time: 'Just now',
          text: commentText
        });
      }

      step.status = newStatus;
      const allDone = proj.steps.every(s => s.status === 'Approved');
      if (allDone) {
        proj.overallStatus = 'Approved';
      } else if (proj.steps.some(s => s.status === 'Revision Requested')) {
        proj.overallStatus = 'Revision Requested';
      } else {
        proj.overallStatus = 'Needs Review';
      }

      for (const c of Object.values(coursesCatalog)) {
        const found = c.tasks.find(t => proj.id.includes(t.id) || t.title.toLowerCase().includes(proj.taskTitle.toLowerCase()));
        if (found) {
          found.score = `${newScore}/10`;
          found.status = `Graded (${newScore}/10)`;
          found.isFinished = true;
          if (found.members) {
            const m = found.members.find(x => x.id === currentStudent.id || x.name.includes(currentStudent.shortName));
            if (m) {
              m.score = `${newScore}/10`;
              m.taskStatus = `Graded (${newScore}/10)`;
            }
          }
          break;
        }
      }

      closeStepCommentModal();
      renderTeacherReviewScreen();
      alertMessage(`Evaluation & grade for ${currentStudent.shortName} saved!`);
    }

    let activeModalGroupCanManage = true;

    function getTaskCurrentLeaderId(task) {
      if (!task) return '';
      const explicitLeader = (task.members || []).find(m => m && m.role === 'Leader');
      if (explicitLeader && explicitLeader.id) return explicitLeader.id;
      if (task.members && task.members[0] && task.members[0].id) return task.members[0].id;
      return task.createdBy || '';
    }

    function openMemberEditModalForTask(taskId) {
      editingTaskId = taskId;
      let targetTask = null;
      for (const c of Object.values(coursesCatalog)) {
        const found = c.tasks.find(t => t.id === taskId);
        if (found) {
          targetTask = found;
          break;
        }
      }

      if (!targetTask) return;
      if (targetTask.projectId) activeProjectId = targetTask.projectId;

      const leaderId = getTaskCurrentLeaderId(targetTask);
      const curStd = typeof getCurrentStudent === 'function' ? getCurrentStudent() : null;
      const isLeaderOrCreator = Boolean(curStd && (curStd.id === leaderId || curStd.id === targetTask.createdBy));
      activeModalGroupCanManage = (currentUserRole === 'admin') || (currentUserRole === 'student' && isLeaderOrCreator);

      document.getElementById('modalTaskTargetSubtitle').innerText = `${targetTask.title} Team`;
      tempModalMembers = JSON.parse(JSON.stringify(targetTask.members || [])).map((m, idx) => ({
        ...m,
        role: m.role === 'Leader' || (idx === 0 && !(targetTask.members || []).some(x => x && x.role === 'Leader')) ? 'Leader' : 'Member'
      }));

      const hintEl = document.getElementById('modalMemberLeaderHint');
      const isTh = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
      if (hintEl) {
        hintEl.innerText = activeModalGroupCanManage
          ? (isTh ? '👑 หัวหน้ากลุ่ม (Leader) สามารถโอนสิทธิ์ให้สมาชิกคนอื่น หรือลบกลุ่ม/โปรเจกต์ที่สร้างขึ้นเองได้' : '👑 Group Leader can transfer leadership to any member or delete the created group/project.')
          : (isTh ? '🔒 ดูรายชื่อสมาชิก (เฉพาะหัวหน้ากลุ่มหรือแอดมินเท่านั้นที่แก้ไข/โอนสิทธิ์หรือลบกลุ่มได้)' : '🔒 Read-only team view (Only the Group Leader or Admin can edit, transfer leadership, or delete).');
      }

      const addBtn = document.getElementById('btnAddMemberInModal');
      const remBtn = document.getElementById('btnRemoveMemberInModal');
      const saveBtn = document.getElementById('btnSaveMembersInModal');
      const delGroupBtn = document.getElementById('btnDeleteGroupInModal');
      const delGroupLbl = document.getElementById('btnDeleteGroupInModalLabel');
      if (addBtn) addBtn.classList.toggle('hidden', !activeModalGroupCanManage);
      if (remBtn) remBtn.classList.toggle('hidden', !activeModalGroupCanManage);
      if (saveBtn) saveBtn.classList.toggle('hidden', !activeModalGroupCanManage);
      if (delGroupBtn) {
        const linkedProj = (studentProjectsList || []).find(p => p && (p.id === targetTask.projectId || p.id === activeProjectId));
        const canDel = activeModalGroupCanManage && (Boolean(linkedProj) || currentUserRole === 'admin' || currentUserRole === 'student');
        delGroupBtn.classList.toggle('hidden', !canDel);
      }
      if (delGroupLbl) {
        delGroupLbl.innerText = isTh ? 'ลบกลุ่ม / โปรเจกต์' : 'Delete Group';
      }

      renderModalMembersList();

      const modal = document.getElementById('modalMemberEdit');
      if (modal) modal.classList.remove('hidden');
    }

    function transferModalMemberLeadership(idx) {
      if (!activeModalGroupCanManage) return;
      if (idx < 0 || idx >= tempModalMembers.length) return;
      const chosen = tempModalMembers.splice(idx, 1)[0];
      chosen.role = 'Leader';
      tempModalMembers.forEach(m => { m.role = 'Member'; });
      tempModalMembers.unshift(chosen);
      renderModalMembersList();
    }

    function renderModalMembersList() {
      const container = document.getElementById('modalMembersList');
      if (!container) return;
      container.innerHTML = '';

      const allStudents = Object.values(studentDirectory);
      const isTh = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';

      tempModalMembers.forEach((m, idx) => {
        const isLeader = m.role === 'Leader' || idx === 0;
        const row = document.createElement('div');
        row.className = 'flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white dark:bg-neutral-800 p-2 rounded-xl border ' +
          (isLeader ? 'border-amber-300 dark:border-amber-700' : 'border-neutral-200 dark:border-neutral-700') +
          ' shadow-2xs';

        const optionsHtml = allStudents.map(s => {
          const isSel = s.id === m.id || (m.name && s.shortName.toLowerCase() === m.name.toLowerCase());
          return `<option value="${s.id}" ${isSel ? 'selected' : ''}>${escapeHtml(s.shortName)} (${s.id})</option>`;
        }).join('');

        const disabledAttr = activeModalGroupCanManage ? '' : 'disabled';
        row.innerHTML = `
          <div class="w-7 h-7 rounded-full ${isLeader ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 border-blue-200/70 dark:border-blue-800/50'} border flex items-center justify-center text-[10px] font-bold shrink-0">
            ${isLeader ? '👑' : (m.name ? escapeHtml(m.name.charAt(0)) : '?')}
          </div>
          <div class="flex-1 min-w-[140px]">
            <select ${disabledAttr} onchange="updateModalMemberStudent(${idx}, this.value)" class="w-full bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white rounded-lg px-2 py-1.5 border border-neutral-200 dark:border-neutral-700 focus:outline-none">
              ${optionsHtml}
            </select>
          </div>
          <select ${disabledAttr} onchange="updateModalMemberRole(${idx}, this.value)" class="bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-[10px] font-semibold rounded-lg px-2 py-1.5 border border-neutral-200 dark:border-neutral-700 focus:outline-none">
            <option value="Leader" ${isLeader ? 'selected' : ''}>👑 Leader</option>
            <option value="Member" ${!isLeader ? 'selected' : ''}>Member</option>
          </select>
          ${(!isLeader && activeModalGroupCanManage) ? `
            <button type="button" onclick="transferModalMemberLeadership(${idx})" title="${isTh ? 'โอนสิทธิ์หัวหน้ากลุ่มให้คนนี้' : 'Transfer Leadership'}" class="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold whitespace-nowrap transition">
              ${isTh ? 'ตั้งเป็นหัวหน้า' : 'Make Leader'}
            </button>
          ` : ''}
        `;
        container.appendChild(row);
      });
    }

    function updateModalMemberStudent(idx, studentId) {
      if (!activeModalGroupCanManage) return;
      const prof = getStudentProfile(studentId);
      if (tempModalMembers[idx] && prof) {
        tempModalMembers[idx].id = prof.id;
        tempModalMembers[idx].name = prof.shortName;
        renderModalMembersList();
      }
    }

    function updateModalMemberName(idx, val) {
      if (tempModalMembers[idx]) {
        tempModalMembers[idx].name = val;
      }
    }

    function updateModalMemberRole(idx, val) {
      if (!activeModalGroupCanManage) return;
      if (tempModalMembers[idx]) {
        if (val === 'Leader') {
          transferModalMemberLeadership(idx);
        } else {
          tempModalMembers[idx].role = val;
          if (!tempModalMembers.some(m => m.role === 'Leader') && tempModalMembers.length > 0) {
            tempModalMembers[0].role = 'Leader';
          }
          renderModalMembersList();
        }
      }
    }

    function addMemberToModal() {
      if (!activeModalGroupCanManage) return;
      const existingIds = new Set(tempModalMembers.map(m => m.id));
      const available = Object.values(studentDirectory).filter(s => !existingIds.has(s.id));
      const nextStudent = available.length > 0
        ? available[Math.floor(Math.random() * available.length)]
        : { id: `670805002${String(Math.floor(10 + Math.random() * 70)).padStart(2, '0')}`, shortName: `Student #${tempModalMembers.length + 1}` };

      tempModalMembers.push({
        name: nextStudent.shortName,
        role: 'Member',
        id: nextStudent.id
      });
      renderModalMembersList();
    }

    function removeLastMemberFromModal() {
      if (!activeModalGroupCanManage) return;
      if (tempModalMembers.length > 1) {
        tempModalMembers.pop();
        renderModalMembersList();
      } else {
        alertMessage("Team must have at least 1 member.");
      }
    }

    function deleteActiveGroupProjectFromModal(skipConfirm = false) {
      if (!activeModalGroupCanManage) return;
      let targetTask = null;
      let targetCourse = null;
      for (const c of Object.values(coursesCatalog || {})) {
        const found = (c.tasks || []).find(t => t.id === editingTaskId);
        if (found) {
          targetTask = found;
          targetCourse = c;
          break;
        }
      }
      const targetProjId = (targetTask && targetTask.projectId) || activeProjectId;
      const linkedProj = targetProjId ? (studentProjectsList || []).find(p => p && p.id === targetProjId) : null;
      if (linkedProj && typeof removeProject === 'function') {
        const deleted = removeProject(linkedProj.id, skipConfirm);
        if (deleted) {
          editingTaskId = null;
          closeMemberEditModal();
        }
        return;
      }
      if (targetTask && targetCourse) {
        const isTh = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
        if (skipConfirm || confirm(isTh ? `ลบงานกลุ่ม "${targetTask.title}" ใช่หรือไม่?` : `Delete group task "${targetTask.title}"?`)) {
          targetCourse.tasks = targetCourse.tasks.filter(t => t.id !== targetTask.id);
          editingTaskId = null;
          syncAllATHTData();
          if (window.__ATHT_SQL_SYNC && typeof window.__ATHT_SQL_SYNC.flushNow === 'function') {
            setTimeout(() => window.__ATHT_SQL_SYNC.flushNow(), 20);
          }
          closeMemberEditModal();
          navigateTo('course-detail');
          alertMessage(isTh ? 'ลบงานกลุ่มเรียบร้อยแล้ว' : 'Group task deleted.');
        }
      }
    }

    function saveMembersFromModal() {
      if (!activeModalGroupCanManage) {
        closeMemberEditModal();
        return;
      }
      let targetProjId = activeProjectId;
      let newLeaderProfile = null;

      if (editingCourseCode) {
        const course = coursesCatalog[editingCourseCode];
        if (course) {
          course.members = JSON.parse(JSON.stringify(tempModalMembers));
        }
        editingCourseCode = null;
      } else if (editingTaskId) {
        for (const c of Object.values(coursesCatalog)) {
          const found = c.tasks.find(t => t.id === editingTaskId);
          if (found) {
            if (found.projectId) targetProjId = found.projectId;
            const prevLeaderId = getTaskCurrentLeaderId(found);
            const orderedRaw = [...tempModalMembers];
            const leaderIdx = orderedRaw.findIndex(m => m && m.role === 'Leader');
            if (leaderIdx > 0) {
              const promoted = orderedRaw.splice(leaderIdx, 1)[0];
              orderedRaw.unshift(promoted);
            }
            const normalizedMembers = JSON.parse(JSON.stringify(orderedRaw)).map((m, idx) => {
              const mp = getStudentProfile(m.id || m.name);
              return {
                id: mp.id,
                name: mp.shortName,
                role: idx === 0 ? 'Leader' : 'Member',
                taskStatus: m.taskStatus || 'Active',
                score: m.score || 'Pending'
              };
            });
            const primaryId = normalizedMembers[0] && normalizedMembers[0].id;
            newLeaderProfile = primaryId ? getStudentProfile(primaryId) : null;
            const relatedTasks = found.projectId
              ? c.tasks.filter(t => t.id === editingTaskId || (t.projectId === found.projectId && (!prevLeaderId || t.createdBy === prevLeaderId || (t.members || []).some(m => m.id === prevLeaderId))))
              : [found];
            relatedTasks.forEach(t => {
              t.members = JSON.parse(JSON.stringify(normalizedMembers));
              if (primaryId) t.createdBy = primaryId;
              t.type = t.members.length <= 1 ? 'Individual' : (t.members.length === 2 ? 'Pair (2 Members)' : `Group Project (${t.members.length} Members)`);
            });
            break;
          }
        }
        editingTaskId = null;
      }

      const activeProj = studentProjectsList.find(p => p.id === targetProjId || p.id === activeProjectId);
      if (activeProj && tempModalMembers.length > 0) {
        const orderedRaw = [...tempModalMembers];
        const leaderIdx = orderedRaw.findIndex(m => m && m.role === 'Leader');
        if (leaderIdx > 0) {
          const promoted = orderedRaw.splice(leaderIdx, 1)[0];
          orderedRaw.unshift(promoted);
        }
        activeProj.members = orderedRaw.map(m => {
          const mp = getStudentProfile(m.id || m.name);
          return `${mp.id || ''} ${mp.shortName || m.name}`.trim();
        });
        if (newLeaderProfile) {
          activeProj.createdBy = newLeaderProfile.id;
          activeProj.createdByName = newLeaderProfile.shortName;
        }
        saveStoredProjects(studentProjectsList);
      }
      ensureRelationalIntegrity();
      saveCoursesCatalog();
      if (window.__ATHT_SQL_SYNC && typeof window.__ATHT_SQL_SYNC.flushNow === 'function') {
        setTimeout(() => window.__ATHT_SQL_SYNC.flushNow(), 20);
      }
      closeMemberEditModal();
      const isTh = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
      alertMessage(isTh
        ? (newLeaderProfile ? `บันทึกทีมและตั้ง ${newLeaderProfile.shortName} เป็นหัวหน้ากลุ่มเรียบร้อย!` : 'บันทึกรายชื่อสมาชิกกลุ่มเรียบร้อย!')
        : (newLeaderProfile ? `Team saved! Group Leader: ${newLeaderProfile.shortName}` : 'Team roster saved successfully!'));

      if (currentScreen === 'course-detail') {
        renderCourseDetailPage();
      } else if (currentScreen === 'task-detail') {
        renderTaskDetailPage();
      }
    }

    function closeMemberEditModal() {
      const modal = document.getElementById('modalMemberEdit');
      if (modal) modal.classList.add('hidden');
    }

    function toggleMobileDrawer(open) {
      const drawer = document.getElementById('mobileDrawer');
      const overlay = document.getElementById('drawerOverlay');
      if (!drawer || !overlay) return;

      const shouldOpen = open !== undefined ? open : drawer.classList.contains('translate-x-full');
      if (shouldOpen) {
        renderDrawerLinks();
        overlay.classList.remove('hidden');
        drawer.classList.remove('translate-x-full');
      } else {
        overlay.classList.add('hidden');
        drawer.classList.add('translate-x-full');
      }
    }

    function renderDrawerLinks() {
      const container = document.getElementById('dynamicDrawerNavLinks');
      if (!container) return;

      const isTeacher = currentUserRole === 'teacher';
      const isAdmin = currentUserRole === 'admin';
      const isTh = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';

      if (isAdmin) {
        container.innerHTML = `
          <button onclick="switchAdminTab('students'); drawerNavigate('admin')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between font-bold">
            <span>🎓 ${isTh ? 'จัดการนักศึกษา' : 'Manage Students'}</span>
            <span class="text-neutral-400">→</span>
          </button>
          <button onclick="switchAdminTab('teachers'); drawerNavigate('admin')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between font-bold">
            <span>👨‍🏫 ${isTh ? 'จัดการอาจารย์' : 'Manage Teachers'}</span>
            <span class="text-neutral-400">→</span>
          </button>
          <button onclick="switchAdminTab('all'); drawerNavigate('admin')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between">
            <span>👥 ${isTh ? 'รายชื่อทั้งหมด' : 'All Directory'}</span>
            <span class="text-neutral-400">→</span>
          </button>
          <button onclick="drawerNavigate('projects')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between">
            <span>📁 ${isTh ? 'โปรเจกต์' : 'Projects'}</span>
            <span class="text-neutral-400">→</span>
          </button>
          <button onclick="drawerNavigate('courses')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between">
            <span>📚 ${isTh ? 'รายวิชา' : 'Courses'}</span>
            <span class="text-neutral-400">→</span>
          </button>
          <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <span class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider px-3 block mb-1">${isTh ? 'สลับบทบาทมุมมองระบบ' : 'Portal Role Switcher'}</span>
            <button onclick="toggleMobileDrawer(false); switchRoleFromAdmin('student')" class="w-full text-left px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300">
              • ${isTh ? 'สลับเป็นมุมมองนักศึกษา' : 'Switch to Student View'}
            </button>
            <button onclick="toggleMobileDrawer(false); switchRoleFromAdmin('teacher')" class="w-full text-left px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300">
              • ${isTh ? 'สลับเป็นมุมมองอาจารย์' : 'Switch to Teacher View'}
            </button>
          </div>
        `;
        return;
      }

      if (isTeacher) {
        container.innerHTML = `
          <button onclick="navigateTo('teacher-dashboard'); toggleMobileDrawer(false);" class="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between">
            <span>${isTh ? 'หน้าหลัก' : 'Home'}</span>
            <span class="text-neutral-400">→</span>
          </button>
          <button onclick="switchTeacherViewMode('assessment'); drawerNavigate('teacher-review')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between">
            <span>${isTh ? 'รายวิชา' : 'Course'}</span>
            <span class="text-neutral-400">→</span>
          </button>
          <button onclick="drawerNavigate('projects')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between">
            <span>${isTh ? 'โปรเจกต์' : 'Project'}</span>
            <span class="text-neutral-400">→</span>
          </button>
          <button onclick="switchTeacherViewMode('students'); drawerNavigate('teacher-review')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between">
            <span>${isTh ? 'สมาชิก' : 'Members'}</span>
            <span class="text-neutral-400">→</span>
          </button>
          <button onclick="drawerNavigate('notifications')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between">
            <span>${isTh ? 'การแจ้งเตือน' : 'Notifications'}</span>
            <span class="text-neutral-400">→</span>
          </button>

          <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <span class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider px-3 block mb-1">${isTh ? 'กรองรายวิชาที่สอน' : 'Filter Taught Subjects'}</span>
            <button onclick="setTeacherCourseFilter('ALL'); drawerNavigate('teacher-dashboard');" class="w-full text-left px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300">
              ${isTh ? '• รายวิชาที่สอนทั้งหมด' : '• My Assigned Courses'}
            </button>
            ${getTeacherAssignedCourseCodes().map(code => {
              const c = coursesCatalog[code];
              return `<button onclick="setTeacherCourseFilter('${code}'); drawerNavigate('teacher-dashboard');" class="w-full text-left px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300">• ${escapeHtml(code)} ${escapeHtml(c ? c.title : '')}</button>`;
            }).join('')}
          </div>
        `;
      } else {
        const badgeTxt = (document.getElementById('pendingCountBadge')?.innerText || '').match(/\d+/)?.[0] || '0';
        container.innerHTML = `
          <button onclick="drawerNavigate('dashboard')" class="w-full text-left px-4 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between font-bold text-sm">
            <span>${isTh ? 'รายวิชา' : 'Course'}</span>
            <span class="text-neutral-400">→</span>
          </button>
          <button onclick="activeTasksCourseFilter = null; activeTasksProjectFilter = null; drawerNavigate('tasks-hub')" class="w-full text-left px-4 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between font-bold text-sm">
            <span class="flex items-center gap-2">
              <span>${isTh ? 'งานทั้งหมด' : 'All Tasks'}</span>
              <span class="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">${badgeTxt}</span>
            </span>
            <span class="text-neutral-400">→</span>
          </button>
          <button onclick="drawerNavigate('notifications')" class="w-full text-left px-4 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between font-bold text-sm">
            <span>${isTh ? 'การแจ้งเตือน' : 'Notification'}</span>
            <span class="text-neutral-400">→</span>
          </button>

          <div class="pt-3 mt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider px-4 block mb-1">${isTh ? 'เข้าถึงรายวิชาด่วน' : 'Quick Courses'}</span>
            ${(typeof getVisibleCourseCodesForCurrentRole === 'function' ? getVisibleCourseCodesForCurrentRole() : Object.keys(coursesCatalog || {})).map(code => {
              const c = coursesCatalog[code];
              if (!c) return '';
              const thaiTitles = {
                CMM321: 'คณิตศาสตร์คอมพิวเตอร์กราฟิก',
                CMM349: 'การพัฒนาเว็บแอปพลิเคชัน',
                CMM310: 'การออกแบบและพัฒนาเกม',
                CMM390: 'การจัดการโครงการ',
                CMM320: 'ฟิสิกส์แสงและเสียง',
                GEN121: 'การเรียนรู้และการแก้ปัญหา'
              };
              const dispTitle = isTh ? (c.titleTh || thaiTitles[code] || c.title) : c.title;
              return `<button onclick="drawerOpenCourse('${escapeHtml(code)}')" class="w-full text-left px-4 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300">• ${escapeHtml(code)} ${escapeHtml(dispTitle)}</button>`;
            }).join('')}
          </div>
        `;
      }
      if (typeof translateDOM === 'function' && currentLanguage === 'th') {
        translateDOM('th');
      }
    }

    function drawerNavigate(screenId) {
      toggleMobileDrawer(false);
      navigateTo(screenId);
    }

    function drawerOpenCourse(courseId) {
      toggleMobileDrawer(false);
      selectCourse(courseId);
    }

    function openLogoutModal() {
      const modal = document.getElementById('modalLogout');
      if (modal) modal.classList.remove('hidden');
    }

    function closeLogoutModal() {
      const modal = document.getElementById('modalLogout');
      if (modal) modal.classList.add('hidden');
    }

    function confirmSignOut() {
      closeLogoutModal();
      localStorage.removeItem('atht_is_logged_in');
      localStorage.removeItem('atht_remember_me');
      localStorage.removeItem('atht_current_screen');
      localStorage.removeItem('atht_user_role');
      localStorage.removeItem('atht_student_id');
      localStorage.removeItem('atht_teacher_id');
      localStorage.removeItem('atht_active_course');
      localStorage.removeItem('atht_active_task');
      navigationHistory = [];

      const emailInput = document.getElementById('loginEmail');
      const passInput = document.getElementById('loginPassword');
      if (emailInput) emailInput.value = '';
      if (passInput) passInput.value = '';

      ['signupStudentId', 'signupPassword', 'signupFullName', 'signupEmail'].forEach(fid => {
        const el = document.getElementById(fid);
        if (el) el.value = '';
      });
      if (typeof window !== 'undefined' && window.__ATHT_SQL_SYNC && typeof window.__ATHT_SQL_SYNC.clearServerAuthSession === 'function') {
        window.__ATHT_SQL_SYNC.clearServerAuthSession();
      }
      if (typeof switchAuthTab === 'function') switchAuthTab('login');

      navigateTo('login', false);
      alertMessage(t('signedOutMsg', 'Signed out safely.'));
    }

    function initLoginHeroParallax() {
      const heroPanel = document.getElementById('loginHeroPanel');
      const logoCard = document.getElementById('loginHeroLogoCard');
      if (!heroPanel || !logoCard || heroPanel.dataset.parallaxBound === '1') return;
      heroPanel.dataset.parallaxBound = '1';

      heroPanel.addEventListener('mousemove', (ev) => {
        if (!heroPanel.getBoundingClientRect) return;
        const rect = heroPanel.getBoundingClientRect();
        if (!rect || !rect.width || !rect.height) return;
        const nx = (ev.clientX - rect.left) / rect.width - 0.5;
        const ny = (ev.clientY - rect.top) / rect.height - 0.5;
        logoCard.style.setProperty('--hero-rx', `${(-ny * 18).toFixed(2)}deg`);
        logoCard.style.setProperty('--hero-ry', `${(nx * 20).toFixed(2)}deg`);
      });

      heroPanel.addEventListener('mouseleave', () => {
        logoCard.style.setProperty('--hero-rx', '0deg');
        logoCard.style.setProperty('--hero-ry', '0deg');
      });
    }

    window.onload = function() {
      initLoginHeroParallax();
      populateLoginDemoDropdowns();
      applyLanguage(localStorage.getItem('atht_lang') || 'en');
      updateThemeIcons(document.documentElement.classList.contains('dark'));

      const urlParams = new URLSearchParams(window.location.search);
      const isEmbed = urlParams.get('embed') === 'true' || urlParams.get('embed') === '1';

      if (isEmbed) {
        document.body.classList.add('embed-mode');
        if (urlParams.get('noheader') === 'true') {
          const header = document.querySelector('header');
          if (header) header.style.display = 'none';
          const breadcrumb = document.getElementById('breadcrumbBar');
          if (breadcrumb) breadcrumb.style.display = 'none';
        }
      }

      let isLoggedIn = localStorage.getItem('atht_is_logged_in') === 'true';
      const syncBridge = typeof window !== 'undefined' ? window.__ATHT_SQL_SYNC : null;
      const serverAuthOn = Boolean(syncBridge && typeof syncBridge.isServerAuthMode === 'function' && syncBridge.isServerAuthMode());
      if (serverAuthOn) {
        if (!syncBridge.isServerAuthenticated()) {
          isLoggedIn = false;
          localStorage.removeItem('atht_is_logged_in');
          localStorage.removeItem('atht_user_role');
        } else {
          const authUser = syncBridge.getAuthenticatedUser();
          if (authUser && authUser.role) {
            isLoggedIn = true;
            localStorage.setItem('atht_is_logged_in', 'true');
            localStorage.setItem('atht_user_role', authUser.role);
            if (authUser.role === 'teacher') localStorage.setItem('atht_teacher_id', authUser.id);
            if (authUser.role === 'student') localStorage.setItem('atht_student_id', authUser.id);
          }
        }
      }

      if (isLoggedIn) {
        const savedRole = localStorage.getItem('atht_user_role');
        if (!savedRole || !['student', 'teacher', 'admin'].includes(savedRole)) {
          confirmSignOut();
          return;
        }
        if (savedRole === 'teacher') {
          const tid = localStorage.getItem('atht_teacher_id');
          if (!tid || !teacherDirectory[tid] || (teacherDirectory[tid].status || 'Active') === 'Inactive') {
            confirmSignOut();
            return;
          }
        } else if (savedRole === 'student') {
          const sid = localStorage.getItem('atht_student_id');
          if (!sid || !studentDirectory[sid] || (studentDirectory[sid].status || 'Active') === 'Inactive') {
            confirmSignOut();
            return;
          }
        }
        currentUserRole = savedRole;
        activeCourseId = localStorage.getItem('atht_active_course') || 'CMM321';
        activeTaskId = localStorage.getItem('atht_active_task') || 'cmm321-t1';

        const parsedRoute = parseRouteHash(window.location.hash);
        const hash = window.location.hash.replace('#', '');
        const validScreens = [
          'dashboard', 'courses', 'course-detail', 'task-detail',
          'projects', 'tasks-hub', 'notifications', 'teacher-dashboard', 'teacher-review', 'admin'
        ];
        const defaultScreen = currentUserRole === 'admin' ? 'admin' : (currentUserRole === 'teacher' ? 'teacher-dashboard' : 'dashboard');
        const savedScreen = localStorage.getItem('atht_current_screen') || defaultScreen;
        let targetScreen = validScreens.includes(savedScreen) ? savedScreen : defaultScreen;
        if (parsedRoute && validScreens.includes(parsedRoute.screenId)) {
          targetScreen = parsedRoute.screenId;
          if (parsedRoute.activeCourseId) activeCourseId = parsedRoute.activeCourseId;
          if (parsedRoute.activeTaskId) activeTaskId = parsedRoute.activeTaskId;
          if (parsedRoute.activeTasksCourseFilter !== undefined) activeTasksCourseFilter = parsedRoute.activeTasksCourseFilter;
          if (parsedRoute.teacherReviewViewMode) teacherReviewViewMode = parsedRoute.teacherReviewViewMode;
        } else if (hash && validScreens.includes(hash)) {
          targetScreen = hash;
        }

        navigateTo(targetScreen, false);
      } else {

        const emailInput = document.getElementById('loginEmail');
        const passInput = document.getElementById('loginPassword');
        if (emailInput) emailInput.value = '';
        if (passInput) passInput.value = '';
        navigateTo('login', false);
      }
    };

    function enrichProjectsWithMilestones(list) {
      return list.map(p => {
        if (!p.tasks || p.tasks.length === 0) {
          p.tasks = [
            {
              id: p.id + '-t1',
              stepNumber: 1,
              title: 'Step 1: เสนอหัวข้อและขอบเขตโครงงาน (Proposal & Scope)',
              targetDate: '2026-09-15',
              description: 'กำหนดแนวคิด ขอบเขต และกลุ่มเป้าหมายผู้ใช้งานโครงงาน',
              status: 'Approved',
              progressPct: 100,
              submittedFile: p.course + '_Proposal_Final.pdf',
              submittedLink: p.url || 'https://github.com/atht-kmutt',
              submittedNote: 'ส่งเล่มข้อเสนอโครงการฉบับสมบูรณ์ครับ',
              submittedAt: '15 ก.ย. 2026',
              score: '9.5 / 10',
              feedbacks: [
                {
                  author: 'ผศ. สุริพงษ์ เลิศกุลทานนท์ (อาจารย์ที่ปรึกษา)',
                  role: 'teacher',
                  time: '16 ก.ย. 2026',
                  text: 'หัวข้อและขอบเขตชัดเจน อนุมัติให้เริ่มขั้นตอนออกแบบได้เลยครับ',
                  statusTag: 'Approved'
                }
              ]
            },
            {
              id: p.id + '-t2',
              stepNumber: 2,
              title: 'Step 2: ออกแบบ System Architecture & UI/UX Wireframe',
              targetDate: '2026-09-28',
              description: 'ออกแบบผังการทำงานของระบบ ฐานข้อมูล และ Wireframe การใช้งาน',
              status: (p.id === 'proj-1' ? 'Needs Review' : (p.id === 'proj-2' ? 'Revision Requested' : 'Approved')),
              progressPct: (p.id === 'proj-1' ? 85 : (p.id === 'proj-2' ? 60 : 100)),
              submittedFile: 'System_Architecture_Diagram.png',
              submittedLink: 'https://figma.com/@atht/design',
              submittedNote: 'ส่งผัง Architecture และ Wireframe ครับ',
              submittedAt: '28 ก.ย. 2026',
              score: (p.id === 'proj-3' ? '9.0 / 10' : null),
              feedbacks: (p.id === 'proj-2' ? [
                {
                  author: 'อาจารย์ที่ปรึกษา',
                  role: 'teacher',
                  time: '29 ก.ย. 2026',
                  text: 'กรุณาเพิ่ม Data Privacy และการยืนยันตัวตนใน API แล้วส่งใหม่อีกครั้งครับ',
                  statusTag: 'Revision Requested'
                }
              ] : [])
            },
            {
              id: p.id + '-t3',
              stepNumber: 3,
              title: 'Step 3: พัฒนา Prototype & ทดสอบระบบ',
              targetDate: '2026-10-20',
              description: 'สร้างต้นแบบแอปพลิเคชันและทดสอบการทำงานเบื้องต้น',
              status: 'Unfinished',
              progressPct: 20,
              submittedFile: null,
              submittedLink: null,
              submittedNote: null,
              submittedAt: null,
              score: null,
              feedbacks: []
            },
            {
              id: p.id + '-t4',
              stepNumber: 4,
              title: 'Step 4: สรุปผลและส่งมอบงานฉบับสมบูรณ์ (Final Deliverables)',
              targetDate: '2026-11-20',
              description: 'ทดสอบกับกลุ่มตัวอย่าง และจัดทำรูปเล่มรายงานฉบับสมบูรณ์',
              status: 'Unfinished',
              progressPct: 0,
              submittedFile: null,
              submittedLink: null,
              submittedNote: null,
              submittedAt: null,
              score: null,
              feedbacks: []
            }
          ];
        }
        return p;
      });
    }

    studentProjectsList = enrichProjectsWithMilestones(studentProjectsList);
    saveStoredProjects(studentProjectsList);

    let activeViewingProjectId = null;
    let projectsQuickFilterMode = 'all';

    function toggleProjectsQuickFilter(mode) {
      if (projectsQuickFilterMode === mode) {
        projectsQuickFilterMode = 'all';
      } else {
        projectsQuickFilterMode = mode;
      }

      const btnReview = document.getElementById('btnQuickFilterReview');
      const btnRevision = document.getElementById('btnQuickFilterRevision');

      if (btnReview) {
        if (projectsQuickFilterMode === 'review') {
          btnReview.className = 'px-3 py-1 rounded-full text-xs font-bold transition border border-amber-500 bg-amber-500 text-white shadow-xs flex items-center gap-1.5';
        } else {
          btnReview.className = 'px-3 py-1 rounded-full text-xs font-bold transition border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1.5 shadow-2xs';
        }
      }

      if (btnRevision) {
        if (projectsQuickFilterMode === 'revision') {
          btnRevision.className = 'px-3 py-1 rounded-full text-xs font-bold transition border border-rose-500 bg-rose-500 text-white shadow-xs';
        } else {
          btnRevision.className = 'px-3 py-1 rounded-full text-xs font-bold transition border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300';
        }
      }

      filterProjectsList();
    }

    const originalRenderProjectsCards = renderProjectsCards;
    renderProjectsCards = function(list) {
      const container = document.getElementById('projectsCardsContainer');
      if (!container) return;
      container.innerHTML = '';

      let displayList = list;
      if (projectsQuickFilterMode === 'review') {
        displayList = displayList.filter(p => (p.tasks || []).some(t => t.status === 'Needs Review'));
      } else if (projectsQuickFilterMode === 'revision') {
        displayList = displayList.filter(p => (p.tasks || []).some(t => t.status === 'Revision Requested'));
      }

      if (displayList.length === 0) {
        container.innerHTML = `
          <div class="col-span-full py-16 text-center space-y-3 bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <span class="text-4xl">📁</span>
            <h3 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">No Projects Found</h3>
            <p class="text-xs text-neutral-500 max-w-sm mx-auto">ไม่พบโครงงานที่ตรงกับเงื่อนไขการค้นหาหรือตัวกรอง</p>
          </div>
        `;
        return;
      }

      const isTeacher = currentUserRole === 'teacher';
      const isAdmin = currentUserRole === 'admin';
      const isTh = typeof currentLanguage !== 'undefined' ? currentLanguage === 'th' : true;
      const curStudent = getCurrentStudent();
      const resolveProjMembers = (proj) => {
        if (Array.isArray(proj.members) && proj.members.length > 0) return proj.members;
        const cObj = typeof coursesCatalog !== 'undefined' ? coursesCatalog[proj.course] : null;
        const seen = new Set();
        const out = [];
        if (cObj && Array.isArray(cObj.tasks)) {
          cObj.tasks.filter(t => t.projectId === proj.id).forEach(t => {
            const rawList = Array.isArray(t.assignees) && t.assignees.length ? t.assignees : (Array.isArray(t.memberIds) ? t.memberIds : []);
            rawList.forEach(item => {
              const idStr = String(item || '');
              const idMatch = idStr.match(/\d{11}/);
              const stuId = idMatch ? idMatch[0] : idStr;
              const stu = typeof studentDirectory !== 'undefined' ? studentDirectory[stuId] : null;
              const label = stu ? `${stu.id} ${stu.shortName || stu.fullName}` : idStr;
              if (label && !seen.has(label)) { seen.add(label); out.push(label); }
            });
          });
        }
        return out;
      };

      displayList.forEach(p => {
        const tasks = p.tasks || [];
        const totalTasks = tasks.length;
        const approvedTasks = tasks.filter(t => t.status === 'Approved').length;
        const pendingReviewTask = tasks.find(t => t.status === 'Needs Review');
        const revisionTask = tasks.find(t => t.status === 'Revision Requested');
        const pct = totalTasks > 0 ? Math.round((approvedTasks / totalTasks) * 100) : 0;
        const projMembers = resolveProjMembers(p);

        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition space-y-4';

        let statusBadgeHtml = '';
        if (isAdmin) {
          statusBadgeHtml = `
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              ${isTh ? 'โปรเจกต์' : 'Project'}
            </span>
          `;
        } else if (pendingReviewTask) {
          statusBadgeHtml = `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 animate-pulse">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>${isTh ? 'รอตรวจ:' : 'Needs Review:'} ${pendingReviewTask.title.split(':')[0]}</span>
            </span>
          `;
        } else if (revisionTask) {
          statusBadgeHtml = `
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200">
              <span>${isTh ? '⚠️ รอแก้ไข' : '⚠️ Revision'}</span>
            </span>
          `;
        } else if (pct === 100) {
          statusBadgeHtml = `
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200">
              <span>${isTh ? '✓ ผ่านครบทุก Step' : '✓ All Steps Approved'}</span>
            </span>
          `;
        } else {
          statusBadgeHtml = `
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              ${isTh ? 'กำลังทำ' : 'In Progress'}
            </span>
          `;
        }

        card.innerHTML = `
          <div class="space-y-3 cursor-pointer" onclick="openProjectMilestoneDetail('${p.id}')">

            <div class="flex items-center justify-between gap-2">
              <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                ${escapeHtml(p.course)}
              </span>
              ${statusBadgeHtml}
            </div>

            <div>
              <h3 class="font-bold text-base text-neutral-900 dark:text-white transition leading-snug line-clamp-2 hover:text-orange-600">
                ${escapeHtml(p.title)}
              </h3>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                ${escapeHtml(p.description)}
              </p>
            </div>

            ${!isAdmin ? `
            <div class="space-y-1.5 pt-1">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-neutral-500">${isTh ? 'ความก้าวหน้ารวม' : 'Overall Progress'}</span>
                <span class="text-orange-600 dark:text-orange-400 font-bold">${pct}%</span>
              </div>
              <div class="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div class="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500" style="width: ${pct}%;"></div>
              </div>
              <div class="flex justify-between text-[11px] text-neutral-400">
                <span>${isTh ? `${approvedTasks}/${totalTasks} ขั้นตอนผ่านแล้ว` : `${approvedTasks}/${totalTasks} steps approved`}</span>
                <span>${isTh ? `${totalTasks - approvedTasks} คงเหลือ` : `${totalTasks - approvedTasks} remaining`}</span>
              </div>
            </div>
            ` : ''}

            <div class="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div class="flex flex-wrap gap-1">
                ${projMembers.slice(0, 3).map(m => `
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    👤 ${escapeHtml(m.split(' ')[1] || m)}
                  </span>
                `).join('')}
              </div>
              <span class="text-[10px] text-neutral-400">${projMembers.length} ${isTh ? 'คน' : (projMembers.length === 1 ? 'member' : 'members')}</span>
            </div>
          </div>

          <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
            <button onclick="openProjectMilestoneDetail('${p.id}')" class="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              (!isAdmin && pendingReviewTask)
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200'
            }">
              <span>${isAdmin ? (isTh ? 'ดูรายละเอียดโปรเจกต์' : 'View Project Details') : (isTeacher ? (pendingReviewTask ? (isTh ? 'ตรวจงาน (รอตรวจ)' : 'Review Submission') : (isTh ? 'ตรวจความคืบหน้า' : 'Review Progress')) : (isTh ? 'เปิดแผนงาน & ส่งงาน' : 'Open Plan & Submit'))}</span>
              <span>→</span>
            </button>
            ${!isTeacher ? `
              <button onclick="removeProject('${p.id}', event)" title="Delete Project" class="p-2 rounded-xl text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs transition">
                🗑
              </button>
            ` : ''}
          </div>
        `;

        container.appendChild(card);
      });
    };

    function openProjectMilestoneDetail(projectId) {
      const p = studentProjectsList.find(x => x.id === projectId);
      if (!p) return;
      activeViewingProjectId = projectId;
      activeProjectId = projectId;
      activeCourseId = p.course;

      const cardsContainer = document.getElementById('projectsCardsContainer');
      const milestoneView = document.getElementById('projectDetailMilestoneView');
      if (cardsContainer) cardsContainer.classList.add('hidden');
      if (milestoneView) milestoneView.classList.remove('hidden');

      document.getElementById('pdetailCourseCode').textContent = p.course;
      document.getElementById('pdetailTitle').textContent = p.title;
      document.getElementById('pdetailDesc').textContent = p.description;

      const isTeacher = currentUserRole === 'teacher';
      const isAdmin = currentUserRole === 'admin';
      const isTh = typeof currentLanguage !== 'undefined' ? currentLanguage === 'th' : true;
      const roleBadge = document.getElementById('pdetailRoleBadge');
      if (roleBadge) {
        if (isAdmin) {
          roleBadge.textContent = isTh ? '🛡️ โหมดผู้ดูแลระบบ' : '🛡️ Admin Mode';
          roleBadge.className = 'px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900';
        } else {
          roleBadge.textContent = isTeacher ? '👨‍🏫 Teacher Mode' : '🎓 Student Mode';
          roleBadge.className = isTeacher ? 'px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300';
        }
      }

      const btnAddStep = document.getElementById('btnPdetailAddStep');
      if (btnAddStep) btnAddStep.classList.toggle('hidden', isTeacher || isAdmin);

      const progressBox = document.getElementById('pdetailProgressBox');
      if (progressBox) progressBox.classList.toggle('hidden', isAdmin);

      const milestoneSection = document.getElementById('pdetailMilestoneTasksSection');
      if (milestoneSection) milestoneSection.classList.toggle('hidden', isAdmin);

      if (!isAdmin) {
        const tasks = p.tasks || [];
        const totalTasks = tasks.length;
        const approvedTasks = tasks.filter(t => t.status === 'Approved').length;
        const pct = totalTasks > 0 ? Math.round((approvedTasks / totalTasks) * 100) : 0;

        document.getElementById('pdetailProgressPct').textContent = pct + '%';
        document.getElementById('pdetailProgressBar').style.width = pct + '%';
        document.getElementById('pdetailStepsSummary').textContent = isTh
          ? ('ผ่าน ' + approvedTasks + ' จาก ' + totalTasks + ' ขั้นตอน')
          : (approvedTasks + ' of ' + totalTasks + ' steps approved');

        const pendingReviewTask = tasks.find(t => t.status === 'Needs Review');
        const revisionTask = tasks.find(t => t.status === 'Revision Requested');
        const hint = document.getElementById('pdetailStatusHint');
        if (pendingReviewTask) {
          hint.textContent = isTh ? 'มีขั้นตอนรออาจารย์ตรวจ' : 'Step awaiting review';
          hint.className = 'text-amber-500 font-semibold';
        } else if (revisionTask) {
          hint.textContent = isTh ? 'มีงานต้องปรับปรุงแก้ไข' : 'Revision requested';
          hint.className = 'text-rose-500 font-semibold';
        } else if (pct === 100) {
          hint.textContent = isTh ? 'โครงงานเสร็จสมบูรณ์' : 'Project completed';
          hint.className = 'text-emerald-500 font-semibold';
        } else {
          hint.textContent = isTh ? 'กำลังดำเนินการ' : 'In Progress';
          hint.className = 'text-neutral-500 font-semibold';
        }
      }

      const membersContainer = document.getElementById('pdetailMembersContainer');
      membersContainer.innerHTML = '';
      let resolvedMembers = Array.isArray(p.members) && p.members.length > 0 ? p.members : [];
      if (resolvedMembers.length === 0 && typeof coursesCatalog !== 'undefined' && coursesCatalog[p.course] && Array.isArray(coursesCatalog[p.course].tasks)) {
        const seenM = new Set();
        coursesCatalog[p.course].tasks.filter(t => t.projectId === p.id).forEach(t => {
          const rawList = Array.isArray(t.assignees) && t.assignees.length ? t.assignees : (Array.isArray(t.memberIds) ? t.memberIds : []);
          rawList.forEach(item => {
            const idStr = String(item || '');
            const idMatch = idStr.match(/\d{11}/);
            const stuId = idMatch ? idMatch[0] : idStr;
            const stu = studentDirectory[stuId];
            const label = stu ? `${stu.id} ${stu.shortName || stu.fullName}` : idStr;
            if (label && !seenM.has(label)) { seenM.add(label); resolvedMembers.push(label); }
          });
        });
      }
      if (resolvedMembers.length === 0) {
        const emptyEl = document.createElement('span');
        emptyEl.className = 'text-xs text-neutral-400';
        emptyEl.textContent = isTh ? 'ยังไม่มีสมาชิกในโปรเจกต์นี้' : 'No members assigned yet';
        membersContainer.appendChild(emptyEl);
      } else {
        resolvedMembers.forEach(m => {
          const idMatch = m.match(/\d{11}/);
          const stuId = idMatch ? idMatch[0] : '';
          const stu = studentDirectory[stuId] || { initials: 'ST', shortName: m };
          const el = document.createElement('span');
          el.className = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200';
          el.innerHTML = `<span class="w-4 h-4 rounded-md bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">${stu.initials}</span> ${stu.shortName || m}`;
          membersContainer.appendChild(el);
        });
      }

      if (isAdmin) {
        const stepsEl = document.getElementById('pdetailStepsListContainer');
        if (stepsEl) stepsEl.innerHTML = '';
      } else {
        renderProjectMilestoneSteps(p);
      }
    }

    function closeProjectMilestoneDetail() {
      activeViewingProjectId = null;
      const cardsContainer = document.getElementById('projectsCardsContainer');
      const milestoneView = document.getElementById('projectDetailMilestoneView');
      if (cardsContainer) cardsContainer.classList.remove('hidden');
      if (milestoneView) milestoneView.classList.add('hidden');
      filterProjectsList();
    }

    function renderProjectMilestoneSteps(project) {
      const container = document.getElementById('pdetailStepsListContainer');
      if (!container) return;
      container.innerHTML = '';

      const tasks = project.tasks || [];
      if (tasks.length === 0) {
        container.innerHTML = `
          <div class="text-center py-10 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700">
            <p class="text-xs text-neutral-400">ยังไม่มีขั้นตอนการทำงาน กดปุ่ม "+ เพิ่มขั้นตอน" ด้านบนเพื่อเริ่มวางแผนงานของกลุ่ม</p>
          </div>
        `;
        return;
      }

      tasks.sort((a,b) => a.stepNumber - b.stepNumber);
      const isTeacher = currentUserRole === 'teacher';

      tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200/90 dark:border-neutral-800 shadow-xs space-y-4';

        let statusBadge = '';
        if (task.status === 'Approved') {
          statusBadge = `
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span>✓ ตรวจผ่านแล้ว (Approved)</span>
              ${task.score ? '<span class="ml-1 px-1.5 py-0.2 bg-emerald-500 text-white rounded text-[10px]">' + task.score + '</span>' : ''}
            </span>
          `;
        } else if (task.status === 'Needs Review') {
          statusBadge = `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>ส่งแล้ว รออาจารย์ตรวจ (Needs Review)</span>
            </span>
          `;
        } else if (task.status === 'Revision Requested') {
          statusBadge = `
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
              <span>⚠️ อาจารย์ให้ปรับปรุงแก้ไข (Revision Requested)</span>
            </span>
          `;
        } else {
          statusBadge = `
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              <span>🕒 ยังไม่ส่ง / กำลังดำเนินการ (In Progress)</span>
            </span>
          `;
        }

        let deliverablesHtml = '';
        if (task.submittedFile || task.submittedLink || task.submittedNote) {
          deliverablesHtml = `
            <div class="bg-neutral-50 dark:bg-neutral-800/60 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-2 text-xs">
              <div class="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-[11px]">
                <span class="font-semibold flex items-center gap-1">
                  <span>📎</span> ผลงานที่ส่งตรวจล่าสุด
                </span>
                <span>${task.submittedAt || ''}</span>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                ${task.submittedFile ? `
                  <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-medium text-neutral-700 dark:text-neutral-200">
                    <span>📄</span>
                    <span>${task.submittedFile}</span>
                    <a href="#" onclick="alert('จำลองการเปิดไฟล์: ' + '${task.submittedFile}'); return false;" class="text-orange-600 hover:underline text-[10px] ml-1">ดาวน์โหลด</a>
                  </div>
                ` : ''}

                ${task.submittedLink ? `
                  <a href="${task.submittedLink}" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    <span>🔗</span>
                    <span>เปิดลิงก์ผลงาน (Link)</span>
                  </a>
                ` : ''}
              </div>

              ${task.submittedNote ? `
                <p class="text-neutral-600 dark:text-neutral-300 text-[11px] italic bg-white/50 dark:bg-neutral-800/50 p-2 rounded-lg">
                  "${task.submittedNote}"
                </p>
              ` : ''}
            </div>
          `;
        }

        let feedbacksHtml = '';
        if (task.feedbacks && task.feedbacks.length > 0) {
          feedbacksHtml = `
            <div class="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <p class="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                <span>💬</span> ข้อเสนอแนะจากอาจารย์ที่ปรึกษา
              </p>
              ${task.feedbacks.map(fb => `
                <div class="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/50 text-xs space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-neutral-800 dark:text-neutral-200">${fb.author}</span>
                    <span class="text-[10px] text-neutral-400">${fb.time}</span>
                  </div>
                  <p class="text-neutral-700 dark:text-neutral-300 leading-relaxed">${fb.text}</p>
                </div>
              `).join('')}
            </div>
          `;
        }

        let actionsHtml = '';
        const isThStep = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
        if (isTeacher) {
          actionsHtml = `
            <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end">
              <button onclick="openTeacherStepInspectModal('${project.id}')" class="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-2xs">
                <span>${isThStep ? '🔍 ตรวจและประเมินขั้นตอนนี้' : '🔍 Review & Grade Step'}</span>
              </button>
            </div>
          `;
        } else {
          const stepLocked = isProjectStepGradedLocked(task);
          actionsHtml = stepLocked
            ? `
            <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
              <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span>🔒</span>
                <span>${isThStep ? 'ตรวจให้คะแนนแล้ว (ไม่สามารถแก้ไขได้ ยกเว้นอาจารย์สั่งให้ส่งแก้)' : 'Graded — locked from editing unless revision is requested'}</span>
              </span>
            </div>
          `
            : `
            <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <button onclick="openEditProjectStepModal('${task.id}')" class="px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition">
                  ${isThStep ? 'แก้ไขข้อมูล' : 'Edit Step'}
                </button>
                <button onclick="handleDeleteProjectStep('${task.id}')" class="px-2.5 py-1 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition">
                  ${isThStep ? 'ลบขั้นตอน' : 'Delete Step'}
                </button>
              </div>

              <button onclick="openSubmitStepProgressModal('${task.id}')" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs bg-neutral-900 hover:bg-black dark:bg-orange-600 dark:hover:bg-orange-500 text-white">
                <span>☁️</span>
                <span>${task.status === 'Revision Requested' ? (isThStep ? 'ส่งงานฉบับแก้ไข' : 'Submit Revision') : (isThStep ? 'ส่งตรวจความก้าวหน้า' : 'Submit Progress')}</span>
              </button>
            </div>
          `;
        }

        card.innerHTML = `
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                ${task.stepNumber}
              </span>
              <div>
                <h4 class="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">${task.title}</h4>
                <div class="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  <span class="text-orange-600 dark:text-orange-400 font-semibold">
                    🎯 Target Date: ${task.targetDate}
                  </span>
                  <span>•</span>
                  <span>ความคืบหน้า: ${task.progressPct}%</span>
                </div>
              </div>
            </div>
            <div>${statusBadge}</div>
          </div>

          <p class="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            ${task.description}
          </p>

          ${deliverablesHtml}
          ${feedbacksHtml}
          ${actionsHtml}
        `;

        container.appendChild(card);
      });
    }

    function openAddProjectStepModal() {
      const p = studentProjectsList.find(x => x.id === activeViewingProjectId);
      if (!p) return;
      document.getElementById('projectStepEditId').value = '';
      document.getElementById('modalProjectStepHeading').textContent = 'เพิ่มขั้นตอนโครงงาน (Add Milestone Step)';
      const nextStep = (p.tasks || []).length + 1;
      document.getElementById('projectStepNumberInput').value = nextStep;
      document.getElementById('projectStepTitleInput').value = 'Step ' + nextStep + ': ';
      document.getElementById('projectStepTargetDateInput').value = '';
      document.getElementById('projectStepDescInput').value = '';
      document.getElementById('modalProjectStep').classList.remove('hidden');
    }

    function isProjectStepGradedLocked(task) {
      if (!task) return false;
      if (task.status === 'Revision Requested') return false;
      return task.status === 'Approved' || (task.score !== null && task.score !== undefined && String(task.score).trim() !== '' && task.score !== 'Pending' && task.score !== '-');
    }

    function openEditProjectStepModal(taskId) {
      const p = studentProjectsList.find(x => x.id === activeViewingProjectId);
      if (!p) return;
      const task = (p.tasks || []).find(t => t.id === taskId);
      if (!task) return;
      if (currentUserRole === 'student' && isProjectStepGradedLocked(task)) {
        alertMessage('ขั้นตอนนี้ได้รับการตรวจให้คะแนนแล้ว ไม่สามารถแก้ไขได้ (ยกเว้นอาจารย์สั่งให้ส่งแก้)');
        return;
      }

      document.getElementById('projectStepEditId').value = task.id;
      document.getElementById('modalProjectStepHeading').textContent = 'แก้ไขขั้นตอนโครงงาน';
      document.getElementById('projectStepNumberInput').value = task.stepNumber;
      document.getElementById('projectStepTitleInput').value = task.title;
      document.getElementById('projectStepTargetDateInput').value = task.targetDate;
      document.getElementById('projectStepDescInput').value = task.description;
      document.getElementById('modalProjectStep').classList.remove('hidden');
    }

    function closeProjectStepModal() {
      document.getElementById('modalProjectStep').classList.add('hidden');
    }

    function handleSaveProjectStep(e) {
      e.preventDefault();
      const p = studentProjectsList.find(x => x.id === activeViewingProjectId);
      if (!p) return;

      const editId = document.getElementById('projectStepEditId').value;
      const stepNum = parseInt(document.getElementById('projectStepNumberInput').value) || 1;
      const title = document.getElementById('projectStepTitleInput').value.trim();
      const targetDate = document.getElementById('projectStepTargetDateInput').value;
      const desc = document.getElementById('projectStepDescInput').value.trim();

      if (!p.tasks) p.tasks = [];

      if (editId) {
        const task = p.tasks.find(t => t.id === editId);
        if (task) {
          task.stepNumber = stepNum;
          task.title = title;
          task.targetDate = targetDate;
          task.description = desc;
        }
      } else {
        const newTask = {
          id: p.id + '-t' + Date.now(),
          stepNumber: stepNum,
          title: title,
          targetDate: targetDate,
          description: desc,
          status: 'Unfinished',
          progressPct: 0,
          submittedFile: null,
          submittedLink: null,
          submittedNote: null,
          submittedAt: null,
          score: null,
          feedbacks: []
        };
        p.tasks.push(newTask);
      }

      saveStoredProjects(studentProjectsList);
      closeProjectStepModal();
      openProjectMilestoneDetail(p.id);
      alertMessage('บันทึกขั้นตอนโครงงานเรียบร้อยแล้ว');
    }

    function handleDeleteProjectStep(taskId) {
      const p = studentProjectsList.find(x => x.id === activeViewingProjectId);
      if (!p) return;
      const task = (p.tasks || []).find(t => t.id === taskId);
      if (currentUserRole === 'student' && isProjectStepGradedLocked(task)) {
        alertMessage('ขั้นตอนนี้ได้รับการตรวจให้คะแนนแล้ว ไม่สามารถลบได้ (ยกเว้นอาจารย์สั่งให้ส่งแก้)');
        return;
      }
      if (!confirm('คุณต้องการลบขั้นตอนนี้ใช่หรือไม่?')) return;
      p.tasks = (p.tasks || []).filter(t => t.id !== taskId);
      saveStoredProjects(studentProjectsList);
      openProjectMilestoneDetail(p.id);
      alertMessage('ลบขั้นตอนเรียบร้อยแล้ว');
    }

    function openSubmitStepProgressModal(taskId) {
      const p = studentProjectsList.find(x => x.id === activeViewingProjectId);
      if (!p) return;
      const task = (p.tasks || []).find(t => t.id === taskId);
      if (!task) return;
      if (currentUserRole === 'student' && isProjectStepGradedLocked(task)) {
        alertMessage('ขั้นตอนนี้ได้รับการตรวจให้คะแนนแล้ว ไม่สามารถส่งแก้ได้ (ยกเว้นอาจารย์สั่งให้ส่งแก้)');
        return;
      }

      document.getElementById('submitStepTaskId').value = task.id;
      document.getElementById('submitStepModalSubtitle').textContent = task.title;
      document.getElementById('submitStepPctSlider').value = task.progressPct || 100;
      document.getElementById('sliderStepPctLabel').textContent = (task.progressPct || 100) + '%';
      document.getElementById('submitStepFileLabel').textContent = task.submittedFile || 'คลิกเพื่อเลือกไฟล์ (PDF, ZIP, DOCX, PNG)';
      document.getElementById('submitStepLinkInput').value = task.submittedLink || '';
      document.getElementById('submitStepNotesInput').value = task.submittedNote || '';
      document.getElementById('modalSubmitStepProgress').classList.remove('hidden');
    }

    function closeSubmitStepProgressModal() {
      document.getElementById('modalSubmitStepProgress').classList.add('hidden');
    }

    function handleStepFileSelected(e) {
      const f = e.target.files[0];
      if (f) {
        document.getElementById('submitStepFileLabel').textContent = f.name + ' (' + (f.size / (1024*1024)).toFixed(2) + ' MB)';
      }
    }

    function handleConfirmSubmitStepProgress(e) {
      e.preventDefault();
      const p = studentProjectsList.find(x => x.id === activeViewingProjectId);
      if (!p) return;
      const taskId = document.getElementById('submitStepTaskId').value;
      const task = (p.tasks || []).find(t => t.id === taskId);
      if (!task) return;

      const pct = parseInt(document.getElementById('submitStepPctSlider').value) || 100;
      const fileInput = document.getElementById('submitStepFileInput');
      const fileName = fileInput.files[0] ? fileInput.files[0].name : (task.submittedFile || 'Milestone_Deliverable.pdf');
      const link = document.getElementById('submitStepLinkInput').value.trim();
      const note = document.getElementById('submitStepNotesInput').value.trim();

      task.progressPct = pct;
      task.submittedFile = fileName;
      if (link) task.submittedLink = link;
      if (note) task.submittedNote = note;

      const now = new Date();
      task.submittedAt = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
      task.status = 'Needs Review';

      saveStoredProjects(studentProjectsList);
      closeSubmitStepProgressModal();
      openProjectMilestoneDetail(p.id);
      alertMessage('ส่งตรวจความคืบหน้าเรียบร้อยแล้ว (สถานะ: รออาจารย์ตรวจ)');
    }

    function openTeacherStepInspectModal(projectId) {
      const p = studentProjectsList.find(x => x.id === projectId);
      if (!p) return;
      activeViewingProjectId = projectId;

      document.getElementById('teacherInspectCourseBadge').textContent = p.course;
      document.getElementById('teacherInspectProjectTitle').textContent = p.title;

      const container = document.getElementById('teacherInspectStepsContainer');
      container.innerHTML = '';

      const tasks = p.tasks || [];
      tasks.sort((a,b) => a.stepNumber - b.stepNumber);

      tasks.forEach(task => {
        const stepCard = document.createElement('div');
        stepCard.className = 'bg-neutral-50 dark:bg-neutral-800/60 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-4';

        let statusPill = '';
        if (task.status === 'Approved') {
          statusPill = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">ผ่านแล้ว (Approved)</span>';
        } else if (task.status === 'Needs Review') {
          statusPill = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 animate-pulse">รออาจารย์ตรวจ (Needs Review)</span>';
        } else if (task.status === 'Revision Requested') {
          statusPill = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">ให้ปรับปรุงแก้ไข</span>';
        } else {
          statusPill = '<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">ยังไม่ส่งงาน</span>';
        }

        stepCard.innerHTML = `
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-orange-500 text-white font-bold text-xs flex items-center justify-center">
                ${task.stepNumber}
              </span>
              <h4 class="text-sm font-bold text-neutral-900 dark:text-white">${task.title}</h4>
            </div>
            ${statusPill}
          </div>

          <p class="text-xs text-neutral-600 dark:text-neutral-300">${task.description}</p>

          <div class="text-xs text-neutral-400 flex items-center gap-3">
            <span>Target Date: ${task.targetDate}</span>
            <span>•</span>
            <span>ความคืบหน้า: ${task.progressPct}%</span>
            ${task.score ? '<span>•</span><span class="font-bold text-emerald-600 dark:text-emerald-400">คะแนน: ' + task.score + '</span>' : ''}
          </div>

          ${(task.submittedFile || task.submittedLink || task.submittedNote) ? `
            <div class="bg-white dark:bg-neutral-900 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-2 text-xs">
              <div class="flex items-center justify-between text-neutral-400 text-[11px]">
                <span class="font-semibold text-neutral-700 dark:text-neutral-300">สิ่งที่นักศึกษาส่งมา:</span>
                <span>ส่งเมื่อ: ${task.submittedAt || '-'}</span>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                ${task.submittedFile ? `
                  <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs">
                    <span>📄</span>
                    <span class="font-semibold text-neutral-800 dark:text-neutral-200">${task.submittedFile}</span>
                    <button onclick="alert('จำลองการเปิดตรวจไฟล์: ' + '${task.submittedFile}');" class="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-[10px] font-bold">เปิดดู</button>
                  </div>
                ` : ''}

                ${task.submittedLink ? `
                  <a href="${task.submittedLink}" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-600 text-xs font-semibold hover:underline">
                    <span>🔗</span>
                    <span>เปิดลิงก์ผลงานภายนอก</span>
                  </a>
                ` : ''}
              </div>

              ${task.submittedNote ? `
                <div class="text-[11px] text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 p-2 rounded-lg">
                  <span class="font-bold">โน้ตจากนักศึกษา:</span> ${task.submittedNote}
                </div>
              ` : ''}
            </div>
          ` : '<div class="text-xs text-neutral-400 italic">ยังไม่มีการส่งไฟล์หรือลิงก์งานในขั้นตอนนี้</div>'}

          ${(task.feedbacks && task.feedbacks.length > 0) ? `
            <div class="space-y-1.5">
              <span class="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">ข้อเสนอแนะที่เคยให้ไว้:</span>
              ${task.feedbacks.map(f => `
                <div class="p-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs">
                  <div class="flex justify-between text-[10px] text-neutral-400">
                    <span class="font-bold text-neutral-700 dark:text-neutral-300">${f.author}</span>
                    <span>${f.time}</span>
                  </div>
                  <p class="text-neutral-600 dark:text-neutral-300 mt-0.5">${f.text}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="pt-3 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
            <span class="text-xs font-bold text-neutral-700 dark:text-neutral-300">💬 ให้คำแนะนำ / ประเมินผลขั้นตอนนี้:</span>
            <textarea id="tEvalComment-${task.id}" rows="2" placeholder="พิมพ์ข้อคิดเห็น ข้อเสนอแนะ หรือสิ่งที่ต้องให้กลุ่มกลับไปปรับปรุง..."
              class="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"></textarea>

            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <label class="text-xs font-semibold text-neutral-500">ระบุคะแนน (เต็ม 10):</label>
                <input id="tEvalScore-${task.id}" type="text" placeholder="เช่น 9.5" value="${task.score ? task.score.split('/')[0].trim() : ''}"
                  class="w-20 px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-bold text-center focus:outline-none">
              </div>

              <div class="flex items-center gap-2">
                <button type="button" onclick="submitTeacherEvaluationStep('${p.id}', '${task.id}', 'Revision Requested')"
                  class="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition">
                  ให้แก้ไข (Revision)
                </button>
                <button type="button" onclick="submitTeacherEvaluationStep('${p.id}', '${task.id}', 'Approved')"
                  class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs">
                  อนุมัติ (Approved)
                </button>
              </div>
            </div>
          </div>
        `;

        container.appendChild(stepCard);
      });

      document.getElementById('modalTeacherStepInspect').classList.remove('hidden');
    }

    function closeTeacherStepInspectModal() {
      document.getElementById('modalTeacherStepInspect').classList.add('hidden');
    }

    function submitTeacherEvaluationStep(projId, taskId, newStatus) {
      const p = studentProjectsList.find(x => x.id === projId);
      if (!p) return;
      const task = (p.tasks || []).find(t => t.id === taskId);
      if (!task) return;

      const commentEl = document.getElementById('tEvalComment-' + taskId);
      const scoreEl = document.getElementById('tEvalScore-' + taskId);
      const commentText = commentEl ? commentEl.value.trim() : '';
      const scoreValue = scoreEl ? scoreEl.value.trim() : '';

      task.status = newStatus;
      if (scoreValue) task.score = scoreValue + ' / 10';

      if (commentText) {
        if (!task.feedbacks) task.feedbacks = [];
        const now = new Date();
        const timeStr = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
        task.feedbacks.push({
          author: 'ผศ. สุริพงษ์ เลิศกุลทานนท์ (อาจารย์ที่ปรึกษา)',
          role: 'teacher',
          time: timeStr,
          text: commentText,
          statusTag: newStatus
        });
      }

      saveStoredProjects(studentProjectsList);
      alertMessage(newStatus === 'Approved' ? 'อนุมัติขั้นตอนเรียบร้อยแล้ว' : 'ส่งข้อเสนอแนะให้แก้ไขแล้ว');
      openTeacherStepInspectModal(projId);
      if (activeViewingProjectId) {
        openProjectMilestoneDetail(projId);
      }
    }
