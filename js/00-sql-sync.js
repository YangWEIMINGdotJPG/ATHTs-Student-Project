/* ATHT — Unified Realtime Sync Bridge (SQL Server ATHT_devv3 + Firebase Realtime Database for GitHub Pages) */
(function initATHTRealtimeSyncBridge() {
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
  const FIREBASE_URL_STORAGE_KEY = 'atht_firebase_db_url';
  const DEFAULT_FIREBASE_DB_URL = 'https://athts-student-project-default-rtdb.asia-southeast1.firebasedatabase.app';
  const FIREBASE_PORTAL_ROOT = 'atht_portal';
  const MAX_FIREBASE_FILE_BYTES = 5 * 1024 * 1024; // 5 MB safe limit for RTDB JSON storage

  const origSetItem = Storage.prototype.setItem;
  const origRemoveItem = Storage.prototype.removeItem;
  const clientId = 'cli_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

  function normalizeBaseUrl(raw) {
    const clean = String(raw || '').trim().replace(/\/+$/, '');
    if (!clean || clean === 'off' || clean === 'none' || clean === 'local') return '';
    return clean;
  }

  function isFirebaseUrl(url) {
    const u = String(url || '').toLowerCase();
    return u.includes('firebasedatabase.app') || u.includes('firebaseio.com');
  }

  function encodeFirebaseKey(key) {
    return encodeURIComponent(String(key || '')).replace(/\./g, '%2E');
  }

  // Parse ?api=... (SQL Server) or ?fb=... (Firebase Realtime Database) query parameters
  try {
    if (window.location && window.location.search && typeof URLSearchParams !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('api')) {
        const rawApi = String(params.get('api') || '').trim();
        const paramApi = normalizeBaseUrl(rawApi);
        if (paramApi) origSetItem.call(localStorage, API_URL_STORAGE_KEY, paramApi);
        else origRemoveItem.call(localStorage, API_URL_STORAGE_KEY);
      }
      if (params.has('fb')) {
        const rawFb = String(params.get('fb') || '').trim().toLowerCase();
        if (rawFb === 'off' || rawFb === 'none' || rawFb === 'local') {
          origSetItem.call(localStorage, FIREBASE_URL_STORAGE_KEY, 'off');
        } else {
          const paramFb = normalizeBaseUrl(params.get('fb'));
          if (paramFb) origSetItem.call(localStorage, FIREBASE_URL_STORAGE_KEY, paramFb);
          else origRemoveItem.call(localStorage, FIREBASE_URL_STORAGE_KEY);
        }
      }
    }
  } catch (e) {}

  const boot = window.__ATHT_SQL_BOOTSTRAP || null;
  const isSameOriginSql = Boolean(boot && boot.connected);

  let syncMode = ''; // 'sql' | 'firebase' | ''
  let apiBase = '';
  let firebaseBase = '';

  function resolveInitialMode() {
    if (isSameOriginSql) {
      syncMode = 'sql';
      apiBase = '';
      firebaseBase = '';
      return;
    }
    const savedSql = normalizeBaseUrl(localStorage.getItem(API_URL_STORAGE_KEY));
    if (savedSql) {
      syncMode = 'sql';
      apiBase = savedSql;
      firebaseBase = '';
      return;
    }
    const savedFbRaw = String(localStorage.getItem(FIREBASE_URL_STORAGE_KEY) || '').trim();
    if (savedFbRaw.toLowerCase() === 'off') {
      syncMode = '';
      apiBase = '';
      firebaseBase = '';
      return;
    }
    const activeFb = normalizeBaseUrl(savedFbRaw || DEFAULT_FIREBASE_DB_URL);
    if (activeFb) {
      syncMode = 'firebase';
      apiBase = '';
      firebaseBase = activeFb;
      return;
    }
    syncMode = '';
  }

  resolveInitialMode();

  let currentRevision = Number((boot && boot.revision) || 0);
  let initialHydrationDone = isSameOriginSql;
  let pendingBuckets = {};
  let flushTimer = null;
  let flushFailCount = 0;
  let deferredPullTimer = null;
  let deferredPullRev = null;
  let isApplyingRemote = false;
  let isFlushing = false;
  let sseSource = null;
  let lastVisibilityCheckAt = 0;

  function sqlUrl(path) {
    return apiBase ? `${apiBase}${path}` : path;
  }

  function fbUrl(subPath) {
    const cleanSub = String(subPath || '').replace(/^\/+/, '');
    return cleanSub ? `${firebaseBase}/${FIREBASE_PORTAL_ROOT}/${cleanSub}.json` : `${firebaseBase}/${FIREBASE_PORTAL_ROOT}.json`;
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

  function updateSyncBadge(connected, liveStream = true) {
    if (typeof document === 'undefined') return;
    const isTh = typeof currentLanguage !== 'undefined' && currentLanguage === 'th';
    const lbl = document.getElementById('sqlStatusLabel');
    const admBadge = document.getElementById('adminSqlStatusBadge');

    if (syncMode === 'sql') {
      if (lbl) {
        if (connected) {
          lbl.innerText = liveStream
            ? (isTh ? 'SQL Server เรียลไทม์' : 'Realtime • SQL Server')
            : (isTh ? 'เชื่อมต่อ SQL Server แล้ว' : 'SQL Server Connected');
        } else {
          lbl.innerText = isTh ? 'กำลังเชื่อม SQL Server...' : 'Reconnecting SQL...';
        }
      }
      if (admBadge) {
        if (connected) {
          admBadge.innerText = liveStream
            ? (isTh ? '● เชื่อมต่อ SQL Server เรียลไทม์' : '● Connected (Realtime SQL)')
            : (isTh ? '● เชื่อมต่อ SQL Server แล้ว' : '● Connected to SQL Server');
          admBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
        } else {
          admBadge.innerText = isTh ? '○ รอการเชื่อมต่อ SQL API' : '○ SQL API Unreachable';
          admBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
        }
      }
    } else if (syncMode === 'firebase') {
      if (lbl) {
        if (connected) {
          lbl.innerText = liveStream
            ? (isTh ? 'ซิงค์เรียลไทม์ • Firebase' : 'Realtime • Firebase Cloud')
            : (isTh ? 'เชื่อมต่อ Firebase แล้ว' : 'Firebase Cloud Connected');
        } else {
          lbl.innerText = isTh ? 'โหมดเบราว์เซอร์ (Local)' : 'KMUTT Local Mode';
        }
      }
      if (admBadge) {
        if (connected) {
          admBadge.innerText = liveStream
            ? (isTh ? '● ซิงค์เรียลไทม์ • Firebase Cloud' : '● Connected (Firebase Cloud)')
            : (isTh ? '● เชื่อมต่อ Firebase แล้ว' : '● Firebase Cloud Ready');
          admBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800';
        } else {
          admBadge.innerText = isTh ? '○ Firebase ขาดการเชื่อมต่อ (ใช้แคชในเครื่อง)' : '○ Firebase Offline (Local Cache)';
          admBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
        }
      }
    } else {
      if (lbl) {
        lbl.innerText = isTh ? 'โหมดเบราว์เซอร์ (Local)' : 'KMUTT Local Mode';
      }
      if (admBadge) {
        admBadge.innerText = isTh ? '○ โหมดออฟไลน์ในเครื่อง (ไม่ซิงค์ข้ามเครื่อง)' : '○ Browser Local Mode (Offline)';
        admBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700';
      }
    }

    const urlInput = document.getElementById('adminSqlApiUrlInput');
    if (urlInput && !urlInput.value && syncMode) {
      if (syncMode === 'sql') {
        urlInput.value = apiBase || (window.location ? window.location.origin : 'http://localhost:5080');
      } else if (syncMode === 'firebase') {
        urlInput.value = firebaseBase;
      }
    }
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve) => {
      if (!blob) return resolve('');
      try {
        if (typeof FileReader !== 'undefined') {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(blob);
          return;
        }
      } catch (e) {}
      resolve('');
    });
  }

  function dataUrlToBlobSimple(dataUrl, fallbackType) {
    try {
      const parts = String(dataUrl || '').split(',');
      if (parts.length < 2) return null;
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = (mimeMatch && mimeMatch[1]) || fallbackType || 'application/octet-stream';
      const binStr = atob(parts[1]);
      const arr = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) arr[i] = binStr.charCodeAt(i);
      return new Blob([arr], { type: mime });
    } catch (e) {
      return null;
    }
  }

  async function uploadFileToRemote(fileKey, fileBlob) {
    if (!syncMode || !fileKey || !fileBlob || typeof fetch !== 'function') return false;
    if (syncMode === 'sql') {
      try {
        const form = new FormData();
        form.append('fileKey', fileKey);
        form.append('file', fileBlob, fileBlob.name || `${fileKey}.bin`);
        const res = await fetch(sqlUrl('/api/files'), { method: 'POST', body: form });
        return res.ok;
      } catch (e) {
        return false;
      }
    }
    if (syncMode === 'firebase') {
      if (fileBlob.size > MAX_FIREBASE_FILE_BYTES) return false;
      try {
        const dataUrl = await blobToDataUrl(fileBlob);
        if (!dataUrl) return false;
        const payload = {
          fileName: fileBlob.name || `${fileKey}.bin`,
          contentType: fileBlob.type || 'application/octet-stream',
          size: fileBlob.size || 0,
          dataUrl,
          uploadedAt: new Date().toISOString()
        };
        const res = await fetch(fbUrl(`files/${encodeFirebaseKey(fileKey)}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return res.ok;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  async function downloadFileFromRemote(fileKey) {
    if (!syncMode || !fileKey || typeof fetch !== 'function') return null;
    if (syncMode === 'sql') {
      try {
        const res = await fetch(sqlUrl(`/api/files/${encodeURIComponent(fileKey)}`), { cache: 'no-store' });
        if (!res.ok) return null;
        return await res.blob();
      } catch (e) {
        return null;
      }
    }
    if (syncMode === 'firebase') {
      try {
        const res = await fetch(fbUrl(`files/${encodeFirebaseKey(fileKey)}`), { cache: 'no-store' });
        if (!res.ok) return null;
        const rec = await res.json();
        if (!rec || !rec.dataUrl) return null;
        return dataUrlToBlobSimple(rec.dataUrl, rec.contentType);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  async function flushPendingToRemote(isUnloading = false) {
    if (!syncMode || typeof fetch !== 'function') return;
    const keys = Object.keys(pendingBuckets);
    if (keys.length === 0 || isFlushing) return;

    const batch = pendingBuckets;
    pendingBuckets = {};
    isFlushing = true;

    try {
      if (syncMode === 'sql') {
        const bodyStr = JSON.stringify({ clientId, buckets: batch });
        const fetchOpts = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        };
        if (isUnloading && bodyStr.length < 55000) fetchOpts.keepalive = true;
        const res = await fetch(sqlUrl('/api/sync'), fetchOpts);
        if (res.ok) {
          flushFailCount = 0;
          const data = await res.json();
          if (data && typeof data.revision === 'number' && data.revision > currentRevision) {
            currentRevision = data.revision;
          }
          updateSyncBadge(true, Boolean(sseSource && sseSource.readyState === 1));
        } else {
          flushFailCount++;
          Object.assign(pendingBuckets, batch);
          updateSyncBadge(false, false);
        }
      } else if (syncMode === 'firebase') {
        const bodyStr = JSON.stringify(batch);
        const patchOpts = {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        };
        // Note: Chrome/Edge enforce a strict 64 KB cap when keepalive is true; never use keepalive on >55 KB payloads (courses catalog is ~395 KB).
        if (isUnloading && bodyStr.length < 55000) patchOpts.keepalive = true;
        const patchRes = await fetch(fbUrl('buckets'), patchOpts);
        if (!patchRes.ok) throw new Error(`Firebase buckets PATCH failed (${patchRes.status})`);

        const nextRev = Math.max(Date.now(), currentRevision + 1);
        const metaPayload = {
          revision: nextRev,
          clientId,
          updatedAt: new Date().toISOString()
        };
        const metaOpts = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metaPayload)
        };
        if (isUnloading) metaOpts.keepalive = true;
        const metaRes = await fetch(fbUrl('meta'), metaOpts);
        if (metaRes.ok) {
          flushFailCount = 0;
          currentRevision = nextRev;
          updateSyncBadge(true, Boolean(sseSource && sseSource.readyState === 1));
        } else {
          flushFailCount++;
          updateSyncBadge(false, false);
        }
      }
    } catch (err) {
      flushFailCount++;
      Object.assign(pendingBuckets, batch);
      updateSyncBadge(false, false);
    } finally {
      isFlushing = false;
      if (!isUnloading && Object.keys(pendingBuckets).length > 0) {
        const delayMs = flushFailCount === 0
          ? 120
          : Math.min(10000, 400 * Math.pow(2, Math.min(flushFailCount - 1, 5)));
        setTimeout(() => flushPendingToRemote(false), delayMs);
      }
    }
  }

  function scheduleFlush() {
    if (!syncMode || !initialHydrationDone) return;
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushPendingToRemote(false);
    }, 90);
  }

  // Write-through localStorage hook
  if (typeof fetch === 'function') {
    localStorage.setItem = function (key, value) {
      origSetItem.call(localStorage, key, value);
      if (syncMode && initialHydrationDone && !isApplyingRemote && SYNC_KEYS.includes(key)) {
        pendingBuckets[key] = String(value);
        scheduleFlush();
      }
    };

    localStorage.removeItem = function (key) {
      origRemoveItem.call(localStorage, key);
      if (syncMode && initialHydrationDone && !isApplyingRemote && SYNC_KEYS.includes(key)) {
        pendingBuckets[key] = null;
        scheduleFlush();
      }
    };

    window.addEventListener('beforeunload', () => {
      if (syncMode && initialHydrationDone && Object.keys(pendingBuckets).length > 0) flushPendingToRemote(true);
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

  function refreshActiveScreenFromRemote() {
    try {
      if (typeof loadPersistedCoursesCatalog === 'function') loadPersistedCoursesCatalog();
      if (typeof loadAdminPersistedDirectories === 'function') loadAdminPersistedDirectories();
      if (typeof getStoredProjects === 'function' && typeof studentProjectsList !== 'undefined') {
        studentProjectsList = getStoredProjects();
      }
      if (typeof ensureRelationalIntegrity === 'function') ensureRelationalIntegrity();
      if (typeof syncDynamicCourseSelectors === 'function') syncDynamicCourseSelectors();
      if (typeof syncHeaderNotificationDot === 'function') syncHeaderNotificationDot();
      if (typeof updateBreadcrumbUI === 'function' && typeof currentScreen !== 'undefined' && currentScreen) {
        updateBreadcrumbUI(currentScreen);
      }
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
      const theme = localStorage.getItem('atht_global_festival_theme') || localStorage.getItem('atht_festival_theme') || 'default';
      if (typeof applyFestivalThemeToUI === 'function') {
        applyFestivalThemeToUI(theme);
      }
      if (typeof translateDOM === 'function' && typeof currentLanguage !== 'undefined') {
        translateDOM(currentLanguage);
      }
    } catch (e) {}
  }

  function applyRemoteBuckets(bucketsObj, nextRev) {
    currentRevision = Number(nextRev || currentRevision);
    isApplyingRemote = true;
    try {
      SYNC_KEYS.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(bucketsObj, key) && bucketsObj[key] !== null && bucketsObj[key] !== undefined) {
          origSetItem.call(localStorage, key, String(bucketsObj[key]));
        } else {
          origRemoveItem.call(localStorage, key);
        }
      });
    } finally {
      isApplyingRemote = false;
    }
    refreshActiveScreenFromRemote();
  }

  function scheduleDeferredPull(expectedRevision) {
    deferredPullRev = expectedRevision;
    if (deferredPullTimer) return;
    deferredPullTimer = setTimeout(() => {
      deferredPullTimer = null;
      const rev = deferredPullRev;
      deferredPullRev = null;
      pullLatestFromRemote(rev, false);
    }, 1500);
  }

  async function seedRemoteOnFirstRun(forceEmpty = false) {
    if (!syncMode || typeof fetch !== 'function') return false;
    if (!forceEmpty && syncMode === 'sql') {
      const hadSqlData = boot && boot.buckets && Object.keys(boot.buckets).length > 0;
      if (hadSqlData) return false;
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
      if (Object.keys(seedBatch).length === 0) return false;

      if (syncMode === 'sql') {
        Object.assign(pendingBuckets, seedBatch);
        await flushPendingToRemote();
        return true;
      }

      if (syncMode === 'firebase') {
        const nextRev = Math.max(Date.now(), currentRevision + 1);
        const res = await fetch(fbUrl(''), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meta: { revision: nextRev, clientId, updatedAt: new Date().toISOString() },
            buckets: seedBatch
          })
        });
        if (res.ok) {
          currentRevision = nextRev;
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  async function pullLatestFromRemote(expectedRevision = null, forceFirstPull = false) {
    if (!syncMode || typeof fetch !== 'function') return false;
    if (!forceFirstPull && (isFlushing || Object.keys(pendingBuckets).length > 0)) return false;
    if (!forceFirstPull && expectedRevision !== null && expectedRevision <= currentRevision) return false;
    if (!forceFirstPull && (hasOpenModal() || isUserTyping())) {
      scheduleDeferredPull(expectedRevision);
      return false;
    }

    try {
      if (syncMode === 'sql') {
        const bRes = await fetch(sqlUrl('/api/bootstrap'), { cache: 'no-store' });
        if (!bRes.ok) return false;
        const bData = await bRes.json();
        if (bData && bData.connected && bData.buckets) {
          if (Object.keys(bData.buckets).length === 0) {
            await seedRemoteOnFirstRun(true);
            return true;
          }
          applyRemoteBuckets(bData.buckets, bData.revision || expectedRevision || currentRevision);
          return true;
        }
      } else if (syncMode === 'firebase') {
        const res = await fetch(fbUrl(''), { cache: 'no-store' });
        if (!res.ok) return false;
        const data = await res.json();
        if (!data || !data.buckets || typeof data.buckets !== 'object' || Object.keys(data.buckets).length === 0) {
          await seedRemoteOnFirstRun(true);
          return true;
        }
        const remoteRev = Number((data.meta && data.meta.revision) || expectedRevision || Date.now());
        if (!forceFirstPull && remoteRev <= currentRevision) return false;
        applyRemoteBuckets(data.buckets, remoteRev);
        return true;
      }
    } catch (e) {}
    return false;
  }

  function closeSse() {
    if (sseSource) {
      try { sseSource.close(); } catch (e) {}
      sseSource = null;
    }
  }

  function connectSseRealtime() {
    closeSse();
    if (!syncMode || typeof EventSource === 'undefined') return;

    try {
      if (syncMode === 'sql') {
        sseSource = new EventSource(sqlUrl(`/api/events?clientId=${encodeURIComponent(clientId)}`));
        sseSource.addEventListener('connected', () => {
          updateSyncBadge(true, true);
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
              pullLatestFromRemote(null);
            } else if (typeof msg.revision === 'number' && msg.revision > currentRevision) {
              pullLatestFromRemote(msg.revision);
            }
          } catch (e) {}
        };
        sseSource.onerror = () => {
          updateSyncBadge(false, false);
          if (sseSource && sseSource.readyState === 2) {
            setTimeout(() => { if (syncMode === 'sql') connectSseRealtime(); }, 3000);
          }
        };
      } else if (syncMode === 'firebase') {
        sseSource = new EventSource(fbUrl('meta'));
        const handleFbMetaEvent = (evt) => {
          updateSyncBadge(true, true);
          try {
            const payload = JSON.parse(evt.data);
            if (!payload || payload.data === null || payload.data === undefined) return;
            let rev = 0;
            let senderId = '';
            if (payload.path === '/' && typeof payload.data === 'object') {
              rev = Number(payload.data.revision || 0);
              senderId = String(payload.data.clientId || '');
            } else if (payload.path === '/revision') {
              rev = Number(payload.data || 0);
            }
            if (senderId === clientId) {
              if (rev > currentRevision) currentRevision = rev;
              return;
            }
            if (rev > currentRevision) {
              pullLatestFromRemote(rev);
            }
          } catch (e) {}
        };
        sseSource.addEventListener('open', () => updateSyncBadge(true, true));
        sseSource.addEventListener('put', handleFbMetaEvent);
        sseSource.addEventListener('patch', handleFbMetaEvent);
        sseSource.onerror = () => {
          updateSyncBadge(true, false);
          if (sseSource && sseSource.readyState === 2) {
            setTimeout(() => { if (syncMode === 'firebase') connectSseRealtime(); }, 3000);
          }
        };
      }
    } catch (e) {}
  }

  async function checkBackupVersion() {
    if (!syncMode || typeof fetch !== 'function') return;
    if (isFlushing || Object.keys(pendingBuckets).length > 0) return;

    try {
      if (syncMode === 'sql') {
        const res = await fetch(sqlUrl('/api/version'), { cache: 'no-store' });
        if (!res.ok) { updateSyncBadge(false, false); return; }
        const vData = await res.json();
        updateSyncBadge(Boolean(vData && vData.connected), Boolean(sseSource && sseSource.readyState === 1));
        if (vData && typeof vData.revision === 'number' && vData.revision > currentRevision) {
          await pullLatestFromRemote(vData.revision);
        }
      } else if (syncMode === 'firebase') {
        const res = await fetch(fbUrl('meta'), { cache: 'no-store' });
        if (!res.ok) { updateSyncBadge(false, false); return; }
        const meta = await res.json();
        updateSyncBadge(true, Boolean(sseSource && sseSource.readyState === 1));
        const rev = Number((meta && meta.revision) || 0);
        if (rev > currentRevision && (!meta || meta.clientId !== clientId)) {
          await pullLatestFromRemote(rev);
        }
      }
    } catch (e) {
      updateSyncBadge(false, false);
    }
  }

  async function connectFirebaseEndpoint(rawFbUrl) {
    const clean = normalizeBaseUrl(rawFbUrl);
    if (!clean) {
      origSetItem.call(localStorage, FIREBASE_URL_STORAGE_KEY, 'off');
      origRemoveItem.call(localStorage, API_URL_STORAGE_KEY);
      closeSse();
      syncMode = '';
      apiBase = '';
      firebaseBase = '';
      updateSyncBadge(false, false);
      if (typeof alertMessage === 'function') {
        alertMessage(currentLanguage === 'th' ? 'สลับกลับเป็นโหมดเบราว์เซอร์ปกติแล้ว' : 'Switched to Browser Local Mode');
      }
      return false;
    }

    try {
      const testRes = await fetch(`${clean}/${FIREBASE_PORTAL_ROOT}/meta.json`, { cache: 'no-store' });
      if (!testRes.ok) throw new Error(`HTTP ${testRes.status}`);
      origRemoveItem.call(localStorage, API_URL_STORAGE_KEY);
      origSetItem.call(localStorage, FIREBASE_URL_STORAGE_KEY, clean);
      syncMode = 'firebase';
      apiBase = '';
      firebaseBase = clean;
      currentRevision = 0;
      await pullLatestFromRemote(null, true);
      connectSseRealtime();
      updateSyncBadge(true, true);
      if (typeof alertMessage === 'function') {
        alertMessage(currentLanguage === 'th'
          ? 'เชื่อมต่อ Firebase Realtime Database สำเร็จ!'
          : 'Connected to Firebase Realtime Database in Realtime!');
      }
      return true;
    } catch (err) {
      if (typeof alertMessage === 'function') {
        alertMessage(currentLanguage === 'th'
          ? 'เชื่อมต่อ Firebase ไม่สำเร็จ: กรุณาตรวจสอบ URL และ Rules (' + (err.message || '') + ')'
          : 'Firebase connection failed: check Database URL and Rules.');
      }
      return false;
    }
  }

  async function connectSqlEndpoint(rawUrl) {
    const clean = normalizeBaseUrl(rawUrl);
    if (!clean) {
      origRemoveItem.call(localStorage, API_URL_STORAGE_KEY);
      if (!isSameOriginSql) {
        closeSse();
        apiBase = '';
        const savedFbRaw = String(localStorage.getItem(FIREBASE_URL_STORAGE_KEY) || '').trim();
        if (savedFbRaw.toLowerCase() !== 'off' && (savedFbRaw || DEFAULT_FIREBASE_DB_URL)) {
          firebaseBase = normalizeBaseUrl(savedFbRaw || DEFAULT_FIREBASE_DB_URL);
          syncMode = 'firebase';
          currentRevision = 0;
          await pullLatestFromRemote(null, true);
          connectSseRealtime();
          updateSyncBadge(true, true);
          if (typeof alertMessage === 'function') {
            alertMessage(currentLanguage === 'th' ? 'สลับกลับเป็นโหมดซิงค์ Firebase Cloud แล้ว' : 'Switched back to Firebase Cloud Sync');
          }
          return false;
        }
        syncMode = '';
        updateSyncBadge(false, false);
      }
      if (typeof alertMessage === 'function') {
        alertMessage(currentLanguage === 'th' ? 'สลับกลับเป็นโหมดเบราว์เซอร์ปกติแล้ว' : 'Disconnected SQL API (Local Mode)');
      }
      return false;
    }

    if (isFirebaseUrl(clean)) {
      return connectFirebaseEndpoint(clean);
    }

    try {
      const res = await fetch(`${clean}/api/health`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data || !data.connected) {
        throw new Error((data && data.error) || 'SQL API unreachable');
      }
      apiBase = clean;
      firebaseBase = '';
      syncMode = 'sql';
      currentRevision = 0;
      origSetItem.call(localStorage, API_URL_STORAGE_KEY, clean);
      await pullLatestFromRemote(null, true);
      connectSseRealtime();
      updateSyncBadge(true, true);
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
    const val = (inp ? inp.value : '').trim() || DEFAULT_FIREBASE_DB_URL;
    if (isFirebaseUrl(val)) connectFirebaseEndpoint(val);
    else connectSqlEndpoint(val);
  };

  window.disconnectAdminSqlBridge = function () {
    const inp = document.getElementById('adminSqlApiUrlInput');
    if (syncMode === 'sql' && !isSameOriginSql) {
      if (inp) inp.value = '';
      connectSqlEndpoint('');
    } else if (syncMode === 'firebase') {
      if (inp) inp.value = '';
      connectFirebaseEndpoint('');
    } else {
      if (inp) inp.value = DEFAULT_FIREBASE_DB_URL;
      connectFirebaseEndpoint(DEFAULT_FIREBASE_DB_URL);
    }
  };

  window.copyGithubSqlShareLink = function () {
    const inp = document.getElementById('adminSqlApiUrlInput');
    const typedUrl = normalizeBaseUrl(inp && inp.value);
    const pageBase = window.location ? `${window.location.origin}${window.location.pathname}` : 'https://yangweimingdotjpg.github.io/ATHTs/';
    let shareUrl = pageBase;

    if (syncMode === 'sql' || (typedUrl && !isFirebaseUrl(typedUrl))) {
      const urlVal = typedUrl || apiBase;
      if (!urlVal) {
        if (typeof alertMessage === 'function') {
          alertMessage(currentLanguage === 'th' ? 'กรุณากรอก URL ของเซิร์ฟเวอร์ ATHT_devv3 ก่อนครับ' : 'Please enter ATHT_devv3 API URL first.');
        }
        return;
      }
      shareUrl = `${pageBase}?api=${encodeURIComponent(urlVal)}`;
    } else if (syncMode === 'firebase' || (typedUrl && isFirebaseUrl(typedUrl))) {
      const fbVal = typedUrl || firebaseBase;
      shareUrl = fbVal && fbVal !== DEFAULT_FIREBASE_DB_URL
        ? `${pageBase}?fb=${encodeURIComponent(fbVal)}`
        : pageBase;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    if (typeof alertMessage === 'function') {
      alertMessage(currentLanguage === 'th' ? `คัดลอกลิงก์แชร์แบบซิงค์เรียลไทม์แล้ว: ${shareUrl}` : `Copied Realtime Share Link: ${shareUrl}`);
    }
  };

  async function startInitialSync() {
    if (typeof applyLanguage === 'function' && !window.__athtApplyLangHooked) {
      window.__athtApplyLangHooked = true;
      const origApplyLanguage = applyLanguage;
      applyLanguage = function (lang) {
        const out = origApplyLanguage(lang);
        updateSyncBadge(Boolean(syncMode), Boolean(sseSource && sseSource.readyState === 1));
        return out;
      };
    }
    updateSyncBadge(Boolean(syncMode), false);
    if (isSameOriginSql) {
      initialHydrationDone = true;
      await seedRemoteOnFirstRun(false);
      connectSseRealtime();
      updateSyncBadge(true, true);
    } else if (syncMode === 'sql' || syncMode === 'firebase') {
      const ok = await pullLatestFromRemote(null, true);
      initialHydrationDone = true;
      if (ok) {
        connectSseRealtime();
        updateSyncBadge(true, true);
      } else {
        updateSyncBadge(false, false);
      }
    } else {
      initialHydrationDone = true;
    }
  }

  window.addEventListener('load', () => {
    setTimeout(startInitialSync, 30);

    setInterval(() => {
      if (syncMode && initialHydrationDone) checkBackupVersion();
    }, 5000);
  });

  function handleForegroundSync() {
    if (!syncMode || !initialHydrationDone) return;
    const now = Date.now();
    if (now - lastVisibilityCheckAt < 1200) return;
    lastVisibilityCheckAt = now;
    if (!sseSource || sseSource.readyState === 2) {
      connectSseRealtime();
    }
    checkBackupVersion();
  }

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') handleForegroundSync();
    });
  }
  window.addEventListener('focus', handleForegroundSync);

  window.__ATHT_SQL_SYNC = {
    isSqlMode: () => Boolean(syncMode),
    getSyncMode: () => syncMode || 'local',
    getApiBase: () => apiBase,
    getFirebaseUrl: () => firebaseBase,
    clientId,
    flushNow: flushPendingToRemote,
    pullNow: pullLatestFromRemote,
    uploadFileToSql: uploadFileToRemote,
    downloadFileFromSql: downloadFileFromRemote,
    connectSqlEndpoint,
    connectFirebaseEndpoint,
    getRevision: () => currentRevision
  };
})();
