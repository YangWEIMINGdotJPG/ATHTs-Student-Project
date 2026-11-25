    function renderDashboardCourses() {
      const student = getCurrentStudent();
      const isThai = currentLanguage === 'th';

      const studentAvatar = document.getElementById('dashboardStudentAvatar');
      if (studentAvatar) {
        studentAvatar.innerText = student.initials || 'CS';
      }

      const studentNameEl = document.getElementById('dashboardStudentName');
      const displayFullName = student.fullName ? student.fullName.toUpperCase() : 'STUDENT';
      if (studentNameEl) {
        studentNameEl.innerText = displayFullName;
      }
      const mobileStuWelcome = document.getElementById('studentMobileWelcomeName');
      if (mobileStuWelcome) {
        mobileStuWelcome.innerText = isThai
          ? `ยินดีต้อนรับ, ${student.shortName || displayFullName}!`
          : `Welcome, ${student.shortName || displayFullName}!`;
      }

      const studentBadge = document.getElementById('dashboardStudentIdBadge');
      if (studentBadge) {
        studentBadge.innerText = isThai
          ? `รหัสนักศึกษา: ${student.id} • ปริญญาตรี สื่อมัลติมีเดีย`
          : `Student ID: ${student.id} • Bachelor of Multimedia`;
      }

      const dateTodayEl = document.getElementById('dashboardDateToday');
      if (dateTodayEl) {
        const today = new Date();
        const dateFormatted = isThai
          ? today.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' })
          : today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        dateTodayEl.innerText = dateFormatted;
        const mobileStuDate = document.getElementById('studentMobileDateBadge');
        if (mobileStuDate) mobileStuDate.innerText = dateFormatted;
      }

      const container = document.getElementById('dashboardCourseCards');
      if (!container) return;
      container.innerHTML = '';

      Object.values(coursesCatalog).forEach(c => {
        const doneCount = c.tasks.filter(t => t.isFinished).length;
        const pct = c.tasks.length > 0 ? Math.round((doneCount / c.tasks.length) * 100) : c.progress;
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-neutral-200/90 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-neutral-400 transition pressable cursor-pointer space-y-3';
        card.onclick = () => selectCourse(c.code);

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
            <span>${escapeHtml(c.schedule)}</span>
            <span class="text-[10px] text-neutral-400 font-normal">${doneCount}/${c.tasks.length}</span>
          </div>
        `;
        container.appendChild(card);
      });

      renderCalendar();
    }

    function renderCoursesCatalog() {
      const container = document.getElementById('allCoursesListContainer');
      if (!container) return;
      container.innerHTML = '';

      Object.values(coursesCatalog).forEach(c => {
        const isThai = currentLanguage === 'th';
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200/90 dark:border-neutral-800 shadow-xs hover:border-neutral-300 transition pressable cursor-pointer space-y-3';
        card.onclick = () => selectCourse(c.code);

        card.innerHTML = `
          <div class="flex items-start justify-between">
            <div>
              <span class="text-xs font-bold text-neutral-900 dark:text-white">${escapeHtml(c.code)}</span>
              <h3 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">${escapeHtml(c.title)}</h3>
              <p class="text-[11px] text-neutral-400">${isThai ? 'อาจารย์ผู้สอน' : 'Teacher'}: ${escapeHtml(c.teacher)}</p>
            </div>
            <span class="text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded">${isThai ? 'ภาคเรียนที่ 1' : 'Semester 1'}</span>
          </div>

          <div class="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 space-y-1.5">
            <div class="flex justify-between text-[10px] text-neutral-500 font-medium">
              <span>Course Progress</span>
              <span>${c.progress}%</span>
            </div>
            <div class="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div class="h-full bg-neutral-900 rounded-full" style="width: ${c.progress}%"></div>
            </div>
          </div>

          <div class="flex items-center justify-between text-[10px] text-neutral-400">
            <span>${escapeHtml(c.schedule)}</span>
            <span class="font-bold text-neutral-800">View Details →</span>
          </div>
        `;
        container.appendChild(card);
      });
    }

    function selectCourse(courseId) {
      activeCourseId = courseId;
      activeProjectsFilter = courseId;
      if (currentUserRole === 'student') {
        navigateTo('course-detail');
      } else {
        navigateTo('projects');
        setProjectsFilter(courseId);
      }
    }

        let editingCourseCode = null;

    function viewTaskDetails(taskId) {
      activeTaskId = taskId;
      for (const [cCode, cData] of Object.entries(coursesCatalog)) {
        if (cData.tasks.some(t => t.id === taskId)) {
          activeCourseId = cCode;
          break;
        }
      }
      navigateTo('task-detail');
    }

    function openTaskDetails(taskId) {
      viewTaskDetails(taskId);
    }

    let activeTasksCourseFilter = null;
    let activeTasksProjectFilter = null;

    function openAllTasksHub() {
      activeTasksCourseFilter = null;
      activeTasksProjectFilter = null;
      navigateTo('tasks-hub');
    }

    function openStudentProjectTaskDetail(projId, taskIdx = 0) {
      activeProjectId = projId;
      const proj = studentProjectsList.find(p => p.id === projId);
      if (proj && proj.course && coursesCatalog[proj.course]) {
        activeCourseId = proj.course;
      }
      activeTasksCourseFilter = activeCourseId;
      activeTasksProjectFilter = projId;
      activeTasksFilter = 'all';
      navigateTo('tasks-hub');
    }

    function renderCourseDetailPage() {
      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      if (!course) return;

      const courseProjects = studentProjectsList.filter(p => p.course === course.code);
      const proj = studentProjectsList.find(p => p.id === activeProjectId && p.course === course.code) || courseProjects[0];

      const courseCodeEl = document.getElementById('detailCourseCode');
      if (courseCodeEl) courseCodeEl.innerText = course.code;
      const courseNameEl = document.getElementById('detailCourseName');
      if (courseNameEl) courseNameEl.innerText = course.title;
      const teacherEl = document.getElementById('detailTeacher');
      if (teacherEl) teacherEl.innerText = `${currentLanguage === 'th' ? 'อาจารย์ผู้สอน' : 'Teacher'}: ${course.teacher}`;
      const scheduleEl = document.getElementById('detailSchedule');
      if (scheduleEl) scheduleEl.innerText = course.schedule || 'Wednesday 09:30 - 12:30';

      const totalItems = courseProjects.length > 0 ? courseProjects.length : course.tasks.length;
      const completedItems = courseProjects.length > 0
        ? courseProjects.filter(p => ['Ready for Review', 'Completed', 'Complete', 'Approved'].includes(p.status)).length
        : course.tasks.filter(t => t.isFinished || (t.status && t.status.toLowerCase().includes('graded'))).length;
      const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      const totalTasksEl = document.getElementById('detailTotalTasksCount');
      if (totalTasksEl) totalTasksEl.innerText = totalItems;
      const completedTasksEl = document.getElementById('detailCompletedTasksCount');
      if (completedTasksEl) completedTasksEl.innerText = completedItems;

      const donutPercentEl = document.getElementById('detailDonutPercent');
      if (donutPercentEl) donutPercentEl.innerText = `${progressPct}%`;
      const donutPathEl = document.getElementById('detailDonutPath');
      if (donutPathEl) donutPathEl.setAttribute('stroke-dasharray', `${progressPct}, 100`);

      const mobileOverviewPct = document.getElementById('mobileDetailOverviewPct');
      if (mobileOverviewPct) mobileOverviewPct.innerText = `${progressPct} %`;
      const mobileOverviewBar = document.getElementById('mobileDetailOverviewBar');
      if (mobileOverviewBar) mobileOverviewBar.style.width = `${progressPct}%`;
      const mobileCompletedEl = document.getElementById('mobileDetailCompletedCount');
      if (mobileCompletedEl) mobileCompletedEl.innerText = completedItems;
      const mobileTotalEl = document.getElementById('mobileDetailTotalCount');
      if (mobileTotalEl) mobileTotalEl.innerText = totalItems;

      const badgeCountEl = document.getElementById('courseTaskCountBadge');
      if (badgeCountEl) badgeCountEl.innerText = `${totalItems} Projects`;

      // Project header handled in tasks-hub/project view

      const tasksContainer = document.getElementById('detailTasksScrollContainer');
      if (tasksContainer) {
        tasksContainer.innerHTML = '';
        if (courseProjects.length === 0) {
          tasksContainer.innerHTML = `
            <div class="p-8 text-center text-neutral-400 space-y-2 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
              <span class="text-2xl">📁</span>
              <p class="text-xs">No projects created for this course yet.</p>
            </div>
          `;
        } else {
          const defaultDue = (course.tasks && course.tasks[0]) ? course.tasks[0].due : 'Sep 30, 2026';
          courseProjects.forEach((p, idx) => {
            const card = document.createElement('div');
            card.onclick = () => openStudentProjectTaskDetail(p.id, idx);
            card.className = 'bg-white dark:bg-neutral-900 hover:bg-slate-50/80 dark:hover:bg-neutral-800/80 rounded-2xl p-4 sm:p-5 border border-neutral-200/80 dark:border-neutral-800 transition pressable cursor-pointer shadow-xs';

            let isComplete = ['Ready for Review', 'Completed', 'Complete', 'Approved'].includes(p.status);
            let isRevision = false;
            let statusText = isComplete ? 'Complete' : (p.status || 'In Progress');
            let desktopStatusText = isComplete ? 'complete' : (p.status || 'In Progress');
            if (currentUserRole === 'student' && typeof getCurrentStudent === 'function') {
              const curStd = getCurrentStudent();
              const sInfo = getStudentCourseTaskInfo(curStd.id, course.code, p.id);
              isComplete = sInfo.submissionStatus === 'complete';
              isRevision = sInfo.submissionStatus === 'revision';
              statusText = isComplete
                ? 'ส่งแล้ว'
                : (isRevision ? 'รอแก้' : 'ยังไม่ส่ง');
              desktopStatusText = statusText;
            }
            const projBadgeCls = isComplete
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              : (isRevision
                ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800');
            const publishDateText = p.createdAt || 'Sep 18, 2026';
            const dueDateText = p.dueDate || defaultDue;

            card.innerHTML = `
              <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div class="flex items-center justify-between gap-3 sm:contents">
                  <div class="sm:col-span-5 min-w-0">
                    <h4 class="text-sm sm:text-base font-bold text-neutral-900 dark:text-white truncate">
                      ${escapeHtml(p.title)}
                    </h4>
                    <p class="hidden sm:block text-[11px] text-neutral-600 dark:text-neutral-400 truncate mt-0.5">
                      ${escapeHtml(p.description || 'Student Project')}
                    </p>
                  </div>
                  <span class="sm:hidden shrink-0 px-3 py-1 rounded-full text-[11px] font-bold ${projBadgeCls}">
                    ${escapeHtml(statusText)}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-3 pt-2.5 mt-1 border-t border-neutral-200/80 dark:border-neutral-800 sm:contents">
                  <div class="sm:col-span-3 text-xs flex sm:block items-baseline gap-1.5 min-w-0">
                    <span class="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 shrink-0 sm:block">Publish Date</span>
                    <span class="text-[10px] sm:text-[11px] text-neutral-500 sm:text-neutral-600 dark:text-neutral-400 font-medium truncate sm:block">${escapeHtml(publishDateText)}</span>
                  </div>

                  <div class="sm:col-span-3 text-xs flex sm:block items-baseline justify-end sm:justify-start gap-1.5 min-w-0">
                    <span class="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 shrink-0 sm:block">Due Date</span>
                    <span class="text-[10px] sm:text-[11px] text-neutral-500 sm:text-neutral-600 dark:text-neutral-400 font-medium truncate sm:block">${escapeHtml(dueDateText)}</span>
                  </div>
                </div>

                <div class="hidden sm:flex sm:col-span-1 items-center justify-end gap-1.5">
                  <span class="px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${projBadgeCls}">
                    ${escapeHtml(desktopStatusText)}
                  </span>
                </div>
              </div>
            `;
            tasksContainer.appendChild(card);
          });
        }
      }

      // Course members rendered via course/project members views
    }

    let studentAddTaskTempMembers = [];

    function renderStudentAddTaskMembers() {
      const chipsEl = document.getElementById('studentAddTaskMembersChips');
      const countEl = document.getElementById('studentAddTaskMembersCount');
      const selectEl = document.getElementById('studentAddTaskMemberSelect');
      if (countEl) {
        countEl.innerText = `${studentAddTaskTempMembers.length} ${studentAddTaskTempMembers.length === 1 ? 'Member' : 'Members'}`;
      }
      if (chipsEl) {
        chipsEl.innerHTML = studentAddTaskTempMembers.map((m, idx) => `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 shadow-2xs">
            <span>${escapeHtml(m.name)}</span>
            <span class="text-[9px] text-neutral-400">(${escapeHtml(m.role)})</span>
            ${idx > 0 ? `<button type="button" onclick="removeStudentAddTaskMember(${idx})" class="text-rose-500 hover:text-rose-700 font-bold ml-0.5">✕</button>` : ''}
          </span>
        `).join('');
      }
      if (selectEl) {
        const chosenIds = new Set(studentAddTaskTempMembers.map(m => m.id));
        const available = Object.values(studentDirectory).filter(s => !chosenIds.has(s.id));
        selectEl.innerHTML = available.length > 0
          ? available.map(s => `<option value="${s.id}">${escapeHtml(s.shortName)} (${s.id})</option>`).join('')
          : '<option value="">No more students available</option>';
      }
    }

    function toggleStudentAddTaskMembersSection() {
      const typeVal = document.getElementById('studentNewTaskType')?.value || 'Group Project';
      const sec = document.getElementById('studentAddTaskMembersSection');
      if (sec) {
        sec.classList.toggle('hidden', typeVal !== 'Group Project');
      }
    }

    function addStudentAddTaskMember() {
      const sel = document.getElementById('studentAddTaskMemberSelect');
      const sid = sel ? sel.value : '';
      if (!sid) return;
      const prof = getStudentProfile(sid);
      if (!prof || studentAddTaskTempMembers.some(m => m.id === prof.id)) return;
      studentAddTaskTempMembers.push({ name: prof.shortName, role: 'Member', id: prof.id });
      renderStudentAddTaskMembers();
    }

    function removeStudentAddTaskMember(idx) {
      if (idx > 0 && idx < studentAddTaskTempMembers.length) {
        studentAddTaskTempMembers.splice(idx, 1);
        renderStudentAddTaskMembers();
      }
    }

    function getStudentTasksInCourse(studentId, courseCode) {
      const course = coursesCatalog[courseCode] || coursesCatalog['CMM321'];
      const prof = getStudentProfile(studentId);
      const tasks = (course && course.tasks) || [];
      return tasks.filter(t => {
        if (!t) return false;
        if (t.createdBy === studentId) return true;
        return (t.members || []).some(m =>
          m.id === studentId ||
          (m.name && prof.shortName && m.name.toLowerCase() === prof.shortName.toLowerCase())
        );
      });
    }

    function getStudentOriginalGroupMembers(studentId, courseCode) {
      const curProf = getStudentProfile(studentId);
      const studentTasks = getStudentTasksInCourse(studentId, courseCode);
      if (studentTasks.length === 0) {
        return {
          hasFirstTask: false,
          isGroup: false,
          members: [{ name: curProf.shortName, role: 'Leader', id: curProf.id }]
        };
      }
      const firstTask = studentTasks[0];
      const rawMembers = Array.isArray(firstTask.members) ? firstTask.members : [];
      const isSoloFirst = String(firstTask.type || '').toLowerCase() === 'individual' || rawMembers.length <= 1;
      if (isSoloFirst) {
        return {
          hasFirstTask: true,
          isGroup: false,
          members: [{ name: curProf.shortName, role: 'Leader', id: curProf.id }]
        };
      }
      const clonedMembers = rawMembers.map((m, idx) => {
        const mp = getStudentProfile(m.id || m.name);
        return {
          id: mp.id,
          name: mp.shortName,
          role: m.role || (idx === 0 ? 'Leader' : 'Member'),
          taskStatus: 'Active',
          score: 'Pending'
        };
      });
      return {
        hasFirstTask: true,
        isGroup: true,
        members: clonedMembers
      };
    }

    function openStudentAddTaskModal() {
      if (currentUserRole === 'teacher') {
        alertMessage("Teachers do not have permission to add tasks.");
        return;
      }
      const targetCode = activeTasksCourseFilter || activeCourseId || 'CMM321';
      const course = coursesCatalog[targetCode] || coursesCatalog['CMM321'];
      const nextNum = course ? (course.tasks.length + 1) : 1;
      const titleInput = document.getElementById('studentNewTaskTitle');
      if (titleInput) titleInput.value = `Task ${nextNum}: Deliverable`;

      const curStd = getCurrentStudent();
      const origInfo = getStudentOriginalGroupMembers(curStd.id, targetCode);
      const typeSel = document.getElementById('studentNewTaskType');
      if (origInfo.hasFirstTask) {
        studentAddTaskTempMembers = JSON.parse(JSON.stringify(origInfo.members));
        if (typeSel) typeSel.value = origInfo.isGroup ? 'Group Project' : 'Individual';
      } else {
        studentAddTaskTempMembers = [{ name: curStd.shortName, role: 'Leader', id: curStd.id }];
        if (typeSel) typeSel.value = 'Group Project';
      }
      renderStudentAddTaskMembers();
      toggleStudentAddTaskMembersSection();

      const modal = document.getElementById('modalStudentAddTask');
      if (modal) modal.classList.remove('hidden');
    }

    function closeStudentAddTaskModal() {
      const modal = document.getElementById('modalStudentAddTask');
      if (modal) modal.classList.add('hidden');
    }

    function handleStudentAddTaskSubmit(e) {
      if (e && e.preventDefault) e.preventDefault();
      if (currentUserRole === 'teacher') {
        alertMessage("Teachers do not have permission to add tasks.");
        return;
      }
      const title = document.getElementById('studentNewTaskTitle')?.value.trim();
      const desc = document.getElementById('studentNewTaskDesc')?.value.trim() || 'Project deliverable milestone';
      let type = document.getElementById('studentNewTaskType')?.value || 'Group Project';
      if (!title) return;

      const targetCode = activeTasksCourseFilter || activeCourseId || 'CMM321';
      const course = coursesCatalog[targetCode] || coursesCatalog['CMM321'];
      if (!course) return;

      const curStd = getCurrentStudent();
      const origInfo = getStudentOriginalGroupMembers(curStd.id, course.code);
      const linkedProj = studentProjectsList.find(p => p.id === (activeTasksProjectFilter || activeProjectId) && p.course === course.code) || studentProjectsList.find(p => p.course === course.code);
      const due = (linkedProj && linkedProj.dueDate) || (course.tasks && course.tasks[0] && course.tasks[0].due) || 'November 28, 2026 at 23:00';
      const newId = `${course.code.toLowerCase()}-task-${Date.now()}`;

      let finalMembers;
      if (origInfo.hasFirstTask) {
        finalMembers = JSON.parse(JSON.stringify(origInfo.members));
        type = origInfo.isGroup ? 'Group Project' : 'Individual';
      } else {
        finalMembers = (type === 'Group Project' && studentAddTaskTempMembers.length > 0)
          ? JSON.parse(JSON.stringify(studentAddTaskTempMembers))
          : [{ name: curStd.shortName, role: 'Leader', id: curStd.id }];
      }

      const initialSubs = {};
      finalMembers.forEach(m => {
        if (m && m.id) {
          initialSubs[m.id] = {
            submitted: false,
            score: 'Pending',
            status: 'Pending',
            file: '',
            submittedAt: '',
            revisions: []
          };
        }
      });

      course.tasks.push({
        id: newId,
        projectId: linkedProj ? linkedProj.id : (`proj-${course.code.toLowerCase()}-1`),
        createdBy: curStd.id,
        title: title,
        due: due,
        publishDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Active',
        isFinished: false,
        submitted: false,
        score: 'Pending',
        type: type === 'Group Project' ? `Group Project (${finalMembers.length} Members)` : type,
        description: desc,
        members: finalMembers,
        studentSubmissions: initialSubs
      });
      ensureRelationalIntegrity();
      saveCoursesCatalog();

      closeStudentAddTaskModal();
      if (currentScreen === 'tasks-hub') {
        renderGlobalTasksHub();
      } else {
        renderCourseDetailPage();
      }
      alertMessage(`Task "${title}" added successfully!`);
    }

    function removeStudentTask(taskId) {
      if (currentUserRole === 'teacher') {
        alertMessage("Teachers do not have permission to remove tasks.");
        return;
      }
      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      if (!course) return;
      const task = course.tasks.find(t => t.id === taskId);
      if (!task) return;
      if (!confirm(`Are you sure you want to remove task: "${task.title}"?`)) return;

      course.tasks = course.tasks.filter(t => t.id !== taskId);
      ensureRelationalIntegrity();
      saveCoursesCatalog();
      if (currentScreen === 'tasks-hub') renderGlobalTasksHub();
      else renderCourseDetailPage();
      alertMessage(`Task "${task.title}" removed.`);
    }

    function parseTaskDueDateTime(dueStr) {
      if (!dueStr) return { dateVal: '', timeVal: '23:59' };
      let dateVal = '';
      let timeVal = '23:59';

      const timeMatch = dueStr.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        timeVal = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
      }

      const months = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
        'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
      };

      const dMatch = dueStr.match(/([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})/);
      if (dMatch) {
        const mKey = dMatch[1].toLowerCase().slice(0, 3);
        const mNum = months[mKey];
        if (mNum) {
          const dNum = dMatch[2].padStart(2, '0');
          const yNum = dMatch[3];
          dateVal = `${yNum}-${mNum}-${dNum}`;
        }
      }
      return { dateVal, timeVal };
    }

    function formatTaskDueDateTime(dateStr, timeStr) {
      if (!dateStr) return '';
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const y = parts[0];
        const mIdx = parseInt(parts[1], 10) - 1;
        const m = monthNames[mIdx] || 'Oct';
        const d = parseInt(parts[2], 10);
        const t = timeStr ? timeStr : '23:59';
        return `${m} ${d}, ${y} (${t})`;
      }
      return dateStr + (timeStr ? ` (${timeStr})` : '');
    }

    function syncStudentEditTaskDueCombined() {
      const dateVal = document.getElementById('studentEditTaskDueDate')?.value;
      const timeVal = document.getElementById('studentEditTaskDueTime')?.value || '23:59';
      const hiddenInput = document.getElementById('studentEditTaskDue');
      if (hiddenInput && dateVal) {
        hiddenInput.value = formatTaskDueDateTime(dateVal, timeVal);
      }
    }

    function findTaskCourseCode(taskId) {
      for (const [cCode, cData] of Object.entries(coursesCatalog || {})) {
        if ((cData.tasks || []).some(t => t.id === taskId)) return cCode;
      }
      return activeCourseId || 'CMM321';
    }

    function computeTaskStatus(task, courseCode = null) {
      if (!task) return 'Unfinished';
      if (typeof currentUserRole !== 'undefined' && currentUserRole === 'student' && typeof getCurrentStudent === 'function') {
        const curStd = getCurrentStudent();
        if (curStd && typeof ensureStudentSubmissionRevisions === 'function') {
          const cCode = courseCode || task.courseCode || findTaskCourseCode(task.id);
          const revs = ensureStudentSubmissionRevisions(task, curStd.id, cCode);
          const latestRev = revs.length > 0 ? revs[revs.length - 1] : null;
          if (!latestRev) return 'Unfinished';
          if (latestRev.status === 'revision') return 'Revision Requested (รอแก้)';
          if (latestRev.score && latestRev.score !== 'Pending' && latestRev.score !== '-' && latestRev.score !== 'Revise') {
            return `Graded (${latestRev.score})`;
          }
          return 'Finished';
        }
      }
      if (task.score && task.score !== 'Pending' && task.score !== '-') {
        return task.status && task.status.toLowerCase().includes('graded') ? task.status : `Graded (${task.score})`;
      }
      if (task.status && task.status.toLowerCase().includes('graded')) {
        return task.status;
      }
      if (task.submitted || task.isFinished || (task.status && task.status.toLowerCase().includes('finish'))) {
        return 'Finished';
      }
      return 'Unfinished';
    }

    function getTaskStatusBadgeClasses(statusStr) {
      if (!statusStr) return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      const s = statusStr.toLowerCase();
      if (s.includes('revision') || s.includes('รอแก้')) {
        return 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      }
      if (s.includes('graded')) {
        return 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      }
      if (s.includes('finish') || s.includes('complete')) {
        return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      }
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    }

    function openStudentEditTaskModal(taskId) {
      if (currentUserRole === 'teacher') {
        alertMessage("Teachers do not have permission to edit student tasks here.");
        return;
      }
      let foundTask = null;
      let foundCourse = null;

      if (activeCourseId && coursesCatalog[activeCourseId]) {
        foundCourse = coursesCatalog[activeCourseId];
        foundTask = foundCourse.tasks.find(t => t.id === taskId);
      }
      if (!foundTask) {
        for (const [cCode, cData] of Object.entries(coursesCatalog)) {
          const t = cData.tasks.find(x => x.id === taskId);
          if (t) {
            foundTask = t;
            foundCourse = cData;
            activeCourseId = cCode;
            break;
          }
        }
      }
      if (!foundTask) return;

      document.getElementById('studentEditTaskId').value = foundTask.id;
      document.getElementById('studentEditTaskTitle').value = foundTask.title || '';
      document.getElementById('studentEditTaskDesc').value = foundTask.description || '';

      const modal = document.getElementById('modalStudentEditTask');
      if (modal) modal.classList.remove('hidden');
    }

    function closeStudentEditTaskModal() {
      const modal = document.getElementById('modalStudentEditTask');
      if (modal) modal.classList.add('hidden');
    }

    function handleStudentEditTaskSubmit(e) {
      if (e && e.preventDefault) e.preventDefault();
      if (currentUserRole === 'teacher') {
        alertMessage("Teachers do not have permission to edit student tasks.");
        return;
      }

      const taskId = document.getElementById('studentEditTaskId')?.value;
      const title = document.getElementById('studentEditTaskTitle')?.value.trim();
      const desc = document.getElementById('studentEditTaskDesc')?.value.trim();

      if (!taskId || !title) return;

      let targetTask = null;
      for (const [cCode, cData] of Object.entries(coursesCatalog)) {
        const t = cData.tasks.find(x => x.id === taskId);
        if (t) {
          targetTask = t;
          break;
        }
      }

      if (!targetTask) return;

      targetTask.title = title;
      targetTask.description = desc;
      saveCoursesCatalog();

      closeStudentEditTaskModal();

      if (currentScreen === 'course-detail') {
        renderCourseDetailPage();
      } else if (currentScreen === 'task-detail') {
        renderTaskDetailPage();
      } else if (currentScreen === 'tasks-hub') {
        renderGlobalTasksHub();
      }

      updateBreadcrumbUI(currentScreen);
      alertMessage(`Task "${title}" updated successfully!`);
    }

    function removeLastStudentTask() {
      if (currentUserRole === 'teacher') {
        alertMessage("Teachers do not have permission to remove tasks.");
        return;
      }
      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      const courseProjs = studentProjectsList.filter(p => p.course === course.code);
      if (!course || (courseProjs.length === 0 && course.tasks.length === 0)) {
        alertMessage("No projects to remove.");
        return;
      }
      if (courseProjs.length > 0) {
        const lastProj = courseProjs[courseProjs.length - 1];
        if (confirm(`Do you want to remove project: "${lastProj.title}"?`)) {
          studentProjectsList = studentProjectsList.filter(p => p.id !== lastProj.id);
          saveStoredProjects(studentProjectsList);
          course.tasks = course.tasks.filter(t => t.projectId !== lastProj.id);
          saveCoursesCatalog();
          renderCourseDetailPage();
          alertMessage(`Project "${lastProj.title}" removed.`);
        }
        return;
      }
      const last = course.tasks[course.tasks.length - 1];
      if (confirm(`Do you want to remove: "${last.title}"?`)) {
        course.tasks.pop();
        saveCoursesCatalog();
        renderCourseDetailPage();
        alertMessage(`Removed "${last.title}".`);
      }
    }

    function openCourseTeamEditModal() {
      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      if (!course) return;

      editingTaskId = null;
      editingCourseCode = course.code;

      const titleEl = document.getElementById('modalTaskTargetSubtitle');
      if (titleEl) titleEl.innerText = `${course.code} Project Team`;

      if (!course.members || course.members.length === 0) {
        course.members = [
          { name: 'Chonchanok S.', role: 'Leader', id: '67080200501' },
          { name: 'Thanawat P.', role: 'Member', id: '67080500201' },
          { name: 'Kanyarat M.', role: 'Member', id: '67080500202' },
          { name: 'Natthaphon R.', role: 'Member', id: '67080500203' }
        ];
      }

      tempModalMembers = JSON.parse(JSON.stringify(course.members));
      renderModalMembersList();

      const modal = document.getElementById('modalMemberEdit');
      if (modal) modal.classList.remove('hidden');
    }

    function renderTaskDetailPage() {
      const course = coursesCatalog[activeCourseId];
      if (!course) return;
      const task = course.tasks.find(t => t.id === activeTaskId) || course.tasks[0];
      if (!task) return;

      const isStudent = currentUserRole === 'student';
      const statusBadge = document.getElementById('taskStatusBadge');
      const editBtn = document.getElementById('btnStudentEditTaskDetail');

      const computedStatus = computeTaskStatus(task);
      if (statusBadge) {
        statusBadge.innerText = computedStatus;
        statusBadge.className = 'text-xs font-semibold px-2.5 py-1 rounded-lg border ' + getTaskStatusBadgeClasses(computedStatus);
        statusBadge.classList.remove('hidden');
      }

      if (isStudent && !computedStatus.startsWith('Graded')) {
        if (editBtn) {
          editBtn.classList.remove('hidden');
          editBtn.onclick = () => openStudentEditTaskModal(task.id);
        }
      } else {
        if (editBtn) editBtn.classList.add('hidden');
      }

      const activeProj = studentProjectsList.find(p => p.id === activeProjectId && p.course === course.code) || studentProjectsList.find(p => p.course === course.code);
      const taskCourseBadge = document.getElementById('taskCourseBadge');
      if (taskCourseBadge) taskCourseBadge.innerText = course.code;
      const taskProjSub = document.getElementById('taskDetailProjectSubtitle');
      if (taskProjSub) taskProjSub.innerText = activeProj ? activeProj.title : 'Student project';

      document.getElementById('taskDetailTitle').innerText = task.title;
      document.getElementById('taskDetailDescription').innerText = task.description;
      document.getElementById('taskDueDate').innerText = task.due;
      document.getElementById('taskPublishDate').innerText = task.publishDate;

      const container = document.getElementById('inTaskMembersList');
      if (container) {
        container.innerHTML = '';
        const currentStudent = getCurrentStudent();
        (task.members || []).forEach(m => {
          const prof = getStudentProfile(m.id || m.name);
          const isYou = prof.id === currentStudent.id;
          const chip = document.createElement('div');
          chip.className = 'flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-1 rounded-lg text-[11px] text-neutral-800 dark:text-neutral-200 shadow-2xs';
          chip.title = `${prof.fullName} (${prof.email})`;
          chip.innerHTML = `
            <div class="w-4 h-4 rounded-full bg-neutral-800 dark:bg-neutral-600 text-white flex items-center justify-center text-[9px] font-bold">
              ${escapeHtml(prof.initials || m.name.charAt(0))}
            </div>
            <span class="font-medium">${escapeHtml(prof.shortName)}${isYou ? ' (You)' : ''}</span>
            <span class="text-[9px] text-neutral-400">(${escapeHtml(m.role)})</span>
          `;
          container.appendChild(chip);
        });
      }

      const curStd = getCurrentStudent();
      const myRevs = ensureStudentSubmissionRevisions(task, curStd.id, course.code);
      const myLatestRev = myRevs.length > 0 ? myRevs[myRevs.length - 1] : null;

      const hintEl = document.getElementById('submissionFileNameHint');
      if (hintEl) {
        const sizePart = (myLatestRev && myLatestRev.fileSize) ? ` (${myLatestRev.fileSize})` : '';
        const pendingSizePart = task.pendingFileSize ? ` (${task.pendingFileSize})` : '';
        hintEl.innerText = task.pendingFile
          ? `Ready: ${task.pendingFile}${pendingSizePart}`
          : (myLatestRev ? `ล่าสุด: ${myLatestRev.file}${sizePart} • ${myLatestRev.submittedAt || ''}` : `student_${curStd.id}_task.zip`);
      }
      const uploadStatusText = document.getElementById('uploadStatusText');
      if (uploadStatusText) {
        const isTh = currentLanguage === 'th';
        if (task.pendingFile) {
          uploadStatusText.innerText = isTh
            ? `✓ แนบไฟล์ ${task.pendingFile} แล้ว (พร้อมกดส่งงาน)`
            : `✓ ${task.pendingFile} attached (Ready to submit)`;
        } else if (myLatestRev && myLatestRev.status === 'revision') {
          uploadStatusText.innerText = isTh
            ? `⚠️ รอแก้ไข (${myLatestRev.file}) — อัปโหลดไฟล์ใหม่เพื่อส่งแก้ไข`
            : `⚠️ Revision Requested (${myLatestRev.file}) — Upload a new file to resubmit`;
        } else if (myLatestRev) {
          uploadStatusText.innerText = isTh
            ? `✓ ส่งงานแล้ว (${myLatestRev.file})`
            : `✓ Submitted (${myLatestRev.file})`;
        } else {
          uploadStatusText.innerText = isTh
            ? "คลิกหรือลากไฟล์งานมาวางที่นี่เพื่ออัปโหลด"
            : "Click or drag & drop solution files here to upload";
        }
      }

      const teacherNameEl = document.getElementById('taskDetailTeacherName');
      if (teacherNameEl) {
        teacherNameEl.innerText = `T. ${course.teacher}`;
      }

      const feed = document.getElementById('commentsFeed');
      if (feed) {
        feed.innerHTML = '';
        ensureRelationalIntegrity();
        const revNotes = [];
        myRevs.forEach(r => {
          (r.notes || []).forEach(n => {
            revNotes.push({
              author: `${n.author} (${r.statusLabel || 'ส่งแล้ว'})`,
              role: n.role || 'teacher',
              time: n.time || r.submittedAt || 'Just now',
              text: n.text
            });
          });
        });
        const mergedComments = [...revNotes, ...(task.comments || [])];
        mergedComments.forEach(c => {
          const item = document.createElement('div');
          item.className = c.role === 'student'
            ? 'bg-blue-950/60 border border-blue-800/50 rounded-2xl p-3.5 space-y-1'
            : 'bg-neutral-800/90 rounded-2xl p-4 space-y-1';
          item.innerHTML = `
            <div class="flex items-center justify-between text-[11px] text-neutral-400">
              <span class="font-bold ${c.role === 'student' ? 'text-sky-300' : 'text-neutral-200'}">${escapeHtml(c.author)}</span>
              <span>${escapeHtml(c.time || 'Just now')}</span>
            </div>
            <p class="text-xs sm:text-sm text-white font-medium leading-relaxed">${escapeHtml(c.text)}</p>
          `;
          feed.appendChild(item);
        });
      }

      const btnEdit = document.getElementById('btnEditInTaskMembers');
      if (btnEdit) {
        btnEdit.onclick = () => openMemberEditModalForTask(task.id);
      }
    }

    window.__athtFileStore = window.__athtFileStore || {};

    function openAthtFilesDB() {
      return new Promise((resolve) => {
        if (typeof indexedDB === 'undefined') return resolve(null);
        try {
          const req = indexedDB.open('atht_files_db', 1);
          req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('files')) {
              db.createObjectStore('files');
            }
          };
          req.onsuccess = (e) => resolve(e.target.result);
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    }

    async function saveUploadedFileToDB(fileKey, fileBlob) {
      try {
        const db = await openAthtFilesDB();
        if (!db) return;
        const tx = db.transaction('files', 'readwrite');
        tx.objectStore('files').put(fileBlob, fileKey);
      } catch (e) {}
    }

    async function loadUploadedFileFromDB(fileKey) {
      if (!fileKey) return null;
      if (window.__athtFileStore && window.__athtFileStore[fileKey]) {
        return window.__athtFileStore[fileKey];
      }
      try {
        const db = await openAthtFilesDB();
        if (!db) return null;
        return await new Promise((resolve) => {
          const tx = db.transaction('files', 'readonly');
          const req = tx.objectStore('files').get(fileKey);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        });
      } catch (e) {
        return null;
      }
    }

    function formatFileSizeText(bytes) {
      if (!bytes || bytes <= 0) return '1.0 KB';
      if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function triggerRealFilePicker() {
      const fileInput = document.getElementById('studentRealFileInput');
      if (fileInput && typeof fileInput.click === 'function') {
        fileInput.value = '';
        fileInput.click();
      } else {
        simulateFileUpload();
      }
    }

    function handleRealFileSelected(input) {
      const file = input && input.files && input.files[0];
      if (!file) return;
      const course = coursesCatalog[activeCourseId];
      const task = course ? (course.tasks.find(t => t.id === activeTaskId) || course.tasks[0]) : null;
      const sizeText = formatFileSizeText(file.size);
      const fileKey = `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      window.__athtFileStore[fileKey] = file;
      saveUploadedFileToDB(fileKey, file);

      if (task) {
        task.pendingFile = file.name;
        task.pendingFileSize = sizeText;
        task.pendingFileKey = fileKey;
        task.pendingFileType = file.type || 'application/octet-stream';
        task.pendingFileDataUrl = '';
        if (typeof FileReader !== 'undefined' && file.size && file.size <= 512 * 1024) {
          try {
            const reader = new FileReader();
            reader.onload = (ev) => {
              if (ev && ev.target && ev.target.result) {
                if (task.pendingFileKey === fileKey) {
                  task.pendingFileDataUrl = ev.target.result;
                }
                if (task.studentSubmissions) {
                  let updatedAny = false;
                  Object.values(task.studentSubmissions).forEach(sub => {
                    if (sub && Array.isArray(sub.revisions)) {
                      sub.revisions.forEach(r => {
                        if (r && r.fileKey === fileKey && !r.fileDataUrl) {
                          r.fileDataUrl = ev.target.result;
                          updatedAny = true;
                        }
                      });
                    }
                  });
                  if (updatedAny) saveCoursesCatalog();
                }
              }
            };
            reader.readAsDataURL(file);
          } catch (e) {}
        }
      }
      const text = document.getElementById('uploadStatusText');
      const hint = document.getElementById('submissionFileNameHint');
      const isTh = currentLanguage === 'th';
      if (text) {
        text.innerText = isTh
          ? `✓ แนบไฟล์ ${file.name} (${sizeText}) แล้ว — พร้อมกดส่งงาน`
          : `✓ ${file.name} (${sizeText}) attached (Ready to submit)`;
      }
      if (hint) {
        hint.innerText = isTh ? `พร้อมส่ง: ${file.name} (${sizeText})` : `Ready: ${file.name} (${sizeText})`;
      }
      alertMessage(isTh ? `แนบไฟล์ ${file.name} สำเร็จ!` : `Attached ${file.name} successfully!`);
    }

    function simulateFileUpload() {
      const course = coursesCatalog[activeCourseId];
      const task = course ? (course.tasks.find(t => t.id === activeTaskId) || course.tasks[0]) : null;
      const text = document.getElementById('uploadStatusText');
      if (text) {
        text.innerText = "Uploading 'student_solution_v2.zip' (8.4 MB)...";
        setTimeout(() => {
          text.innerText = "✓ student_solution_v2.zip attached (Ready to submit)";
          if (task) {
            task.pendingFile = 'student_solution_v2.zip';
            task.pendingFileSize = '8.4 MB';
          }
          alertMessage("File attached successfully!");
        }, 600);
      }
    }

    function submitAssignment() {
      const course = coursesCatalog[activeCourseId];
      if (!course) return;
      const task = course.tasks.find(t => t.id === activeTaskId) || course.tasks[0];
      if (!task) return;

      const attachedKey = task.pendingFileKey || '';
      const attachedType = task.pendingFileType || '';
      const attachedSize = task.pendingFileSize || '';
      const attachedDataUrl = task.pendingFileDataUrl || '';

      task.submitted = true;
      task.isFinished = true;
      task.status = 'Finished';
      task.submittedFile = task.pendingFile || `student_${getCurrentStudent().id}_${task.id}_v${Date.now().toString().slice(-3)}.zip`;
      task.pendingFile = '';
      task.pendingFileKey = '';
      task.pendingFileType = '';
      task.pendingFileSize = '';
      task.pendingFileDataUrl = '';
      task.submittedAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const curStd = getCurrentStudent();
      if (!task.studentSubmissions) task.studentSubmissions = {};
      const existingRevs = ensureStudentSubmissionRevisions(task, curStd.id, course.code);
      const latestRev = existingRevs.length > 0 ? existingRevs[existingRevs.length - 1] : null;
      const canReplaceInPlace = !!(
        latestRev &&
        latestRev.status !== 'revision' &&
        (!latestRev.score || latestRev.score === 'Pending' || latestRev.score === '-')
      );
      if (canReplaceInPlace) {
        latestRev.file = task.submittedFile;
        latestRev.fileKey = attachedKey;
        latestRev.fileType = attachedType;
        latestRev.fileSize = attachedSize;
        latestRev.fileDataUrl = attachedDataUrl;
        latestRev.submittedAt = task.submittedAt;
        latestRev.status = 'complete';
        latestRev.statusLabel = 'ส่งแล้ว';
      } else {
        const nextAttempt = existingRevs.length + 1;
        existingRevs.push({
          attempt: nextAttempt,
          file: task.submittedFile,
          fileKey: attachedKey,
          fileType: attachedType,
          fileSize: attachedSize,
          fileDataUrl: attachedDataUrl,
          submittedAt: task.submittedAt,
          status: 'complete',
          statusLabel: 'ส่งแล้ว',
          score: 'Pending',
          notes: []
        });
      }
      syncGroupSubmissionSnapshot(task, curStd.id, {
        submitted: true,
        score: 'Pending',
        status: 'Submitted',
        memberTaskStatus: 'Finished',
        file: task.submittedFile,
        submittedAt: task.submittedAt,
        revisions: existingRevs
      });
      if (typeof pushAppNotification === 'function') {
        pushAppNotification({
          type: 'submission',
          targetRole: 'teacher',
          course: course.code,
          title: `${curStd.shortName} ส่งงานแล้ว`,
          taskTitle: task.title,
          taskId: task.id,
          studentId: curStd.id,
          time: 'Just now',
          isNew: true
        });
      }
      saveCoursesCatalog();

      renderTaskDetailPage();
      renderCourseDetailPage();
      renderGlobalTasksHub();
      updateBreadcrumbUI(currentScreen);

      alertMessage(currentLanguage === 'th' ? `ส่งงาน "${task.title}" สำเร็จ!` : `Assignment "${task.title}" submitted successfully!`);
    }

    function postCommentReply() {
      const input = document.getElementById('replyInput');
      if (!input || !input.value.trim()) return;
      const text = input.value.trim();
      const course = coursesCatalog[activeCourseId] || coursesCatalog['CMM321'];
      const task = course ? (course.tasks.find(t => t.id === activeTaskId) || course.tasks[0]) : null;
      const curStd = getCurrentStudent();
      if (task) {
        if (!Array.isArray(task.comments)) task.comments = [];
        task.comments.push({
          author: `${curStd.shortName} (Student)`,
          role: 'student',
          time: 'Just now',
          text
        });
        saveCoursesCatalog();
      }
      input.value = '';
      renderTaskDetailPage();
      alertMessage("Reply posted to discussion!");
    }

    const defaultStudentProjects = [
      {
        id: 'proj-1',
        title: '3D Raymarching Volumetric Fog Engine',
        course: 'CMM321',
        description: 'Real-time raymarching shader for simulating atmospheric light scattering, participating media, and volumetric shadows using WebGL/GLSL.',
        url: 'https://github.com/atht-kmutt/raymarching-fog-321',
        createdBy: '67080500208',
        createdByName: 'Chonchanok C.',
        members: ['67080500208 Chonchanok C.', '67080500210 Naptanut C.', '67080500273 Supachaya L.'],
        status: 'Ready for Review',
        createdAt: '2026-09-18'
      },
      {
        id: 'proj-2',
        title: 'Full-Stack Student Project Hub & Attendance Tracker',
        course: 'CMM349',
        description: 'Dynamic reactive SPA application featuring role-based dashboards, real-time assignment review, and QR presence check-ins.',
        url: 'https://github.com/atht-kmutt/student-project-portal',
        createdBy: '67080500208',
        createdByName: 'Chonchanok C.',
        members: ['67080500208 Chonchanok C.', '67080500202 Kanyarat M.'],
        status: 'Ready for Review',
        createdAt: '2026-09-22'
      },
      {
        id: 'proj-3',
        title: 'Interactive Narrative Experience with Adaptive Audio',
        course: 'CMM310',
        description: 'Branching storyline multimedia game prototype with procedural sound synthesis and node-based dialogue state machine.',
        url: 'https://figma.com/@atht/interactive-narrative',
        createdBy: '67080500203',
        createdByName: 'Natthaphon R.',
        members: ['67080500203 Natthaphon R.', '67080500208 Chonchanok C.'],
        status: 'In Progress',
        createdAt: '2026-09-25'
      },
      {
        id: 'proj-4',
        title: 'Quaternion SLERP 3D Camera Rig & Motion System',
        course: 'CMM321',
        description: 'Smooth quaternion-based camera controller eliminating gimbal lock with spherical linear interpolation and trajectory smoothing.',
        url: 'https://github.com/atht-kmutt/cmm321-quaternion-slerp',
        createdBy: '67080200501',
        createdByName: 'Chonchanok S.',
        members: ['67080200501 Chonchanok S.', '67080500201 Thanawat P.'],
        status: 'In Review',
        createdAt: '2026-09-20'
      },
      {
        id: 'proj-5',
        title: 'Dual Quaternion Skeletal Mesh Deformer',
        course: 'CMM321',
        description: 'GPU-accelerated vertex transformation pipeline with dual quaternion skinning to eliminate volume loss at joint creases.',
        url: 'https://github.com/atht-kmutt/dual-quaternion-skinning',
        createdBy: '67080200501',
        createdByName: 'Chonchanok S.',
        members: ['67080200501 Chonchanok S.', '67080500204 Varin K.', '67080500205 Pimchanok T.'],
        status: 'In Progress',
        createdAt: '2026-09-23'
      },
      {
        id: 'proj-6',
        title: 'Real-Time WebSocket Microservices Architecture',
        course: 'CMM349',
        description: 'Distributed pub/sub messaging engine utilizing Redis clusters and WebSocket connection multiplexing.',
        url: 'https://github.com/atht-kmutt/websocket-chat-cmm349',
        createdBy: '67080200501',
        createdByName: 'Chonchanok S.',
        members: ['67080200501 Chonchanok S.', '67080500204 Varin K.', '67080500205 Pimchanok T.'],
        status: 'In Progress',
        createdAt: '2026-09-21'
      },
      {
        id: 'proj-7',
        title: 'Agile Sprint & Risk Matrix Management Portal',
        course: 'CMM390',
        description: 'End-to-end project charter, WBS schedule, critical path tracker, and sprint retrospective dashboard.',
        url: 'https://github.com/atht-kmutt/cmm390-project-mgmt',
        createdBy: '67080200501',
        createdByName: 'Chonchanok S.',
        members: ['67080200501 Chonchanok S.', '67080500201 Thanawat P.', '67080500202 Kanyarat M.'],
        status: 'In Progress',
        createdAt: '2026-09-18'
      },
      {
        id: 'proj-8',
        title: 'Acoustics & Ray Optics Interactive Simulator',
        course: 'CMM320',
        description: 'Interactive Snell refraction ray tracer and acoustic wave interference visualizer for multimedia physics.',
        url: 'https://github.com/atht-kmutt/cmm320-light-sound',
        createdBy: '67080200501',
        createdByName: 'Chonchanok S.',
        members: ['67080200501 Chonchanok S.', '67080500203 Natthaphon R.'],
        status: 'In Progress',
        createdAt: '2026-09-20'
      },
      {
        id: 'proj-9',
        title: 'Systems Thinking & Campus Problem-Solving Lab',
        course: 'GEN121',
        description: 'Structured problem-solving portfolio applying Fishbone root-cause analysis, 5-Whys, and Design Thinking.',
        url: 'https://figma.com/@atht/gen121-problem-solving',
        createdBy: '67080200501',
        createdByName: 'Chonchanok S.',
        members: ['67080200501 Chonchanok S.', '67080500204 Varin K.', '67080500205 Pimchanok T.'],
        status: 'In Progress',
        createdAt: '2026-09-19'
      }
    ];

    function getStoredProjects() {
      try {
        const raw = localStorage.getItem('atht_student_projects');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length >= defaultStudentProjects.length) return list;

          const existingIds = new Set(list.map(p => p.id));
          defaultStudentProjects.forEach(dp => {
            if (!existingIds.has(dp.id)) list.push(dp);
          });
          return list;
        }
      } catch (e) {}
      return defaultStudentProjects;
    }

    function saveStoredProjects(list) {
      try {
        localStorage.setItem('atht_student_projects', JSON.stringify(list));
      } catch (e) {}
    }

    const COURSES_CATALOG_STORAGE_KEY = 'atht_v2_courses_catalog_rev6';
    let hasSeededSimulatedTasks = false;
    let studentProjectsList = getStoredProjects();
    loadPersistedCoursesCatalog();
    ensureRelationalIntegrity();

    function loadPersistedCoursesCatalog() {
      try {
        const rawCat = localStorage.getItem(COURSES_CATALOG_STORAGE_KEY);
        if (rawCat) {
          const parsed = JSON.parse(rawCat);
          if (parsed && parsed.CMM321 && parsed.CMM349 && parsed.CMM310) {
            Object.keys(parsed).forEach(k => {
              coursesCatalog[k] = parsed[k];
            });
            return;
          }
        }
        // Migrate user-uploaded submissions and custom tasks from rev5 onto clean rev6 teams
        const rawPrev = localStorage.getItem('atht_v2_courses_catalog_rev5');
        if (rawPrev) {
          const prev = JSON.parse(rawPrev);
          if (prev && typeof prev === 'object') {
            Object.keys(prev).forEach(k => {
              const oldCourse = prev[k];
              const cleanCourse = coursesCatalog[k];
              if (!oldCourse || !cleanCourse || !Array.isArray(oldCourse.tasks) || !Array.isArray(cleanCourse.tasks)) return;
              oldCourse.tasks.forEach(ot => {
                if (!ot || !ot.id) return;
                const match = cleanCourse.tasks.find(ct => ct.id === ot.id);
                if (match) {
                  if (ot.studentSubmissions && typeof ot.studentSubmissions === 'object') {
                    match.studentSubmissions = match.studentSubmissions || {};
                    Object.keys(ot.studentSubmissions).forEach(sid => {
                      const sub = ot.studentSubmissions[sid];
                      const hasRealUpload = sub && Array.isArray(sub.revisions) && sub.revisions.some(r => r && (r.fileKey || r.fileDataUrl));
                      if (hasRealUpload) {
                        match.studentSubmissions[sid] = sub;
                      }
                    });
                  }
                } else if (String(ot.id).includes('-task-')) {
                  cleanCourse.tasks.push(ot);
                }
              });
            });
          }
        }
      } catch (e) {}
    }

    function saveCoursesCatalog() {
      try {
        localStorage.setItem(COURSES_CATALOG_STORAGE_KEY, JSON.stringify(coursesCatalog));
      } catch (e) {}
      if (hasSeededSimulatedTasks && typeof renderCalendar === 'function') {
        try { renderCalendar(); } catch (e) {}
      }
    }


    function seedSimulatedStudentTasks() {
      if (hasSeededSimulatedTasks) return;
      hasSeededSimulatedTasks = true;

      const allIds = Object.keys(studentDirectory || {});
      if (allIds.length === 0) return;

      const samplePoolByCourse = {
        CMM321: [
          { proj: 'proj-1', title: 'Volumetric Scattering Pass', desc: 'Implement Henyey-Greenstein phase function for atmospheric fog density.', due: 'Oct 05, 2026 (23:59)', pub: 'Sep 20, 2026', state: 'complete', score: '9.5/10', groupSize: 2 },
          { proj: 'proj-1', title: 'Raymarch Step Optimizer', desc: 'Adaptive step sizing and blue-noise jittering to reduce banding artifacts.', due: 'Oct 06, 2026 (23:59)', pub: 'Sep 21, 2026', state: 'revision', score: 'Revise', groupSize: 2 },
          { proj: 'proj-1', title: 'Temporal Reprojection Buffer', desc: 'Accumulate history frames with variance clipping for smooth volumetric lighting.', due: 'Oct 10, 2026 (23:59)', pub: 'Sep 24, 2026', state: 'pending', score: 'Pending', groupSize: 3 },
          { proj: 'proj-4', title: 'Quaternion SLERP Camera Rig', desc: 'Smooth orbital camera interpolation without gimbal lock across 360-degree pitch.', due: 'Oct 04, 2026 (23:59)', pub: 'Sep 19, 2026', state: 'complete2', score: '9/10', groupSize: 2 },
          { proj: 'proj-5', title: 'Dual Quaternion Skinning Shader', desc: 'Vertex shader skinning eliminating candy-wrapper joint collapse.', due: 'Oct 14, 2026 (23:59)', pub: 'Sep 27, 2026', state: 'complete', score: '8.5/10', groupSize: 1 }
        ],
        CMM349: [
          { proj: 'proj-2', title: 'QR Attendance Check-In API', desc: 'Signed time-rotating QR payload generator and verification endpoint.', due: 'Oct 03, 2026 (23:59)', pub: 'Sep 18, 2026', state: 'complete', score: '10/10', groupSize: 2 },
          { proj: 'proj-2', title: 'Role-Based Dashboard Guard', desc: 'Express JWT middleware enforcing Student, Teacher, and Admin permissions.', due: 'Oct 07, 2026 (23:59)', pub: 'Sep 22, 2026', state: 'revision', score: 'Revise', groupSize: 2 },
          { proj: 'proj-6', title: 'Redis Pub/Sub Chat Broker', desc: 'Horizontal WebSocket scaling using Redis channels and room state sync.', due: 'Oct 09, 2026 (23:59)', pub: 'Sep 23, 2026', state: 'complete2', score: '9/10', groupSize: 3 },
          { proj: 'proj-6', title: 'Typing Indicator & Read Receipts', desc: 'Debounced socket events for live typing status and message delivery acks.', due: 'Oct 15, 2026 (23:59)', pub: 'Sep 28, 2026', state: 'pending', score: 'Pending', groupSize: 1 }
        ],
        CMM310: [
          { proj: 'proj-3', title: 'Branching Dialogue Graph', desc: 'Node-based conversation editor with conditional flag branching.', due: 'Oct 08, 2026 (23:59)', pub: 'Sep 21, 2026', state: 'complete', score: '9.5/10', groupSize: 2 },
          { proj: 'proj-3', title: 'Adaptive FMOD Audio Mixer', desc: 'Dynamic soundtrack crossfading triggered by player combat state.', due: 'Oct 16, 2026 (23:59)', pub: 'Sep 27, 2026', state: 'revision', score: 'Revise', groupSize: 2 },
          { proj: 'proj-3', title: 'Combat State & Hitbox Tuner', desc: 'Responsive combat frames, knockback curves, and input buffering.', due: 'Oct 19, 2026 (23:59)', pub: 'Sep 29, 2026', state: 'pending', score: 'Pending', groupSize: 3 },
          { proj: 'proj-3', title: 'Procedural Dungeon Generator', desc: 'Seeded room placement with guaranteed pathing and loot distribution.', due: 'Oct 21, 2026 (23:59)', pub: 'Oct 01, 2026', state: 'complete2', score: '9/10', groupSize: 1 }
        ],
        CMM390: [
          { proj: 'proj-7', title: 'Gantt & Critical Path Schedule', desc: 'Build milestone dependencies, float time calculation, and resource allocation plan.', due: 'Oct 14, 2026 (23:59)', pub: 'Sep 25, 2026', state: 'complete', score: '9/10', groupSize: 2 },
          { proj: 'proj-7', title: 'Risk Mitigation & Budget Matrix', desc: 'Quantify schedule/cost risks with contingency triggers and owner assignments.', due: 'Oct 19, 2026 (23:59)', pub: 'Sep 29, 2026', state: 'revision', score: 'Revise', groupSize: 2 },
          { proj: 'proj-7', title: 'Agile Sprint Burn-Down Tracker', desc: 'Story point estimation, velocity tracking, and sprint review deck.', due: 'Oct 22, 2026 (23:59)', pub: 'Oct 02, 2026', state: 'pending', score: 'Pending', groupSize: 3 },
          { proj: 'proj-7', title: 'Stakeholder RACI Sign-off Matrix', desc: 'Clarify accountability and escalation paths across project streams.', due: 'Oct 24, 2026 (23:59)', pub: 'Oct 04, 2026', state: 'complete2', score: '9.5/10', groupSize: 1 }
        ],
        CMM320: [
          { proj: 'proj-8', title: 'Optical Prism Dispersion Model', desc: 'Simulate wavelength-dependent refraction and chromatic aberration curves.', due: 'Oct 15, 2026 (23:59)', pub: 'Sep 26, 2026', state: 'complete', score: '9/10', groupSize: 2 },
          { proj: 'proj-8', title: 'Room Acoustics Reverberation Lab', desc: 'Compute RT60 decay times and sound absorption coefficients.', due: 'Oct 21, 2026 (23:59)', pub: 'Oct 01, 2026', state: 'revision', score: 'Revise', groupSize: 2 },
          { proj: 'proj-8', title: 'Fourier Harmonics Visualizer', desc: 'Decompose complex acoustic waveforms into fundamental frequency spectra.', due: 'Oct 23, 2026 (23:59)', pub: 'Oct 03, 2026', state: 'pending', score: 'Pending', groupSize: 3 },
          { proj: 'proj-8', title: 'Fresnel Lens Polarization Test', desc: 'Measure polarized intensity via Malus Law across multi-slit filters.', due: 'Oct 25, 2026 (23:59)', pub: 'Oct 05, 2026', state: 'complete2', score: '8.5/10', groupSize: 1 }
        ],
        GEN121: [
          { proj: 'proj-9', title: 'Fishbone Root Cause Case Study', desc: 'Map systemic causes and prioritize high-leverage interventions.', due: 'Oct 17, 2026 (23:59)', pub: 'Sep 27, 2026', state: 'complete', score: '9.5/10', groupSize: 2 },
          { proj: 'proj-9', title: 'Ideation & Rapid Prototype Log', desc: 'Iterate 3 solution concepts with user feedback and learning reflection.', due: 'Oct 22, 2026 (23:59)', pub: 'Oct 02, 2026', state: 'revision', score: 'Revise', groupSize: 2 },
          { proj: 'proj-9', title: 'Design Thinking Field Empathy Map', desc: 'Synthesize user interviews into actionable problem statements.', due: 'Oct 24, 2026 (23:59)', pub: 'Oct 04, 2026', state: 'pending', score: 'Pending', groupSize: 3 },
          { proj: 'proj-9', title: 'Metacognitive Reflection Essay', desc: 'Evaluate structured problem-solving strategies and decision outcomes.', due: 'Oct 26, 2026 (23:59)', pub: 'Oct 06, 2026', state: 'complete2', score: '9/10', groupSize: 1 }
        ]
      };

      let didAddAny = false;
      Object.entries(coursesCatalog).forEach(([cCode, course]) => {
        if (!course) return;
        if (!Array.isArray(course.tasks)) course.tasks = [];

        const coveredInCourse = new Set();
        course.tasks.forEach(t => {
          if (t.createdBy) coveredInCourse.add(t.createdBy);
          (t.members || []).forEach(m => {
            if (m.id) coveredInCourse.add(m.id);
            else if (m.name) coveredInCourse.add(getStudentProfile(m.name).id);
          });
        });

        const missingForCourse = allIds.filter(id => !coveredInCourse.has(id));
        if (missingForCourse.length === 0) return;
        didAddAny = true;

        const pool = samplePoolByCourse[cCode] || samplePoolByCourse.CMM321;
        const teacherName = 'T. ' + (course.teacher || 'Instructor');
        let cursor = 0;
        let simIdx = course.tasks.filter(t => String(t.id || '').startsWith('sim-')).length + 1;

        while (cursor < missingForCourse.length) {
          const tpl = pool[(simIdx - 1) % pool.length];
          const size = Math.min(tpl.groupSize, missingForCourse.length - cursor);
          const groupIds = missingForCourse.slice(cursor, cursor + size);
          cursor += size;

          const isDone = tpl.state === 'complete' || tpl.state === 'complete2';
          const isRev = tpl.state === 'revision';
          const members = groupIds.map((sid, idx) => {
            const prof = getStudentProfile(sid);
            return {
              id: prof.id,
              name: prof.shortName,
              role: idx === 0 ? 'Leader' : 'Member',
              taskStatus: isDone ? `Graded (${tpl.score})` : (isRev ? 'Revision Requested' : 'Active'),
              score: tpl.score
            };
          });

          const leader = getStudentProfile(groupIds[0]);
          const taskId = `sim-${cCode.toLowerCase()}-${simIdx}`;
          let baseRevs = [];
          if (tpl.state === 'revision') {
            baseRevs = [{
              attempt: 1,
              file: `group_${leader.id}_${taskId}_v1.zip`,
              submittedAt: 'Sep 22, 2026',
              status: 'revision',
              statusLabel: 'รอแก้',
              score: 'Revise',
              notes: [{ author: teacherName, role: 'teacher', time: 'Sep 23, 2026', text: 'กรุณาปรับปรุงรายละเอียดงานและส่งใหม่อีกครั้ง' }]
            }];
          } else if (tpl.state === 'complete2') {
            baseRevs = [
              {
                attempt: 1,
                file: `group_${leader.id}_${taskId}_v1.zip`,
                submittedAt: 'Sep 21, 2026',
                status: 'revision',
                statusLabel: 'รอแก้',
                score: 'Revise',
                notes: [{ author: teacherName, role: 'teacher', time: 'Sep 22, 2026', text: 'โครงสร้างไฟล์ยังไม่ครบถ้วน รบกวนแก้ไขและส่งครั้งที่ 2' }]
              },
              {
                attempt: 2,
                file: `group_${leader.id}_${taskId}_v2.zip`,
                submittedAt: 'Sep 26, 2026',
                status: 'complete',
                statusLabel: 'ส่งแล้ว',
                score: tpl.score,
                notes: [{ author: teacherName, role: 'teacher', time: 'Sep 27, 2026', text: 'แก้ไขครบถ้วนแล้ว ผ่านเกณฑ์ครับ' }]
              }
            ];
          } else if (tpl.state === 'complete') {
            baseRevs = [{
              attempt: 1,
              file: `group_${leader.id}_${taskId}_v1.zip`,
              submittedAt: 'Sep 25, 2026',
              status: 'complete',
              statusLabel: 'ส่งแล้ว',
              score: tpl.score,
              notes: [{ author: teacherName, role: 'teacher', time: 'Sep 26, 2026', text: 'ส่งงานเรียบร้อย ผลงานดีครับ' }]
            }];
          }

          const initialSubs = {};
          const latestRev = baseRevs.length > 0 ? baseRevs[baseRevs.length - 1] : null;
          groupIds.forEach(sid => {
            initialSubs[sid] = {
              submitted: isDone,
              score: tpl.score,
              status: isDone ? `Graded (${tpl.score})` : (isRev ? 'Revision Requested' : 'Pending'),
              file: latestRev ? latestRev.file : '',
              submittedAt: latestRev ? latestRev.submittedAt : '',
              revisions: JSON.parse(JSON.stringify(baseRevs))
            };
          });

          course.tasks.push({
            id: taskId,
            projectId: tpl.proj,
            createdBy: leader.id,
            title: `${tpl.title} (#${simIdx})`,
            due: tpl.due,
            publishDate: tpl.pub,
            status: isDone ? `Graded (${tpl.score})` : (isRev ? 'Revision Requested' : 'Active'),
            isFinished: isDone,
            submitted: isDone,
            score: tpl.score,
            submittedFile: latestRev ? latestRev.file : '',
            type: size === 1 ? 'Individual' : `Group Project (${size} Members)`,
            description: tpl.desc,
            members,
            studentSubmissions: initialSubs
          });

          simIdx++;
        }
      });

      if (didAddAny) saveCoursesCatalog();
    }

    function enforceCourseCanonicalTeams(course) {
      if (!course || !Array.isArray(course.tasks)) return;
      const canonicalTeamByStudent = new Map();

      course.tasks.forEach(task => {
        if (!task) return;
        const rawList = Array.isArray(task.members) ? task.members : [];
        const normalized = [];
        const seenIds = new Set();
        rawList.forEach((m, idx) => {
          if (!m) return;
          const mp = getStudentProfile(m.id || m.name);
          if (!mp || !mp.id || seenIds.has(mp.id)) return;
          seenIds.add(mp.id);
          normalized.push({
            id: mp.id,
            name: mp.shortName,
            role: idx === 0 ? 'Leader' : (m.role === 'Leader' ? 'Member' : (m.role || 'Member')),
            taskTitle: m.taskTitle || '',
            taskStatus: m.taskStatus || 'Active',
            score: m.score || 'Pending'
          });
        });

        if (normalized.length === 0 && task.createdBy) {
          const op = getStudentProfile(task.createdBy);
          if (op && op.id) {
            normalized.push({ id: op.id, name: op.shortName, role: 'Leader', taskStatus: 'Active', score: 'Pending' });
          }
        }

        const ownerId = (task.createdBy && getStudentProfile(task.createdBy).id) || (normalized[0] && normalized[0].id) || null;
        let finalMembers;
        if (ownerId && canonicalTeamByStudent.has(ownerId)) {
          const template = canonicalTeamByStudent.get(ownerId);
          const prevById = new Map(normalized.map(m => [m.id, m]));
          finalMembers = template.map((tm, idx) => {
            const existing = prevById.get(tm.id);
            return {
              id: tm.id,
              name: tm.name,
              role: idx === 0 ? 'Leader' : (tm.role || 'Member'),
              taskTitle: (existing && existing.taskTitle) || tm.taskTitle || '',
              taskStatus: (existing && existing.taskStatus) || (task.isFinished ? `Graded (${task.score || '9/10'})` : 'Active'),
              score: (existing && existing.score) || task.score || 'Pending'
            };
          });
        } else {
          let clean = normalized.filter(m => !canonicalTeamByStudent.has(m.id));
          if (clean.length === 0 && ownerId) {
            const op = getStudentProfile(ownerId);
            clean = [{ id: op.id, name: op.shortName, role: 'Leader', taskStatus: 'Active', score: 'Pending' }];
          }
          finalMembers = clean.map((m, idx) => ({
            ...m,
            role: idx === 0 ? 'Leader' : (m.role === 'Leader' ? 'Member' : (m.role || 'Member'))
          }));
          finalMembers.forEach(m => canonicalTeamByStudent.set(m.id, finalMembers));
        }

        task.members = finalMembers;
        if (finalMembers.length > 0) {
          task.createdBy = finalMembers[0].id;
        }
        const curTypeLower = String(task.type || '').toLowerCase();
        if (finalMembers.length <= 1) {
          task.type = 'Individual';
        } else if (curTypeLower.includes('pair') && finalMembers.length === 2) {
          task.type = 'Pair (2 Members)';
        } else {
          task.type = `Group Project (${finalMembers.length} Members)`;
        }

        if (task.studentSubmissions) {
          const allowedIds = new Set(finalMembers.map(m => m.id));
          Object.keys(task.studentSubmissions).forEach(sid => {
            if (!allowedIds.has(sid)) {
              delete task.studentSubmissions[sid];
            }
          });
        }
      });
    }

    function ensureRelationalIntegrity() {
      Object.values(coursesCatalog).forEach(course => enforceCourseCanonicalTeams(course));
      seedSimulatedStudentTasks();
      Object.values(coursesCatalog).forEach(course => enforceCourseCanonicalTeams(course));
      const courseProjectMap = {
        CMM321: ['proj-1', 'proj-4', 'proj-5'],
        CMM349: ['proj-2', 'proj-6'],
        CMM310: ['proj-3'],
        CMM390: ['proj-7'],
        CMM320: ['proj-8'],
        GEN121: ['proj-9']
      };
      Object.entries(coursesCatalog).forEach(([cCode, course]) => {
        const cProjs = studentProjectsList.filter(p => p.course === cCode);
        (course.tasks || []).forEach((task, idx) => {
          if (!task.projectId) {
            const pList = cProjs.length > 0 ? cProjs : (courseProjectMap[cCode] || []).map(id => ({ id }));
            task.projectId = (pList[idx % Math.max(1, pList.length)] || {}).id || `proj-${cCode.toLowerCase()}-1`;
          }
          if (!Array.isArray(task.comments) || task.comments.length === 0) {
            task.comments = [
              {
                author: `T. ${course.teacher}`,
                role: 'teacher',
                time: 'Sep 20, 10:14 AM',
                text: task.isFinished
                  ? 'Good Job! Deliverable verified and meets course requirements.'
                  : 'Please submit your project deliverable archive before the due date.'
              }
            ];
          }
          if (!task.studentSubmissions) {
            task.studentSubmissions = {};
          }
          (task.members || []).forEach(m => {
            if (!m.id && m.name) {
              m.id = getStudentProfile(m.name).id;
            }
            if (m.id && !task.studentSubmissions[m.id]) {
              const isUserCreated = String(task.id || '').includes('-task-');
              const isSub = !isUserCreated && (task.isFinished || (m.taskStatus && (m.taskStatus.toLowerCase().includes('graded') || m.taskStatus.toLowerCase().includes('review') || m.taskStatus.toLowerCase().includes('finish'))));
              task.studentSubmissions[m.id] = {
                submitted: !!isSub,
                score: isSub ? (m.score && m.score !== '-' ? m.score : (task.isFinished ? '9/10' : 'Pending')) : 'Pending',
                status: isSub ? (m.taskStatus || task.status || 'Submitted') : 'Pending',
                file: isSub ? `student_${m.id}_${task.id}.zip` : '',
                submittedAt: isSub ? (task.publishDate || 'Sep 28, 2026') : ''
              };
            }
          });
          if (isGroupTask(task)) {
            const firstMem = (task.members || []).find(m => m && m.id);
            if (firstMem) ensureStudentSubmissionRevisions(task, firstMem.id, cCode);
            (task.members || []).forEach(m => {
              if (m && m.id) ensureStudentSubmissionRevisions(task, m.id, cCode);
            });
          }
        });
      });
    }

    function syncAllATHTData() {
      ensureRelationalIntegrity();
      saveCoursesCatalog();
      saveStoredProjects(studentProjectsList);
      return getATHTDatabaseSnapshot();
    }

    function getATHTDatabaseSnapshot() {
      ensureRelationalIntegrity();
      const courses = [];
      const tasks = [];
      const taskMembers = [];
      const submissions = [];
      const files = [];

      Object.entries(coursesCatalog).forEach(([cCode, course]) => {
        if (!course) return;
        courses.push({
          code: course.code || cCode,
          title: course.title,
          teacher: course.teacher,
          schedule: course.schedule || ''
        });
        (course.tasks || []).forEach(t => {
          tasks.push({
            id: t.id,
            courseCode: course.code || cCode,
            projectId: t.projectId || null,
            createdBy: t.createdBy || null,
            title: t.title,
            description: t.description || '',
            type: t.type || 'Individual',
            publishDate: t.publishDate || '',
            due: t.due || '',
            status: t.status || 'Active',
            score: t.score || 'Pending'
          });
          (t.members || []).forEach(m => {
            taskMembers.push({
              taskId: t.id,
              courseCode: course.code || cCode,
              studentId: m.id,
              studentName: m.name,
              role: m.role || 'Member',
              score: m.score || 'Pending'
            });
          });
          if (t.studentSubmissions) {
            Object.entries(t.studentSubmissions).forEach(([sid, sub]) => {
              const revs = Array.isArray(sub.revisions) ? sub.revisions : [];
              const lr = revs.length > 0 ? revs[revs.length - 1] : null;
              submissions.push({
                taskId: t.id,
                courseCode: course.code || cCode,
                studentId: sid,
                submitted: !!sub.submitted,
                status: sub.status || 'Pending',
                score: (lr && lr.score) || sub.score || 'Pending',
                fileName: (lr && lr.file) || sub.file || '',
                fileKey: (lr && lr.fileKey) || sub.fileKey || '',
                fileSize: (lr && lr.fileSize) || sub.fileSize || '',
                fileType: (lr && lr.fileType) || sub.fileType || '',
                submittedAt: (lr && lr.submittedAt) || sub.submittedAt || ''
              });
              revs.forEach(r => {
                if (r && r.file) {
                  files.push({
                    taskId: t.id,
                    studentId: sid,
                    attempt: r.attempt,
                    fileName: r.file,
                    fileKey: r.fileKey || '',
                    fileSize: r.fileSize || '',
                    fileType: r.fileType || '',
                    hasDataUrl: !!(r.fileDataUrl),
                    submittedAt: r.submittedAt || ''
                  });
                }
              });
            });
          }
        });
      });

      return {
        version: COURSES_CATALOG_STORAGE_KEY,
        exportedAt: new Date().toISOString(),
        courses,
        projects: studentProjectsList.map(p => ({ ...p })),
        tasks,
        taskMembers,
        submissions,
        files,
        students: Object.values(studentDirectory || {}),
        teachers: Object.values(teacherDirectory || {})
      };
    }
    if (typeof window !== 'undefined') {
      window.syncAllATHTData = syncAllATHTData;
      window.getATHTDatabaseSnapshot = getATHTDatabaseSnapshot;
    }

    function isGroupTask(task) {
      if (!task) return false;
      const typeLower = String(task.type || '').toLowerCase();
      if (typeLower === 'individual') return false;
      return Array.isArray(task.members) && task.members.length > 1;
    }

    function getGroupSyncStudentIds(task, primaryStudentId) {
      const ids = new Set();
      if (primaryStudentId) ids.add(primaryStudentId);
      if (isGroupTask(task)) {
        if (task.createdBy) ids.add(task.createdBy);
        (task.members || []).forEach(m => {
          if (m && m.id) ids.add(m.id);
          else if (m && m.name) ids.add(getStudentProfile(m.name).id);
        });
      }
      return [...ids];
    }

    function syncGroupSubmissionSnapshot(task, primaryStudentId, snapshot) {
      if (!task || !snapshot) return;
      if (!task.studentSubmissions) task.studentSubmissions = {};
      const targetIds = getGroupSyncStudentIds(task, primaryStudentId);
      const latestSnapRev = Array.isArray(snapshot.revisions) && snapshot.revisions.length > 0
        ? snapshot.revisions[snapshot.revisions.length - 1]
        : null;
      if (snapshot.file) task.submittedFile = snapshot.file;
      if (snapshot.submittedAt) task.submittedAt = snapshot.submittedAt;
      targetIds.forEach(sid => {
        const clonedRevs = JSON.parse(JSON.stringify(snapshot.revisions || []));
        task.studentSubmissions[sid] = {
          submitted: !!snapshot.submitted,
          score: snapshot.score || 'Pending',
          status: snapshot.status || 'Pending',
          file: snapshot.file || (latestSnapRev ? latestSnapRev.file : '') || '',
          fileKey: (latestSnapRev && latestSnapRev.fileKey) || '',
          fileType: (latestSnapRev && latestSnapRev.fileType) || '',
          fileSize: (latestSnapRev && latestSnapRev.fileSize) || '',
          submittedAt: snapshot.submittedAt || (latestSnapRev ? latestSnapRev.submittedAt : '') || '',
          revisions: clonedRevs
        };
      });
      if (Array.isArray(task.members)) {
        const targetSet = new Set(targetIds);
        task.members.forEach(m => {
          const mId = m.id || getStudentProfile(m.name).id;
          if (targetSet.has(mId)) {
            if (snapshot.score !== undefined) m.score = snapshot.score;
            m.taskStatus = snapshot.memberTaskStatus || snapshot.status || m.taskStatus;
          }
        });
      }
    }

    function getGroupCanonicalRevisionState(task) {
      if (!task || !task.studentSubmissions) return null;
      const memberIds = getGroupSyncStudentIds(task, task.createdBy);
      let best = null;
      let bestScore = -1;
      memberIds.forEach(sid => {
        const s = task.studentSubmissions[sid];
        if (!s || !Array.isArray(s.revisions)) return;
        const len = s.revisions.length;
        const revBonus = s.submitted || len > 0 ? 10 : 0;
        const weight = len * 100 + revBonus;
        if (weight > bestScore) {
          bestScore = weight;
          best = s;
        }
      });
      return best;
    }

    function ensureStudentSubmissionRevisions(task, studentId, courseCode) {
      if (!task) return [];
      if (!task.studentSubmissions) task.studentSubmissions = {};
      let sub = task.studentSubmissions[studentId];

      if (isGroupTask(task)) {
        const canonical = getGroupCanonicalRevisionState(task);
        if (canonical && Array.isArray(canonical.revisions)) {
          const curLen = (sub && Array.isArray(sub.revisions)) ? sub.revisions.length : -1;
          const canonLen = canonical.revisions.length;
          if (!sub || !Array.isArray(sub.revisions) || curLen < canonLen || (canonLen > 0 && sub.status !== canonical.status)) {
            const cloned = JSON.parse(JSON.stringify(canonical.revisions));
            task.studentSubmissions[studentId] = {
              submitted: !!canonical.submitted,
              score: canonical.score || 'Pending',
              status: canonical.status || 'Pending',
              file: canonical.file || '',
              submittedAt: canonical.submittedAt || '',
              revisions: cloned
            };
            return cloned;
          }
        }
      }

      if (sub && Array.isArray(sub.revisions)) {
        return sub.revisions;
      }

      const course = coursesCatalog[courseCode] || coursesCatalog['CMM321'];
      const teacherName = 'T. ' + ((course && course.teacher) || 'Instructor');
      const prof = getStudentProfile(studentId);
      const memberEntry = (task.members || []).find(m =>
        m.id === studentId || (m.name && prof.shortName && m.name.toLowerCase().includes(prof.shortName.toLowerCase()))
      );
      const tail = parseInt(String(studentId).slice(-1), 10) || 0;
      const mid = parseInt(String(studentId).slice(-2), 10) || 0;

      let hasSubmitted = false;
      let isRevReq = false;
      let baseScore = 'Pending';
      let baseFile = `student_${studentId}_${task.id}.zip`;
      let baseDate = task.due || 'Sep 25, 2026';

      if (sub) {
        hasSubmitted = !!sub.submitted;
        isRevReq = String(sub.status || '').toLowerCase().includes('revision') || String(sub.status || '').includes('รอแก้');
        baseScore = sub.score || (hasSubmitted ? '9/10' : 'Pending');
        baseFile = sub.file || baseFile;
        baseDate = sub.submittedAt || baseDate;
      } else if (memberEntry) {
        const st = (memberEntry.taskStatus || '').toLowerCase();
        isRevReq = st.includes('revision') || st.includes('รอแก้');
        hasSubmitted = !isRevReq && (task.isFinished || st.includes('graded') || st.includes('review') || st.includes('finish') || st.includes('complete'));
        baseScore = memberEntry.score || (hasSubmitted ? '9/10' : 'Pending');
      } else if (String(task.id || '').includes('-task-')) {
        hasSubmitted = false;
        isRevReq = false;
        baseScore = 'Pending';
      } else {
        if (tail === 3 || tail === 7) {
          isRevReq = true;
          hasSubmitted = false;
        } else {
          hasSubmitted = task.isFinished ? (tail % 3 !== 0) : (tail % 2 === 0);
        }
        baseScore = hasSubmitted ? ((mid % 3 === 0) ? '10/10' : (mid % 2 === 0 ? '9/10' : '8.5/10')) : 'Pending';
      }

      const revisions = [];
      if (isRevReq) {
        revisions.push({
          attempt: 1,
          file: `student_${studentId}_${task.id}_v1.zip`,
          submittedAt: 'Sep 22, 2026',
          status: 'revision',
          statusLabel: 'รอแก้',
          score: 'Revise',
          notes: [{
            author: teacherName,
            role: 'teacher',
            time: 'Sep 23, 2026',
            text: 'กรุณาปรับปรุงรายละเอียดงานและส่งใหม่อีกครั้ง'
          }]
        });
      } else if (hasSubmitted) {
        if (tail % 4 === 2) {
          revisions.push({
            attempt: 1,
            file: `student_${studentId}_${task.id}_v1.zip`,
            submittedAt: 'Sep 21, 2026',
            status: 'revision',
            statusLabel: 'รอแก้',
            score: 'Revise',
            notes: [{
              author: teacherName,
              role: 'teacher',
              time: 'Sep 22, 2026',
              text: 'โครงสร้างไฟล์ยังไม่ครบถ้วน รบกวนแก้ไขและส่งครั้งที่ 2'
            }]
          });
          revisions.push({
            attempt: 2,
            file: `student_${studentId}_${task.id}_v2.zip`,
            submittedAt: 'Sep 26, 2026',
            status: 'complete',
            statusLabel: 'ส่งแล้ว',
            score: baseScore,
            notes: [{
              author: teacherName,
              role: 'teacher',
              time: 'Sep 27, 2026',
              text: 'แก้ไขครบถ้วนแล้ว ผ่านเกณฑ์ครับ'
            }]
          });
        } else {
          revisions.push({
            attempt: 1,
            file: baseFile,
            submittedAt: baseDate,
            status: 'complete',
            statusLabel: 'ส่งแล้ว',
            score: baseScore,
            notes: [{
              author: teacherName,
              role: 'teacher',
              time: baseDate,
              text: 'ส่งงานเรียบร้อย ผลงานดีครับ'
            }]
          });
        }
      }

      task.studentSubmissions[studentId] = {
        submitted: hasSubmitted,
        score: baseScore,
        status: isRevReq ? 'Revision Requested' : (hasSubmitted ? `Graded (${baseScore})` : 'Pending'),
        file: revisions.length > 0 ? revisions[revisions.length - 1].file : '',
        submittedAt: revisions.length > 0 ? revisions[revisions.length - 1].submittedAt : '',
        revisions
      };
      return revisions;
    }

    function getStudentCourseTaskInfo(studentId, courseCode, projectId = null, specificTaskId = null) {
      const course = coursesCatalog[courseCode] || coursesCatalog['CMM321'];
      const prof = getStudentProfile(studentId);
      const tasks = (course && course.tasks) || [];
      if (tasks.length === 0) {
        return {
          student: prof,
          courseCode: course ? course.code : 'CMM321',
          taskId: 'default-t1',
          taskTitle: 'Task 1: Project Deliverable',
          due: 'Sep 30, 2026 (23:59)',
          isComplete: false,
          score: 'Pending',
          file: `student_${studentId}_deliverable.zip`
        };
      }


      let candidateTasks = projectId ? tasks.filter(t => t.projectId === projectId) : tasks;
      if (candidateTasks.length === 0) candidateTasks = tasks;

      const isStudentInTask = (t) => {
        if (!t) return false;
        if (t.createdBy === studentId) return true;
        return (t.members || []).some(m =>
          m.id === studentId ||
          (m.name && prof.shortName && m.name.toLowerCase() === prof.shortName.toLowerCase())
        );
      };

      const revCandidate = [...candidateTasks].reverse();
      const revAll = [...tasks].reverse();

      let matchedTask = specificTaskId ? tasks.find(t => t.id === specificTaskId) : null;
      if (!matchedTask) {
        matchedTask = revCandidate.find(isStudentInTask)
          || revAll.find(isStudentInTask)
          || revCandidate.find(t => t.studentSubmissions && t.studentSubmissions[studentId] && Array.isArray(t.studentSubmissions[studentId].revisions) && t.studentSubmissions[studentId].revisions.length > 0)
          || revAll.find(t => t.studentSubmissions && t.studentSubmissions[studentId] && Array.isArray(t.studentSubmissions[studentId].revisions) && t.studentSubmissions[studentId].revisions.length > 0);
      }

      if (!matchedTask) {
        const numId = parseInt(String(studentId).slice(-3), 10) || 0;
        matchedTask = candidateTasks[numId % candidateTasks.length] || tasks[0];
      }

      const revisions = ensureStudentSubmissionRevisions(matchedTask, studentId, course.code);
      const latestRev = revisions.length > 0 ? revisions[revisions.length - 1] : null;
      const submissionStatus = !latestRev
        ? 'pending'
        : (latestRev.status === 'revision' ? 'revision' : 'complete');
      const isComplete = submissionStatus === 'complete';
      const isRevision = submissionStatus === 'revision';
      const score = latestRev ? (latestRev.score || 'Pending') : 'Pending';

      const allStudentTasks = typeof getStudentTasksInCourse === 'function'
        ? getStudentTasksInCourse(studentId, course.code)
        : [matchedTask];
      const effectiveTasks = allStudentTasks.length > 0 ? allStudentTasks : [matchedTask];

      let submittedTasksCount = 0;
      let revisionTasksCount = 0;
      let latestSubmittedTask = null;
      effectiveTasks.forEach(tObj => {
        const tRevs = ensureStudentSubmissionRevisions(tObj, studentId, course.code);
        const tLast = tRevs.length > 0 ? tRevs[tRevs.length - 1] : null;
        if (tLast && tLast.status === 'complete') {
          submittedTasksCount++;
          latestSubmittedTask = tObj;
        } else if (tLast && tLast.status === 'revision') {
          revisionTasksCount++;
          if (!latestSubmittedTask) latestSubmittedTask = tObj;
        }
      });

      // When showing summary row (!specificTaskId) and student has submitted some tasks, surface the latest submitted task so Teacher's row matches!
      if (!specificTaskId && latestSubmittedTask && submissionStatus === 'pending') {
        matchedTask = latestSubmittedTask;
      }

      const finalRevs = ensureStudentSubmissionRevisions(matchedTask, studentId, course.code);
      const finalLatestRev = finalRevs.length > 0 ? finalRevs[finalRevs.length - 1] : null;
      const finalTaskStatus = !finalLatestRev
        ? 'pending'
        : (finalLatestRev.status === 'revision' ? 'revision' : 'complete');
      const finalScore = finalLatestRev ? (finalLatestRev.score || 'Pending') : 'Pending';

      const totalTasksCount = effectiveTasks.length;
      const aggregateStatus = (!specificTaskId && totalTasksCount > 1)
        ? (revisionTasksCount > 0 ? 'revision' : (submittedTasksCount > 0 ? 'complete' : 'pending'))
        : finalTaskStatus;

      return {
        student: prof,
        courseCode: course.code,
        task: matchedTask,
        taskId: matchedTask.id,
        taskTitle: matchedTask.title,
        taskCount: totalTasksCount,
        submittedTasksCount,
        revisionTasksCount,
        due: (finalLatestRev && finalLatestRev.submittedAt) || matchedTask.due || 'Sep 30, 2026 (23:59)',
        isComplete: aggregateStatus === 'complete',
        isRevision: aggregateStatus === 'revision',
        submissionStatus: aggregateStatus,
        taskSubmissionStatus: finalTaskStatus,
        revisions: finalRevs,
        revisionCount: finalRevs.length,
        score: finalScore,
        file: (finalLatestRev && finalLatestRev.file) || ''
      };
    }

    let activeProjectsFilter = 'ALL';

    function setProjectsFilter(courseCode) {
      activeProjectsFilter = courseCode;
      if (courseCode !== 'ALL') {
        activeCourseId = courseCode;
      } else {
        activeCourseId = 'ALL';
      }
      const filters = ['ALL', 'CMM321', 'CMM349', 'CMM310', 'CMM390', 'CMM320', 'GEN121'];
      filters.forEach(code => {
        const btn = document.getElementById(`projFilter${code}`);
        if (btn) {
          if (code === courseCode) {
            btn.className = 'px-2.5 sm:px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white font-bold shadow-2xs transition whitespace-nowrap';
          } else {
            btn.className = 'px-2.5 sm:px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition font-medium whitespace-nowrap';
          }
        }
      });
      renderProjectsScreen();
      if (currentScreen === 'projects') {
        updateBreadcrumbUI('projects');
      }
    }

    function clearTeacherProjectsStudentFilter() {
      activeReviewStudentId = null;
      renderProjectsScreen();
    }

    function filterProjectsList() {
      const searchInput = document.getElementById('projectsSearchInput');
      const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

      let filtered = studentProjectsList;
      if (currentUserRole === 'teacher') {
        const allowedCodes = getTeacherAssignedCourseCodes();
        filtered = filtered.filter(p => allowedCodes.includes(p.course));
      }
      if (activeProjectsFilter !== 'ALL') {
        filtered = filtered.filter(p => p.course === activeProjectsFilter);
      }

      if (currentUserRole === 'teacher' && activeReviewStudentId) {
        const prof = getStudentProfile(activeReviewStudentId);
        filtered = filtered.filter(p => {
          const isCreator = p.createdBy === activeReviewStudentId || (p.createdByName && p.createdByName.includes(prof.shortName));
          const isMember = (p.members || []).some(m => m.includes(activeReviewStudentId) || m.includes(prof.shortName));
          return isCreator || isMember;
        });
      }

      if (query) {
        filtered = filtered.filter(p => {
          const matchTitle = (p.title || '').toLowerCase().includes(query);
          const matchDesc = (p.description || '').toLowerCase().includes(query);
          const matchCourse = (p.course || '').toLowerCase().includes(query);
          const matchAuthor = (p.createdByName || '').toLowerCase().includes(query);
          const matchMembers = (p.members || []).some(m => m.toLowerCase().includes(query));
          return matchTitle || matchDesc || matchCourse || matchAuthor || matchMembers;
        });
      }

      const countBadge = document.getElementById('projectsCountBadge');
      if (countBadge) {
        const isThai = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
        countBadge.innerText = isThai
          ? `แสดง ${filtered.length} โปรเจกต์`
          : `Showing ${filtered.length} Project${filtered.length === 1 ? '' : 's'}`;
      }

      renderProjectsCards(filtered);
      if (typeof translateDOM === 'function') translateDOM(currentLanguage);
    }

    function renderProjectsScreen() {
      const isTeacher = currentUserRole === 'teacher';
      const isAdmin = currentUserRole === 'admin';
      const isThai = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
      const titleEl = document.getElementById('projectsScreenTitle');
      const subtitleEl = document.getElementById('projectsScreenSubtitle');
      const roleHintEl = document.getElementById('projectsRoleHint');
      const createBtn = document.getElementById('btnOpenCreateProject');

      const courseData = activeProjectsFilter !== 'ALL' ? coursesCatalog[activeProjectsFilter] : null;

      const allFilterCodes = ['CMM321', 'CMM349', 'CMM310', 'CMM390', 'CMM320', 'GEN121'];
      const allowedTeacherCodes = isTeacher ? getTeacherAssignedCourseCodes() : allFilterCodes;
      if (isTeacher && activeProjectsFilter !== 'ALL' && !allowedTeacherCodes.includes(activeProjectsFilter)) {
        activeProjectsFilter = 'ALL';
      }
      allFilterCodes.forEach(code => {
        const btn = document.getElementById(`projFilter${code}`);
        if (btn) btn.classList.toggle('hidden', isTeacher && !allowedTeacherCodes.includes(code));
      });

      if (isTeacher) {
        if (titleEl) {
          titleEl.innerText = courseData
            ? `${courseData.code} - ${isThai ? 'โปรเจกต์นักศึกษา' : 'Student Projects'}`
            : (isThai ? 'โปรเจกต์นักศึกษา (มุมมองอาจารย์)' : 'Student Projects (Teacher View)');
        }
        if (subtitleEl) {
          subtitleEl.innerText = courseData
            ? (isThai ? `ตรวจสอบคลังงานและผลงานทีมสำหรับวิชา ${courseData.title} เลือกโปรเจกต์เพื่อตรวจงาน` : `Inspect repositories and team deliverables for ${courseData.title}. Select any project to review tasks.`)
            : (isThai ? 'ตรวจสอบและติดตามความคืบหน้าผลงานและสถานะการทำงานของนักศึกษา' : 'Inspect and review student repositories, deliverables, and team collaboration status.');
        }
        if (roleHintEl) {
          roleHintEl.innerText = isThai
            ? '• มุมมองอาจารย์: เลือกโปรเจกต์นักศึกษาด้านล่างเพื่อตรวจดูงานและผลงานที่ส่ง'
            : '• Teacher View: Select any student project below to view its tasks and deliverables.';
        }
        if (createBtn) createBtn.classList.add('hidden');
      } else {
        if (titleEl) {
          titleEl.innerText = courseData
            ? `${courseData.code} - ${isThai ? 'โปรเจกต์' : 'Projects'}`
            : (isThai ? 'โปรเจกต์ในรายวิชา' : 'Course Projects');
        }
        if (subtitleEl) {
          subtitleEl.innerText = courseData
            ? (isThai ? `โปรเจกต์กลุ่มสำหรับวิชา ${courseData.title} สามารถสร้างหรือเลือกโปรเจกต์เพื่อดูรายการงาน` : `Group projects for ${courseData.title}. Create any project below, then select to view tasks.`)
            : (isThai ? 'โปรเจกต์กลุ่มประจำภาคการศึกษา สร้างโปรเจกต์ใหม่ หรือเลือกโปรเจกต์เพื่อดูรายการงาน' : 'Collaborative semester group projects. Create any project, then select to view tasks.');
        }
        if (roleHintEl) {
          roleHintEl.innerText = isAdmin
            ? (isThai ? '• โหมดผู้ดูแลระบบ: สร้าง แก้ไข หรือคลิกดูโปรเจกต์และงานของแต่ละกลุ่มได้ทันที' : '• Admin Mode: Create, inspect, or manage all course projects and group deliverables.')
            : (isThai ? '• โหมดนักศึกษา: สร้างหรือลบโปรเจกต์ของคุณ และคลิกเลือกโปรเจกต์เพื่อดูรายการงาน' : '• Student Mode: You can create or remove projects below. Click any project to open its tasks.');
        }
        if (createBtn) createBtn.classList.remove('hidden');
      }

      filterProjectsList();
    }

    function renderProjectsCards(list) {
      const container = document.getElementById('projectsCardsContainer');
      if (!container) return;
      container.innerHTML = '';

      if (list.length === 0) {
        const isThai = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
        container.innerHTML = `
          <div class="col-span-full py-16 text-center space-y-3 bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <span class="text-4xl">📁</span>
            <h3 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">${isThai ? 'ไม่พบโปรเจกต์' : 'No Projects Found'}</h3>
            <p class="text-xs text-neutral-500 max-w-sm mx-auto">${isThai ? 'ไม่พบโปรเจกต์ที่ตรงกับเงื่อนไขการค้นหา ลองสร้างใหม่ด้วยปุ่ม "+ สร้างโปรเจกต์" ด้านบน' : 'There are no projects matching your current filter criteria. Create one using the "+ Create Project" button above.'}</p>
          </div>
        `;
        return;
      }

      const isTeacher = currentUserRole === 'teacher';
      const curStudent = getCurrentStudent();

      list.forEach(p => {
        const canRemove = !isTeacher && (p.createdBy === curStudent.id || p.createdByName === curStudent.shortName || (p.members || []).some(m => m.includes(curStudent.id)));
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition space-y-4 cursor-pointer group';
        card.onclick = () => openProjectTasks(p.id);

        const membersBadges = (p.members || []).map(m => {
          return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">👤 ${escapeHtml(m)}</span>`;
        }).join(' ');

        const stLower = (p.status || '').toLowerCase();
        let statusBadgeClass = 'text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700';
        if (stLower.includes('progress')) {
          statusBadgeClass = 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
        } else if (stLower.includes('review')) {
          statusBadgeClass = 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
        }

        card.innerHTML = `
          <div class="space-y-3">

            <div class="flex items-center justify-between gap-2">
              <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                ${escapeHtml(p.course)}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusBadgeClass}">
                ${escapeHtml(p.status)}
              </span>
            </div>

            <div>
              <h3 class="font-bold text-base text-neutral-900 dark:text-white transition leading-snug">
                ${escapeHtml(p.title)}
              </h3>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-3 leading-relaxed">
                ${escapeHtml(p.description)}
              </p>
            </div>

            <div class="space-y-1.5 pt-1 border-t border-neutral-100 dark:border-neutral-800">
              <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Team Members</span>
              <div class="flex flex-wrap gap-1.5">
                ${membersBadges}
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
            <div class="text-[10px] text-neutral-400">
              <span>By ${escapeHtml(p.createdByName || p.createdBy)}</span>
              <span class="block">${p.createdAt}</span>
            </div>

            <div class="flex items-center gap-1.5">
              ${canRemove ? `
                <button onclick="removeProject('${p.id}'); event.stopPropagation();" title="Remove Project" class="px-2.5 py-1.5 rounded-xl text-neutral-500 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold transition flex items-center gap-1">
                  <span>🗑️</span>
                  <span>Remove</span>
                </button>
              ` : ''}
            </div>
          </div>
        `;

        container.appendChild(card);
      });
    }

    let teacherCameFromProjects = false;

    function openProjectTasks(projectId) {
      const p = studentProjectsList.find(x => x.id === projectId);
      if (!p) return;
      activeCourseId = p.course;
      activeProjectId = projectId;

      if (currentUserRole === 'teacher') {
        teacherCameFromProjects = true;
        switchTeacherViewMode('assessment');
        navigateTo('teacher-review');
      } else {
        navigateTo('course-detail');
      }
    }

    function openCreateProjectModal() {
      if (currentUserRole === 'teacher') {
        alertMessage("Teachers do not have permission to create projects.");
        return;
      }
      const cur = getCurrentStudent();
      const membersInput = document.getElementById('newProjectMembers');
      if (membersInput && !membersInput.value.trim()) {
        membersInput.value = `${cur.id} ${cur.shortName}`;
      }
      const courseSelect = document.getElementById('newProjectCourse');
      if (courseSelect) {
        if (activeCourseId && activeCourseId !== 'ALL') {
          courseSelect.value = activeCourseId;
        } else if (activeProjectsFilter && activeProjectsFilter !== 'ALL') {
          courseSelect.value = activeProjectsFilter;
        }
      }
      const modal = document.getElementById('createProjectModal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeCreateProjectModal() {
      const modal = document.getElementById('createProjectModal');
      if (modal) modal.classList.add('hidden');
      const form = document.getElementById('createProjectForm');
      if (form) form.reset();
    }

    function handleCreateProjectSubmit(e) {
      if (e && e.preventDefault) e.preventDefault();
      if (currentUserRole === 'teacher') {
        alertMessage("Teachers do not have permission to create projects.");
        return;
      }

      const titleInput = document.getElementById('newProjectTitle');
      const courseInput = document.getElementById('newProjectCourse');
      const descInput = document.getElementById('newProjectDesc');
      const urlInput = document.getElementById('newProjectUrl');
      const membersInput = document.getElementById('newProjectMembers');

      const title = (titleInput?.value || '').trim();
      const course = courseInput?.value || 'CMM321';
      const desc = (descInput?.value || '').trim();
      const url = (urlInput?.value || '').trim();
      const rawMembers = (membersInput?.value || '').trim();

      if (!title) {
        alertMessage('Please enter a project title');
        return;
      }

      const cur = getCurrentStudent();
      let members = [];
      if (rawMembers) {
        members = rawMembers.split(',').map(m => m.trim()).filter(Boolean);
      }
      if (members.length === 0) {
        members = [`${cur.id} ${cur.shortName}`];
      }

      const newProj = {
        id: 'proj-' + Date.now(),
        title,
        course,
        description: desc || 'Collaborative course term project deliverable.',
        url: url || 'https://github.com/atht-kmutt',
        createdBy: cur.id,
        createdByName: cur.shortName,
        members,
        status: 'In Progress',
        createdAt: new Date().toISOString().split('T')[0]
      };

      studentProjectsList.unshift(newProj);
      saveStoredProjects(studentProjectsList);

      // Also create a linked Group/Individual starter task in coursesCatalog so Teacher & all teammates see it immediately
      const targetCourse = coursesCatalog[course];
      if (targetCourse && Array.isArray(targetCourse.tasks)) {
        const resolvedMembers = members.map((mStr, idx) => {
          const prof = getStudentProfile(mStr);
          return {
            id: prof.id,
            name: prof.shortName,
            role: idx === 0 ? 'Leader' : 'Member',
            taskStatus: 'Active',
            score: 'Pending'
          };
        });
        const uniqueMembers = [];
        const seenM = new Set();
        resolvedMembers.forEach(m => {
          if (m.id && !seenM.has(m.id)) {
            seenM.add(m.id);
            uniqueMembers.push(m);
          }
        });
        if (uniqueMembers.length === 0) {
          uniqueMembers.push({ id: cur.id, name: cur.shortName, role: 'Leader', taskStatus: 'Active', score: 'Pending' });
        }
        const initialSubs = {};
        uniqueMembers.forEach(m => {
          initialSubs[m.id] = { submitted: false, score: 'Pending', status: 'Pending', file: '', submittedAt: '', revisions: [] };
        });
        targetCourse.tasks.push({
          id: `${course.toLowerCase()}-task-${Date.now()}`,
          projectId: newProj.id,
          createdBy: cur.id,
          title: title,
          due: 'November 28, 2026 at 23:00',
          publishDate: newProj.createdAt,
          status: 'Active',
          isFinished: false,
          submitted: false,
          score: 'Pending',
          type: uniqueMembers.length > 1 ? `Group Project (${uniqueMembers.length} Members)` : 'Individual',
          description: newProj.description,
          members: uniqueMembers,
          studentSubmissions: initialSubs
        });
        saveCoursesCatalog();
      }

      closeCreateProjectModal();

      alertMessage(currentLanguage === 'th' ? `สร้างโปรเจกต์ "${title}" เรียบร้อยแล้ว!` : `Project "${title}" created successfully!`);
      filterProjectsList();
    }

    function removeProject(projectId) {
      if (currentUserRole === 'teacher') {
        alertMessage("Teachers do not have permission to remove projects.");
        return;
      }
      const p = studentProjectsList.find(x => x.id === projectId);
      if (!p) return;

      const confirmText = currentLanguage === 'th'
        ? `คุณต้องการลบโปรเจกต์ "${p.title}" ใช่หรือไม่?`
        : `Are you sure you want to remove project "${p.title}"?`;

      if (confirm(confirmText)) {
        studentProjectsList = studentProjectsList.filter(x => x.id !== projectId);
        saveStoredProjects(studentProjectsList);
        alertMessage(currentLanguage === 'th' ? `ลบโปรเจกต์ "${p.title}" แล้ว` : `Project "${p.title}" removed.`);
        filterProjectsList();
      }
    }

    function renderGlobalTasksHub() {
      const isProjectTaskMode = !!(activeTasksCourseFilter || activeTasksProjectFilter);
      const headingEl = document.getElementById('tasksHubHeading');
      if (headingEl) {
        headingEl.innerText = isProjectTaskMode ? 'Task' : 'All Tasks';
      }
      const addBtn = document.getElementById('btnAllTasksAddTask');
      if (addBtn) {
        addBtn.classList.toggle('hidden', !isProjectTaskMode || currentUserRole === 'teacher');
      }

      const container = document.getElementById('globalTasksListContainer');
      if (!container) return;
      container.innerHTML = '';

      ensureRelationalIntegrity();
      const curStd = getCurrentStudent();
      const isMyTask = (t) => {
        if (t.createdBy && t.createdBy === curStd.id) return true;
        return (t.members || []).some(m =>
          m.id === curStd.id ||
          (m.name && curStd.shortName && m.name.toLowerCase() === curStd.shortName.toLowerCase())
        );
      };

      let allTasks = [];
      Object.entries(coursesCatalog).forEach(([cCode, cData]) => {
        if (activeTasksCourseFilter && cCode !== activeTasksCourseFilter) return;
        cData.tasks.forEach(t => {
          if (activeTasksProjectFilter && t.projectId !== activeTasksProjectFilter) return;
          if (currentUserRole === 'student' && !isMyTask(t)) return;
          allTasks.push({ ...t, courseCode: cCode, courseTitle: cData.title });
        });
      });

      const isTaskDoneForUser = (t) => {
        const st = computeTaskStatus(t, t.courseCode);
        return st === 'Finished' || st.startsWith('Graded');
      };
      let filtered = allTasks;

      const unfinishedCount = allTasks.filter(t => !isTaskDoneForUser(t)).length;
      const unfinBtnSpan = document.querySelector('#tabFilterUnfinished span');
      if (unfinBtnSpan) unfinBtnSpan.innerText = `Unfinished (${unfinishedCount})`;
      const allBtnSpan = document.querySelector('#tabFilterAll span');
      if (allBtnSpan) allBtnSpan.innerText = `All (${allTasks.length})`;

      ['unfinished', 'all', 'completed'].forEach(f => {
        const btn = document.getElementById(`tabFilter${f.charAt(0).toUpperCase() + f.slice(1)}`);
        if (btn) {
          if (f === activeTasksFilter) {
            btn.className = 'px-2 sm:px-4 py-1.5 rounded-full bg-white text-neutral-900 font-extrabold shadow-xs transition pressable whitespace-nowrap';
          } else {
            btn.className = 'px-2 sm:px-4 py-1.5 rounded-full text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 transition pressable font-bold whitespace-nowrap';
          }
        }
      });

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="col-span-full p-10 text-center text-xs text-neutral-400 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            No tasks match this filter.
          </div>
        `;
        return;
      }

      filtered.forEach(task => {
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-neutral-200/90 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-neutral-400 transition pressable cursor-pointer space-y-2 flex flex-col justify-between';
        card.onclick = () => openTaskDetails(task.id);

        const computedStatus = computeTaskStatus(task, task.courseCode);
        const statusCls = getTaskStatusBadgeClasses(computedStatus);

        card.innerHTML = `
          <div class="space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <p class="text-[11px] truncate">
                <span class="font-extrabold text-neutral-800 dark:text-neutral-200">${escapeHtml(task.courseCode)}</span>
                <span class="text-neutral-400 dark:text-neutral-500 ml-1">${escapeHtml(task.courseTitle || '')}</span>
              </p>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${statusCls}">${escapeHtml(computedStatus)}</span>
            </div>

            <h3 class="text-sm sm:text-base font-black text-neutral-900 dark:text-white leading-snug truncate">${escapeHtml(task.title)}</h3>
            <p class="text-[11px] sm:text-xs font-medium text-neutral-500 dark:text-neutral-400 truncate">${escapeHtml(task.description || 'Student Project')}</p>
          </div>

          <div class="flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400 pt-2">
            <span class="font-semibold">Due : ${escapeHtml(task.due)}</span>
            <span class="font-bold text-neutral-800 dark:text-neutral-200 shrink-0">View &gt;</span>
          </div>
        `;
        container.appendChild(card);
      });
    }

    function setTasksFilter(filter) {
      activeTasksFilter = filter;
      renderGlobalTasksHub();
    }

    function loadStoredNotifications() {
      try {
        const raw = localStorage.getItem('atht_v2_notifications');
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) return arr;
        }
      } catch (e) {}
      return [];
    }

    function pushAppNotification(entry) {
      try {
        const list = loadStoredNotifications();
        list.unshift({ id: 'notif-' + Date.now(), ...entry });
        localStorage.setItem('atht_v2_notifications', JSON.stringify(list.slice(0, 30)));
      } catch (e) {}
    }

    function renderNotificationsScreen() {
      const container = document.getElementById('notificationsContainer');
      if (!container) return;
      container.innerHTML = '';

      const isTeacher = currentUserRole === 'teacher';
      const curStd = getCurrentStudent();
      const allowedTeacherSet = isTeacher && typeof getTeacherAssignedCourseCodes === 'function'
        ? new Set(getTeacherAssignedCourseCodes())
        : null;

      const dynamicNotifs = loadStoredNotifications().filter(n => {
        if (isTeacher) {
          return n.targetRole === 'teacher' && (!allowedTeacherSet || allowedTeacherSet.has(n.course));
        }
        if (n.targetRole && n.targetRole !== 'student') return false;
        if (Array.isArray(n.targetStudentIds) && !n.targetStudentIds.includes(curStd.id)) return false;
        return true;
      });

      const merged = [...dynamicNotifs, ...notificationsList];

      merged.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl px-3.5 sm:px-6 py-3.5 sm:py-4 border border-neutral-200/90 dark:border-neutral-800 shadow-sm hover:shadow-md transition flex items-center justify-between gap-2.5 sm:gap-4';

        const tId = item.taskId || item.targetTaskId || 'cmm321-t1';
        const sId = item.studentId || curStd.id;
        const actionLabel = currentLanguage === 'th' ? (isTeacher ? 'ตรวจงาน →' : 'ดูรายละเอียดงาน →') : (isTeacher ? 'Review Work →' : 'View Task →');
        const actionFn = isTeacher
          ? `activeCourseId='${escapeHtml(item.course || 'CMM321')}'; teacherReviewViewMode='grading'; navigateTo('teacher-review'); gradeStudentTask('${escapeHtml(sId)}', '${escapeHtml(tId)}');`
          : `openTaskDetails('${escapeHtml(tId)}')`;
        const btnClass = item.isNew
          ? 'bg-neutral-900 hover:bg-black text-white dark:bg-neutral-800 dark:hover:bg-neutral-700'
          : 'bg-neutral-700 hover:bg-neutral-900 text-white';

        card.innerHTML = `
          <div class="flex items-start sm:items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center shrink-0 text-base sm:text-xl mt-0.5 sm:mt-0">
              ${item.type === 'grade' ? '🏅' : item.type === 'comment' ? '🔔' : '🏅'}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-xs sm:text-base font-black text-neutral-900 dark:text-white leading-tight truncate">${escapeHtml(item.title)}</span>
                ${item.isNew ? '<span class="text-[9px] sm:text-[10px] font-extrabold bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-white px-2 py-0.5 rounded-full shrink-0">NEW</span>' : ''}
              </div>
              <p class="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-300 truncate mt-0.5">${escapeHtml(item.course)}: ${escapeHtml(item.taskTitle)}</p>
              <span class="text-[10px] sm:text-[11px] text-neutral-400 font-medium block mt-0.5">${escapeHtml(item.time)}</span>
            </div>
          </div>

          <button onclick="${actionFn}" class="shrink-0 px-3 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold ${btnClass} rounded-full transition pressable flex items-center justify-center gap-1 shadow-2xs whitespace-nowrap">
            <span>${actionLabel}</span>
          </button>
        `;
        container.appendChild(card);
      });
    }
