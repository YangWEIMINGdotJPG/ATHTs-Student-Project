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
  const FIREBASE_AUTH_STORAGE_KEY = 'atht_fb_auth_session';
  const FIREBASE_WEB_API_KEY = 'AIzaSyCWCIUlXEBZGe39Q2Br88uplKe7zoUT3Ik';
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
  let serverAuthMode = Boolean(boot && boot.authEnabled);
  let serverAuthAuthenticated = Boolean(boot && boot.authenticated);
  let serverAuthUser = (boot && boot.user) || null;
  let serverAuthToken = ''; // In-memory only for cross-origin; same-origin uses HttpOnly cookie

  let syncMode = ''; // 'sql' | 'firebase' | ''
  let apiBase = '';
  let firebaseBase = '';

  function buildAuthHeaders(extra = {}) {
    const h = Object.assign({}, extra || {});
    if (serverAuthToken) {
      h['Authorization'] = `Bearer ${serverAuthToken}`;
    }
    return h;
  }

  function sqlFetch(url, opts = {}) {
    const merged = Object.assign({ credentials: 'include' }, opts || {});
    if (serverAuthToken) {
      merged.headers = buildAuthHeaders(opts && opts.headers);
    }
    return fetch(url, merged);
  }

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
    if (boot && boot.disableFirebase) {
      syncMode = '';
      apiBase = '';
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
  let initialHydrationDone = Boolean(isSameOriginSql && (!serverAuthMode || serverAuthAuthenticated));
  let pendingBuckets = {};
  let flushTimer = null;
  let flushFailCount = 0;
  let deferredPullTimer = null;
  let deferredPullRev = null;
  let isApplyingRemote = false;
  let isFlushing = false;
  let sseSource = null;
  let lastVisibilityCheckAt = 0;

  let fbIdToken = '';
  let fbRefreshToken = '';
  let fbTokenExpiresAt = 0;
  let fbAuthInFlight = null;
  let fbRefreshTimer = null;

  try {
    const savedFbAuth = localStorage.getItem(FIREBASE_AUTH_STORAGE_KEY);
    if (savedFbAuth) {
      const parsedFb = JSON.parse(savedFbAuth);
      if (parsedFb && parsedFb.idToken) {
        fbIdToken = String(parsedFb.idToken || '');
        fbRefreshToken = String(parsedFb.refreshToken || '');
        fbTokenExpiresAt = Number(parsedFb.expiresAt || 0);
      }
    }
  } catch (_e) {}

  function saveFbAuthCache(idToken, refreshToken, expiresInSec) {
    fbIdToken = String(idToken || '');
    fbRefreshToken = String(refreshToken || fbRefreshToken || '');
    const ttl = Math.max(60, Number(expiresInSec || 3600));
    fbTokenExpiresAt = Date.now() + ttl * 1000;
    try {
      origSetItem.call(localStorage, FIREBASE_AUTH_STORAGE_KEY, JSON.stringify({
        idToken: fbIdToken,
        refreshToken: fbRefreshToken,
        expiresAt: fbTokenExpiresAt
      }));
    } catch (_e) {}
    if (fbRefreshTimer) clearTimeout(fbRefreshTimer);
    if (syncMode === 'firebase' && typeof setTimeout === 'function') {
      const nextRefreshMs = Math.max(30000, (ttl - 180) * 1000);
      fbRefreshTimer = setTimeout(async () => {
        if (syncMode === 'firebase') {
          await ensureFirebaseIdToken(true);
          if (sseSource) connectSseRealtime();
        }
      }, nextRefreshMs);
    }
  }

  async function ensureFirebaseIdToken(forceRefresh = false) {
    if (!FIREBASE_WEB_API_KEY || typeof fetch !== 'function') return '';
    if (!forceRefresh && fbIdToken && Date.now() < fbTokenExpiresAt - 120000) {
      return fbIdToken;
    }
    if (fbAuthInFlight && !forceRefresh) return fbAuthInFlight;

    fbAuthInFlight = (async () => {
      try {
        if (fbRefreshToken) {
          const refRes = await fetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(fbRefreshToken)}`
          });
          if (refRes.ok) {
            const refData = await refRes.json();
            if (refData && refData.id_token) {
              saveFbAuthCache(refData.id_token, refData.refresh_token || fbRefreshToken, refData.expires_in);
              return fbIdToken;
            }
          }
        }

        const signRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ returnSecureToken: true })
        });
        if (signRes.ok) {
          const signData = await signRes.json();
          if (signData && signData.idToken) {
            saveFbAuthCache(signData.idToken, signData.refreshToken, signData.expiresIn);
            return fbIdToken;
          }
        }
      } catch (_e) {}
      return fbIdToken || '';
    })();

    try {
      return await fbAuthInFlight;
    } finally {
      fbAuthInFlight = null;
    }
  }

  function sqlUrl(path) {
    return apiBase ? `${apiBase}${path}` : path;
  }

  function fbUrl(subPath, baseOverride = '') {
    const cleanSub = String(subPath || '').replace(/^\/+/, '');
    const baseRoot = baseOverride || firebaseBase;
    const raw = cleanSub ? `${baseRoot}/${FIREBASE_PORTAL_ROOT}/${cleanSub}.json` : `${baseRoot}/${FIREBASE_PORTAL_ROOT}.json`;
    return fbIdToken ? `${raw}?auth=${encodeURIComponent(fbIdToken)}` : raw;
  }

  async function fbFetch(subPath, opts = {}, baseOverride = '') {
    await ensureFirebaseIdToken(false);
    let res = await fetch(fbUrl(subPath, baseOverride), opts);
    if (res.status === 401 && FIREBASE_WEB_API_KEY) {
      await ensureFirebaseIdToken(true);
      res = await fetch(fbUrl(subPath, baseOverride), opts);
    }
    return res;
  }

  // 1. Synchronous hydration when served from ATHT_devv3 (/api/bootstrap.js)
  if (isSameOriginSql && boot.buckets && typeof boot.buckets === 'object' && Object.keys(boot.buckets).length > 0) {
    isApplyingRemote = true;
    try {
      SYNC_KEYS.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(boot.buckets, key)) {
          origSetItem.call(localStorage, key, String(boot.buckets[key]));
        } else if (!serverAuthMode || serverAuthAuthenticated) {
          origRemoveItem.call(localStorage, key);
        }
      });
    } finally {
      isApplyingRemote = false;
    }
  }
  if (isSameOriginSql && serverAuthMode && !serverAuthAuthenticated) {
    // Ensure stale authenticated data is wiped before login when session cookie is absent/expired
    isApplyingRemote = true;
    try {
      SYNC_KEYS.forEach((key) => {
        if (key !== 'atht_global_festival_theme' && key !== 'atht_festival_theme') {
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
        const res = await sqlFetch(sqlUrl('/api/files'), { method: 'POST', body: form });
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
        const res = await fbFetch(`files/${encodeFirebaseKey(fileKey)}`, {
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
        const res = await sqlFetch(sqlUrl(`/api/files/${encodeURIComponent(fileKey)}`), { cache: 'no-store' });
        if (!res.ok) return null;
        return await res.blob();
      } catch (e) {
        return null;
      }
    }
    if (syncMode === 'firebase') {
      try {
        const res = await fbFetch(`files/${encodeFirebaseKey(fileKey)}`, { cache: 'no-store' });
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
        if (serverAuthMode && !serverAuthAuthenticated) return;
        const safeBatch = Object.assign({}, batch);
        if (serverAuthMode) {
          ['atht_admin_students', 'atht_admin_teachers'].forEach(dk => {
            if (typeof safeBatch[dk] === 'string') {
              try {
                const parsed = JSON.parse(safeBatch[dk]);
                Object.values(parsed || {}).forEach(u => { if (u && typeof u === 'object') delete u.password; });
                safeBatch[dk] = JSON.stringify(parsed);
              } catch (_e) {}
            }
          });
        }
        const bodyStr = JSON.stringify({ clientId, buckets: safeBatch });
        const fetchOpts = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        };
        if (isUnloading && bodyStr.length < 55000) fetchOpts.keepalive = true;
        const res = await sqlFetch(sqlUrl('/api/sync'), fetchOpts);
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
        const patchRes = await fbFetch('buckets', patchOpts);
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
        const metaRes = await fbFetch('meta', metaOpts);
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
    }, 35);
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

  const LIVE_SAFE_INPUT_IDS = new Set([
    'replyInput',
    'teacherFeedbackNoteInput',
    'tasksHubSearchInput',
    'projectsSearchInput',
    'teacherStudentSearchInput',
    'adminSearchInput',
    'coursesSearchInput',
    'notificationsSearchInput',
    'teacherProjectSearchInput'
  ]);

  function hasOpenModal() {
    if (typeof document === 'undefined') return false;
    return Array.from(document.querySelectorAll('[role="dialog"]')).some(el => !el.classList.contains('hidden'));
  }

  function isUserTyping() {
    if (typeof document === 'undefined' || !document.activeElement) return false;
    const el = document.activeElement;
    if (el.id && LIVE_SAFE_INPUT_IDS.has(el.id)) return false;
    const tag = (el.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  }

  function refreshActiveScreenFromRemote() {
    try {
      const prevEl = (typeof document !== 'undefined' && document.activeElement && document.activeElement.id)
        ? document.activeElement
        : null;
      const savedInputState = (prevEl && LIVE_SAFE_INPUT_IDS.has(prevEl.id))
        ? {
            id: prevEl.id,
            value: typeof prevEl.value === 'string' ? prevEl.value : '',
            selStart: typeof prevEl.selectionStart === 'number' ? prevEl.selectionStart : null,
            selEnd: typeof prevEl.selectionEnd === 'number' ? prevEl.selectionEnd : null
          }
        : null;

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
        else if (currentScreen === 'projects') {
          if (typeof activeViewingProjectId !== 'undefined' && activeViewingProjectId && typeof openProjectMilestoneDetail === 'function') {
            openProjectMilestoneDetail(activeViewingProjectId);
          } else if (typeof renderProjectsScreen === 'function') {
            renderProjectsScreen();
          }
        } else if (currentScreen === 'notifications' && typeof renderNotificationsScreen === 'function') renderNotificationsScreen();
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

      if (savedInputState && typeof document !== 'undefined') {
        const restoredEl = document.getElementById(savedInputState.id);
        if (restoredEl) {
          if (typeof restoredEl.value === 'string' && restoredEl.value !== savedInputState.value) {
            restoredEl.value = savedInputState.value;
          }
          if (document.activeElement !== restoredEl && typeof restoredEl.focus === 'function') {
            try { restoredEl.focus({ preventScroll: true }); } catch (e) { try { restoredEl.focus(); } catch (e2) {} }
          }
          if (savedInputState.selStart !== null && typeof restoredEl.setSelectionRange === 'function') {
            try { restoredEl.setSelectionRange(savedInputState.selStart, savedInputState.selEnd); } catch (e) {}
          }
        }
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
        const res = await fbFetch('', {
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
        if (serverAuthMode && !serverAuthAuthenticated) return false;
        const bRes = await sqlFetch(sqlUrl('/api/bootstrap'), { cache: 'no-store' });
        if (!bRes.ok) return false;
        const bData = await bRes.json();
        if (bData && bData.authEnabled) {
          serverAuthMode = true;
          serverAuthAuthenticated = Boolean(bData.authenticated);
          if (bData.authenticated && bData.user) {
            serverAuthUser = bData.user;
          } else {
            initialHydrationDone = false;
            return false;
          }
        }
        if (bData && bData.connected && bData.buckets) {
          if (Object.keys(bData.buckets).length === 0) {
            await seedRemoteOnFirstRun(true);
            return true;
          }
          applyRemoteBuckets(bData.buckets, bData.revision || expectedRevision || currentRevision);
          return true;
        }
      } else if (syncMode === 'firebase') {
        const res = await fbFetch('', { cache: 'no-store' });
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
        if (serverAuthMode && !serverAuthAuthenticated) return;
        const sseTokParam = serverAuthToken ? `&token=${encodeURIComponent(serverAuthToken)}` : '';
        sseSource = new EventSource(sqlUrl(`/api/events?clientId=${encodeURIComponent(clientId)}${sseTokParam}`), { withCredentials: true });
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
        ensureFirebaseIdToken(false).then(() => {
          if (syncMode !== 'firebase') return;
          closeSse();
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
        });
      }
    } catch (e) {}
  }

  async function checkBackupVersion() {
    if (!syncMode || typeof fetch !== 'function') return;
    if (isFlushing || Object.keys(pendingBuckets).length > 0) return;

    try {
      if (syncMode === 'sql') {
        if (serverAuthMode && !serverAuthAuthenticated) return;
        const res = await sqlFetch(sqlUrl('/api/version'), { cache: 'no-store' });
        if (!res.ok) { updateSyncBadge(false, false); return; }
        const vData = await res.json();
        updateSyncBadge(Boolean(vData && vData.connected), Boolean(sseSource && sseSource.readyState === 1));
        if (vData && typeof vData.revision === 'number' && vData.revision > currentRevision) {
          await pullLatestFromRemote(vData.revision);
        }
      } else if (syncMode === 'firebase') {
        const res = await fbFetch('meta', { cache: 'no-store' });
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
      const testRes = await fbFetch('meta', { cache: 'no-store' }, clean);
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
      const res = await sqlFetch(`${clean}/api/health`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data || !data.connected) {
        throw new Error((data && data.error) || 'SQL API unreachable');
      }
      apiBase = clean;
      firebaseBase = '';
      syncMode = 'sql';
      if (data.authEnabled) serverAuthMode = true;
      currentRevision = 0;
      origSetItem.call(localStorage, API_URL_STORAGE_KEY, clean);
      if (!serverAuthMode || serverAuthAuthenticated) {
        await pullLatestFromRemote(null, true);
        connectSseRealtime();
      }
      updateSyncBadge(true, !serverAuthMode || serverAuthAuthenticated);
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
      if (serverAuthMode && !serverAuthAuthenticated) {
        initialHydrationDone = false;
        updateSyncBadge(true, false);
        return;
      }
      initialHydrationDone = true;
      await seedRemoteOnFirstRun(false);
      connectSseRealtime();
      updateSyncBadge(true, true);
    } else if (syncMode === 'sql' || syncMode === 'firebase') {
      if (syncMode === 'sql' && serverAuthMode && !serverAuthAuthenticated) {
        initialHydrationDone = false;
        updateSyncBadge(true, false);
        return;
      }
      const ok = await pullLatestFromRemote(null, true);
      initialHydrationDone = Boolean(ok || !serverAuthMode);
      if (ok) {
        connectSseRealtime();
        updateSyncBadge(true, true);
      } else {
        updateSyncBadge(Boolean(serverAuthMode), false);
      }
    } else {
      initialHydrationDone = true;
    }
  }

  function applyServerAuthLogin(userObj, bootstrapPayload, tokenStr = '') {
    serverAuthMode = true;
    serverAuthAuthenticated = true;
    serverAuthUser = userObj || null;
    if (tokenStr) serverAuthToken = tokenStr;

    const b = bootstrapPayload && bootstrapPayload.buckets;
    const rev = (bootstrapPayload && bootstrapPayload.revision) || currentRevision;
    if (b && typeof b === 'object' && Object.keys(b).length > 0) {
      applyRemoteBuckets(b, rev);
    }
    initialHydrationDone = true;
    if (userObj && userObj.role === 'admin' && (!b || Object.keys(b).length === 0)) {
      seedRemoteOnFirstRun(true);
    }
    connectSseRealtime();
    updateSyncBadge(true, true);
  }

  async function clearServerAuthSession() {
    if (syncMode === 'sql') {
      try {
        await sqlFetch(sqlUrl('/api/auth/logout'), { method: 'POST' });
      } catch (_e) {}
    }
    serverAuthAuthenticated = false;
    serverAuthUser = null;
    serverAuthToken = '';
    initialHydrationDone = false;
    pendingBuckets = {};
    closeSse();
    if (serverAuthMode) {
      isApplyingRemote = true;
      try {
        SYNC_KEYS.forEach((key) => {
          if (key !== 'atht_global_festival_theme' && key !== 'atht_festival_theme') {
            origRemoveItem.call(localStorage, key);
          }
        });
      } finally {
        isApplyingRemote = false;
      }
    }
    updateSyncBadge(syncMode === 'sql', false);
  }

  window.addEventListener('load', () => {
    setTimeout(startInitialSync, 30);

    setInterval(() => {
      if (syncMode && initialHydrationDone) checkBackupVersion();
    }, 2500);
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
    isServerAuthMode: () => Boolean(syncMode === 'sql' && serverAuthMode),
    isServerAuthenticated: () => Boolean(syncMode === 'sql' && serverAuthMode && serverAuthAuthenticated),
    getAuthenticatedUser: () => serverAuthUser,
    sqlFetch: (path, opts) => sqlFetch(sqlUrl(path), opts),
    applyServerAuthLogin,
    clearServerAuthSession,
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
