/* ATHT — Unified Realtime Microsoft SQL Server Sync Bridge (Works both locally on ATHT_devv3 & remotely from GitHub Pages via ?api=...) */
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
  const API_URL_STORAGE_KEY = 'atht_sql_api_url';

  const origSetItem = Storage.prototype.setItem;
  const origRemoveItem = Storage.prototype.removeItem;
  const clientId = 'cli_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

  function normalizeApiUrl(raw) {
    const clean = String(raw || '').trim().replace(/\/+$/, '');
    if (!clean || clean === 'off' || clean === 'none') return '';
    return clean;
  }

  // Parse ?api=... query param so a single shared GitHub link auto-connects to SQL Server
  try {
    if (window.location && window.location.search && typeof URLSearchParams !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('api')) {
        const paramApi = normalizeApiUrl(params.get('api'));
        if (paramApi) origSetItem.call(localStorage, API_URL_STORAGE_KEY, paramApi);
        else origRemoveItem.call(localStorage, API_URL_STORAGE_KEY);
      }
    }
  } catch (e) {}

  const boot = window.__ATHT_SQL_BOOTSTRAP || null;
  const savedRemoteUrl = normalizeApiUrl(localStorage.getItem(API_URL_STORAGE_KEY));
  const isSameOriginSql = Boolean(boot && boot.connected);
  let apiBase = isSameOriginSql ? '' : savedRemoteUrl;
  let isSqlMode = isSameOriginSql || Boolean(apiBase);

  let currentRevision = Number((boot && boot.revision) || 0);
  let pendingBuckets = {};
  let flushTimer = null;
  let isApplyingRemote = false;
  let isFlushing = false;
  let sseSource = null;

  function apiUrl(path) {
    return apiBase ? `${apiBase}${path}` : path;
  }

  // 1. Synchronous hydration when served from ATHT_devv3 (/api/bootstrap.js)
  if (isSameOriginSql && boot.buckets && typeof boot.buckets === 'object' && Object.keys(boot.buckets).length > 0) {
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
    const isTh = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
    const lbl = document.getElementById('sqlStatusLabel');
    if (lbl) {
      if (connected) {
        lbl.innerText = liveStream
          ? (isTh ? 'SQL Server เรียลไทม์' : 'Realtime • SQL Server')
          : (isTh ? 'เชื่อมต่อ SQL Server แล้ว' : 'SQL Server Connected');
      } else {
        lbl.innerText = isTh ? 'โหมดเบราว์เซอร์ (Local)' : 'KMUTT Local Mode';
      }
    }
    const admBadge = document.getElementById('adminSqlStatusBadge');
    if (admBadge) {
      if (connected) {
        admBadge.innerText = liveStream
          ? (isTh ? '● เชื่อมต่อ SQL Server เรียลไทม์' : '● Connected (Realtime SQL)')
          : (isTh ? '● เชื่อมต่อ SQL Server แล้ว' : '● Connected to SQL Server');
        admBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
      } else {
        admBadge.innerText = isTh ? '○ ยังไม่เชื่อม SQL API (ใช้แคชในเครื่อง)' : '○ Browser Local Mode (No SQL API)';
        admBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700';
      }
    }
    const urlInput = document.getElementById('adminSqlApiUrlInput');
    if (urlInput && !urlInput.value && (apiBase || isSameOriginSql)) {
      urlInput.value = apiBase || (window.location ? window.location.origin : 'http://localhost:5080');
    }
  }

  async function uploadFileToSql(fileKey, fileBlob) {
    if (!isSqlMode || !fileKey || !fileBlob || typeof fetch !== 'function') return false;
    try {
      const form = new FormData();
      form.append('fileKey', fileKey);
      form.append('file', fileBlob, fileBlob.name || `${fileKey}.bin`);
      const res = await fetch(apiUrl('/api/files'), { method: 'POST', body: form });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async function downloadFileFromSql(fileKey) {
    if (!isSqlMode || !fileKey || typeof fetch !== 'function') return null;
    try {
      const res = await fetch(apiUrl(`/api/files/${encodeURIComponent(fileKey)}`), { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.blob();
    } catch (e) {
      return null;
    }
  }

  async function flushPendingToSql() {
    if (!isSqlMode || typeof fetch !== 'function') return;
    const keys = Object.keys(pendingBuckets);
    if (keys.length === 0 || isFlushing) return;

    const batch = pendingBuckets;
    pendingBuckets = {};
    isFlushing = true;
    try {
      const res = await fetch(apiUrl('/api/sync'), {
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
    if (!isSqlMode) return;
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushPendingToSql();
    }, 90);
  }

  // Write-through localStorage hook
  if (typeof fetch === 'function') {
    localStorage.setItem = function (key, value) {
      origSetItem.call(localStorage, key, value);
      if (isSqlMode && !isApplyingRemote && SYNC_KEYS.includes(key)) {
        pendingBuckets[key] = String(value);
        scheduleFlush();
      }
    };

    localStorage.removeItem = function (key) {
      origRemoveItem.call(localStorage, key);
      if (isSqlMode && !isApplyingRemote && SYNC_KEYS.includes(key)) {
        pendingBuckets[key] = null;
        scheduleFlush();
      }
    };

    window.addEventListener('beforeunload', () => {
      if (isSqlMode && Object.keys(pendingBuckets).length > 0) flushPendingToSql();
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

  async function pullLatestFromSql(expectedRevision = null, forceFirstPull = false) {
    if (!isSqlMode || typeof fetch !== 'function') return false;
    if (!forceFirstPull && (isFlushing || Object.keys(pendingBuckets).length > 0)) return false;
    if (!forceFirstPull && expectedRevision !== null && expectedRevision <= currentRevision) return false;
    if (!forceFirstPull && (hasOpenModal() || isUserTyping())) return false;

    try {
      const bRes = await fetch(apiUrl('/api/bootstrap'), { cache: 'no-store' });
      if (!bRes.ok) return false;
      const bData = await bRes.json();
      if (bData && bData.connected && bData.buckets) {
        if (Object.keys(bData.buckets).length === 0) {
          await seedSqlServerOnFirstRun(true);
          return true;
        }
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
        return true;
      }
    } catch (e) {}
    return false;
  }

  function connectSseRealtime() {
    if (!isSqlMode || typeof EventSource === 'undefined') return;
    if (sseSource) try { sseSource.close(); } catch (e) {}
    try {
      sseSource = new EventSource(apiUrl(`/api/events?clientId=${encodeURIComponent(clientId)}`));
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

  async function seedSqlServerOnFirstRun(forceEmpty = false) {
    if (!isSqlMode) return;
    if (!forceEmpty) {
      const hadSqlData = boot && boot.buckets && Object.keys(boot.buckets).length > 0;
      if (hadSqlData) return;
    }
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
      const res = await fetch(apiUrl('/api/version'), { cache: 'no-store' });
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

  async function connectSqlEndpoint(rawUrl) {
    const clean = normalizeApiUrl(rawUrl);
    if (!clean) {
      origRemoveItem.call(localStorage, API_URL_STORAGE_KEY);
      if (!isSameOriginSql) {
        apiBase = '';
        isSqlMode = false;
        if (sseSource) try { sseSource.close(); } catch (e) {}
        sseSource = null;
        updateSqlBadge(false, false);
      }
      if (typeof alertMessage === 'function') {
        alertMessage(currentLanguage === 'th' ? 'สลับกลับเป็นโหมดเบราว์เซอร์ปกติแล้ว' : 'Disconnected SQL API (Local Mode)');
      }
      return false;
    }

    try {
      const res = await fetch(`${clean}/api/health`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data || !data.connected) {
        throw new Error((data && data.error) || 'SQL API unreachable');
      }
      apiBase = clean;
      isSqlMode = true;
      origSetItem.call(localStorage, API_URL_STORAGE_KEY, clean);
      await pullLatestFromSql(null, true);
      connectSseRealtime();
      updateSqlBadge(true, true);
      if (typeof alertMessage === 'function') {
        alertMessage(currentLanguage === 'th'
          ? `เชื่อมต่อ SQL Server (${data.database || 'ATHT_StudentProjectDB'}) แบบเรียลไทม์สำเร็จ!`
          : `Connected to SQL Server (${data.database || 'ATHT_StudentProjectDB'}) in Realtime!`);
      }
      return true;
    } catch (err) {
      if (typeof alertMessage === 'function') {
        alertMessage(currentLanguage === 'th'
          ? 'เชื่อมต่อไม่สำเร็จ: กรุณาตรวจสอบว่าเปิด ATHT_devv3 และ URL ถูกต้อง (' + (err.message || '') + ')'
          : 'Connection failed: Ensure ATHT_devv3 server is running and URL is reachable.');
      }
      return false;
    }
  }

  window.connectAdminSqlBridge = function () {
    const inp = document.getElementById('adminSqlApiUrlInput');
    const val = (inp ? inp.value : '').trim() || 'http://localhost:5080';
    connectSqlEndpoint(val);
  };

  window.disconnectAdminSqlBridge = function () {
    const inp = document.getElementById('adminSqlApiUrlInput');
    if (inp) inp.value = '';
    connectSqlEndpoint('');
  };

  window.copyGithubSqlShareLink = function () {
    const inp = document.getElementById('adminSqlApiUrlInput');
    const urlVal = normalizeApiUrl((inp && inp.value) || apiBase);
    if (!urlVal) {
      if (typeof alertMessage === 'function') {
        alertMessage(currentLanguage === 'th' ? 'กรุณากรอก URL ของเซิร์ฟเวอร์ ATHT_devv3 ก่อนครับ' : 'Please enter ATHT_devv3 API URL first.');
      }
      return;
    }
    const pageBase = window.location ? `${window.location.origin}${window.location.pathname}` : 'https://yangweimingdotjpg.github.io/ATHTs/';
    const shareUrl = `${pageBase}?api=${encodeURIComponent(urlVal)}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    if (typeof alertMessage === 'function') {
      alertMessage(currentLanguage === 'th' ? `คัดลอกลิงก์เชื่อม SQL แล้ว: ${shareUrl}` : `Copied SQL Share Link: ${shareUrl}`);
    }
  };

  window.addEventListener('load', () => {
    setTimeout(async () => {
      if (typeof applyLanguage === 'function') {
        const origApplyLanguage = applyLanguage;
        applyLanguage = function (lang) {
          const out = origApplyLanguage(lang);
          updateSqlBadge(isSqlMode, Boolean(sseSource && sseSource.readyState === 1));
          return out;
        };
      }
      updateSqlBadge(isSqlMode, false);
      if (isSameOriginSql) {
        await seedSqlServerOnFirstRun(false);
        connectSseRealtime();
      } else if (apiBase) {
        const ok = await pullLatestFromSql(null, true);
        if (ok) {
          connectSseRealtime();
          updateSqlBadge(true, true);
        } else {
          updateSqlBadge(false, false);
        }
      }
    }, 200);

    if (isSqlMode) {
      setInterval(checkBackupVersion, 15000);
    }
  });

  window.__ATHT_SQL_SYNC = {
    isSqlMode: () => isSqlMode,
    getApiBase: () => apiBase,
    clientId,
    flushNow: flushPendingToSql,
    pullNow: pullLatestFromSql,
    uploadFileToSql,
    downloadFileFromSql,
    connectSqlEndpoint,
    getRevision: () => currentRevision
  };
})();
