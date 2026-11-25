/* ATHT_devv3 — Realtime Microsoft SQL Server & SSE Sync Bridge */
(function initATHTSqlSyncBridge() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

  const SYNC_KEYS = [
    'atht_v2_courses_catalog_rev6',
    'atht_admin_courses_synced',
    'atht_admin_students',
    'atht_admin_teachers',
    'atht_student_projects',
    'atht_v2_notifications',
    'atht_admin_audit_logs',
    'atht_global_festival_theme',
    'atht_festival_theme'
  ];

  const origSetItem = Storage.prototype.setItem;
  const origRemoveItem = Storage.prototype.removeItem;
  const boot = window.__ATHT_SQL_BOOTSTRAP || null;
  const isSqlMode = Boolean(boot && boot.connected);
  const clientId = 'cli_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

  let currentRevision = Number((boot && boot.revision) || 0);
  let pendingBuckets = {};
  let flushTimer = null;
  let isApplyingRemote = false;
  let isFlushing = false;
  let sseSource = null;

  // 1. Hydrate localStorage synchronously from SQL Server before 01..05 JS scripts run
  if (isSqlMode && boot.buckets && typeof boot.buckets === 'object' && Object.keys(boot.buckets).length > 0) {
    isApplyingRemote = true;
    try {
      SYNC_KEYS.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(boot.buckets, key)) {
          origSetItem.call(localStorage, key, String(boot.buckets[key]));
        } else {
          origRemoveItem.call(localStorage, key);
        }
      });
    } finally {
      isApplyingRemote = false;
    }
  }

  function updateSqlBadge(connected, liveStream = true) {
    if (typeof document === 'undefined') return;
    const lbl = document.getElementById('sqlStatusLabel');
    if (!lbl) return;
    const isTh = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
    if (connected) {
      lbl.innerText = liveStream
        ? (isTh ? 'SQL Server เรียลไทม์' : 'Realtime • SQL Server')
        : (isTh ? 'เชื่อมต่อ SQL Server แล้ว' : 'SQL Server Connected');
    } else {
      lbl.innerText = isTh ? 'ไม่ได้เชื่อมต่อ SQL Server' : 'SQL Server Disconnected';
    }
  }

  async function uploadFileToSql(fileKey, fileBlob) {
    if (!isSqlMode || !fileKey || !fileBlob || typeof fetch !== 'function') return false;
    try {
      const form = new FormData();
      form.append('fileKey', fileKey);
      form.append('file', fileBlob, fileBlob.name || `${fileKey}.bin`);
      const res = await fetch('/api/files', { method: 'POST', body: form });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async function downloadFileFromSql(fileKey) {
    if (!isSqlMode || !fileKey || typeof fetch !== 'function') return null;
    try {
      const res = await fetch(`/api/files/${encodeURIComponent(fileKey)}`, { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.blob();
    } catch (e) {
      return null;
    }
  }

  async function flushPendingToSql() {
    if (!isSqlMode) return;
    const keys = Object.keys(pendingBuckets);
    if (keys.length === 0 || isFlushing) return;

    const batch = pendingBuckets;
    pendingBuckets = {};
    isFlushing = true;
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, buckets: batch }),
        keepalive: true
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.revision === 'number' && data.revision > currentRevision) {
          currentRevision = data.revision;
        }
        updateSqlBadge(true, Boolean(sseSource && sseSource.readyState === 1));
      } else {
        Object.assign(pendingBuckets, batch);
        updateSqlBadge(false, false);
      }
    } catch (err) {
      Object.assign(pendingBuckets, batch);
      updateSqlBadge(false, false);
    } finally {
      isFlushing = false;
      if (Object.keys(pendingBuckets).length > 0) {
        setTimeout(flushPendingToSql, 150);
      }
    }
  }

  function scheduleFlush() {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushPendingToSql();
    }, 90);
  }

  // 2. Write-through localStorage hook -> immediate SQL Server sync
  if (isSqlMode && typeof fetch === 'function') {
    localStorage.setItem = function (key, value) {
      origSetItem.call(localStorage, key, value);
      if (!isApplyingRemote && SYNC_KEYS.includes(key)) {
        pendingBuckets[key] = String(value);
        scheduleFlush();
      }
    };

    localStorage.removeItem = function (key) {
      origRemoveItem.call(localStorage, key);
      if (!isApplyingRemote && SYNC_KEYS.includes(key)) {
        pendingBuckets[key] = null;
        scheduleFlush();
      }
    };

    window.addEventListener('beforeunload', () => {
      if (Object.keys(pendingBuckets).length > 0) flushPendingToSql();
      if (sseSource) try { sseSource.close(); } catch (e) {}
    });
  }

  function hasOpenModal() {
    if (typeof document === 'undefined') return false;
    return Array.from(document.querySelectorAll('[role="dialog"]')).some(el => !el.classList.contains('hidden'));
  }

  function isUserTyping() {
    if (typeof document === 'undefined' || !document.activeElement) return false;
    const tag = (document.activeElement.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  }

  function refreshActiveScreenFromSql() {
    try {
      if (typeof loadPersistedCoursesCatalog === 'function') loadPersistedCoursesCatalog();
      if (typeof loadAdminPersistedDirectories === 'function') loadAdminPersistedDirectories();
      if (typeof getStoredProjects === 'function' && typeof studentProjectsList !== 'undefined') {
        studentProjectsList = getStoredProjects();
      }
      if (typeof ensureRelationalIntegrity === 'function') ensureRelationalIntegrity();
      if (typeof syncDynamicCourseSelectors === 'function') syncDynamicCourseSelectors();
      if (typeof syncHeaderNotificationDot === 'function') syncHeaderNotificationDot();
      if (typeof currentScreen !== 'undefined') {
        if (currentScreen === 'dashboard' && typeof renderDashboardCourses === 'function') renderDashboardCourses();
        else if (currentScreen === 'courses' && typeof renderCoursesCatalog === 'function') renderCoursesCatalog();
        else if (currentScreen === 'course-detail' && typeof renderCourseDetailPage === 'function') renderCourseDetailPage();
        else if (currentScreen === 'tasks-hub' && typeof renderGlobalTasksHub === 'function') renderGlobalTasksHub();
        else if (currentScreen === 'task-detail' && typeof renderTaskDetailPage === 'function') renderTaskDetailPage();
        else if (currentScreen === 'projects' && typeof renderProjectsScreen === 'function') renderProjectsScreen();
        else if (currentScreen === 'notifications' && typeof renderNotificationsScreen === 'function') renderNotificationsScreen();
        else if (currentScreen === 'teacher-dashboard' && typeof renderTeacherDashboard === 'function') renderTeacherDashboard();
        else if (currentScreen === 'teacher-review' && typeof renderTeacherReviewScreen === 'function') renderTeacherReviewScreen();
        else if (currentScreen === 'admin' && typeof renderAdminScreen === 'function') renderAdminScreen();
      }
      if (typeof renderCalendar === 'function') renderCalendar();
      if (typeof applyFestivalTheme === 'function') {
        const theme = localStorage.getItem('atht_global_festival_theme') || localStorage.getItem('atht_festival_theme') || 'default';
        if (theme) applyFestivalTheme(theme, true);
      }
    } catch (e) {}
  }

  async function pullLatestFromSql(expectedRevision = null) {
    if (!isSqlMode || typeof fetch !== 'function') return;
    if (isFlushing || Object.keys(pendingBuckets).length > 0) return;
    if (expectedRevision !== null && expectedRevision <= currentRevision) return;
    if (hasOpenModal() || isUserTyping()) return;

    try {
      const bRes = await fetch('/api/bootstrap', { cache: 'no-store' });
      if (!bRes.ok) return;
      const bData = await bRes.json();
      if (bData && bData.connected && bData.buckets) {
        currentRevision = Number(bData.revision || expectedRevision || currentRevision);
        isApplyingRemote = true;
        try {
          SYNC_KEYS.forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(bData.buckets, key)) {
              origSetItem.call(localStorage, key, String(bData.buckets[key]));
            } else {
              origRemoveItem.call(localStorage, key);
            }
          });
        } finally {
          isApplyingRemote = false;
        }
        refreshActiveScreenFromSql();
      }
    } catch (e) {}
  }

  function connectSseRealtime() {
    if (!isSqlMode || typeof EventSource === 'undefined') return;
    try {
      sseSource = new EventSource(`/api/events?clientId=${encodeURIComponent(clientId)}`);
      sseSource.addEventListener('connected', () => {
        updateSqlBadge(true, true);
      });
      sseSource.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (!msg) return;
          if (msg.clientId === clientId) {
            if (typeof msg.revision === 'number' && msg.revision > currentRevision) {
              currentRevision = msg.revision;
            }
            return;
          }
          if (msg.type === 'reset') {
            currentRevision = 0;
            pullLatestFromSql(null);
          } else if (typeof msg.revision === 'number' && msg.revision > currentRevision) {
            pullLatestFromSql(msg.revision);
          }
        } catch (e) {}
      };
      sseSource.onerror = () => {
        updateSqlBadge(false, false);
      };
    } catch (e) {}
  }

  async function seedSqlServerOnFirstRun() {
    if (!isSqlMode) return;
    const hadSqlData = boot && boot.buckets && Object.keys(boot.buckets).length > 0;
    if (hadSqlData) return;
    try {
      if (typeof saveAdminPersistedDirectories === 'function') saveAdminPersistedDirectories();
      if (typeof saveCoursesCatalog === 'function') saveCoursesCatalog();
      if (typeof saveStoredProjects === 'function' && typeof studentProjectsList !== 'undefined') {
        saveStoredProjects(studentProjectsList);
      }
      const seedBatch = {};
      SYNC_KEYS.forEach((k) => {
        const val = localStorage.getItem(k);
        if (val !== null) seedBatch[k] = val;
      });
      if (Object.keys(seedBatch).length > 0) {
        Object.assign(pendingBuckets, seedBatch);
        await flushPendingToSql();
      }
    } catch (e) {}
  }

  async function checkBackupVersion() {
    if (!isSqlMode || typeof fetch !== 'function') return;
    if (isFlushing || Object.keys(pendingBuckets).length > 0) return;
    try {
      const res = await fetch('/api/version', { cache: 'no-store' });
      if (!res.ok) { updateSqlBadge(false, false); return; }
      const vData = await res.json();
      updateSqlBadge(Boolean(vData && vData.connected), Boolean(sseSource && sseSource.readyState === 1));
      if (vData && typeof vData.revision === 'number' && vData.revision > currentRevision) {
        await pullLatestFromSql(vData.revision);
      }
    } catch (e) {
      updateSqlBadge(false, false);
    }
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      if (typeof applyLanguage === 'function') {
        const origApplyLanguage = applyLanguage;
        applyLanguage = function (lang) {
          const out = origApplyLanguage(lang);
          updateSqlBadge(isSqlMode, Boolean(sseSource && sseSource.readyState === 1));
          return out;
        };
      }
      updateSqlBadge(isSqlMode, false);
      seedSqlServerOnFirstRun().then(() => {
        connectSseRealtime();
      });
    }, 200);

    // Lightweight safety check every 15s in case EventSource reconnects after sleep/network drop
    if (isSqlMode) {
      setInterval(checkBackupVersion, 15000);
    }
  });

  window.__ATHT_SQL_SYNC = {
    isSqlMode,
    clientId,
    flushNow: flushPendingToSql,
    pullNow: pullLatestFromSql,
    uploadFileToSql,
    downloadFileFromSql,
    getRevision: () => currentRevision
  };
})();
