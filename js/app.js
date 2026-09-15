// ===========================
// VISITOR PASS SYSTEM - CORE APP LOGIC
// Shared state, localStorage, utilities
// ===========================
const VPS = (function () {
  'use strict';
  // ─── CONSTANTS ───────────────────────────────────────────
  const STORAGE_KEY = 'vps_data';
  const USERS_KEY = 'vps_users';
  const SESSION_KEY = 'vps_session';
  const STATUS = {
    PENDING_HOD: 'pending_hod',
    PENDING_ADMIN: 'pending_admin',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  };
  const ROLES = {
    DIVISION: 'division',
    HOD: 'hod',
    ADMIN: 'admin',
    SECURITY: 'security',
    ITADMIN: 'itadmin',
  };
  // ─── OFFICIAL 25 DIVISIONS ───────────────────────────────
  const DIVISIONS = [
    'CPD(MTV)',
    'Digital',
    'IT Division',
    'Legends FM',
    'M&E',
    'Admin',
    'MBC CPD',
    'MBC Engineering',
    'MBC Finance',
    'MBC Library',
    'MBC Scheduling',
    'Mekup Room',
    'MTV Dubbing',
    'MTV Engineering',
    'MTV Library',
    'MTV Maintenance',
    'MTV MCR',
    'Shakthi FM',
    'Shakthi TV',
    'Sirasa FM',
    'Y FM',
    'Yes FM',
    'Subtitle division',
    'TX Room',
    'TV1'
  ];
  // ─── DEFAULT USERS ───────────────────────────────────────
  const DEFAULT_USERS = [
    { id: 'u4', username: 'director', password: 'admin123', name: 'Director Fernando', role: ROLES.ADMIN, department: 'All', email: 'director@company.com', avatar: 'D' },
    { id: 'u6', username: 'itadmin', password: 'admin123', name: 'IT Admin', role: ROLES.ITADMIN, department: 'IT Division', email: 'itadmin@company.com', avatar: 'I' },
    { id: 'u_hod_it', username: 'hod_it', password: 'hod123', name: 'HOD IT Division', role: ROLES.HOD, department: 'IT Division', email: 'hod_it@company.com', avatar: 'H' },
    { id: 'u_sec', username: 'security', password: 'admin123', name: 'Security Officer', role: ROLES.SECURITY, department: 'Security', email: 'security@company.com', avatar: 'S' },
  ];
  // ─── INIT ─────────────────────────────────────────────────
  function init() {
    if (localStorage.getItem('vps_db_ver') !== '1.2') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(USERS_KEY);
      localStorage.setItem('vps_db_ver', '1.2');
    }
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEY)) {
      const mockData = [
        {
          id: 'VIS-202606-0001',
          visitorName: 'Saman Kumara',
          visitorNIC: '199201584752',
          visitorPhone: '0777123456',
          company: 'Dialog Axiata PLC',
          hostName: 'Mr. Silva',
          department: 'IT',
          visitDate: '2026-06-14',
          visitTime: '09:30',
          purpose: 'Network infrastructure maintenance',
          notes: 'Requires server room access clearance',
          submittedBy: 'u6',
          submittedByName: 'IT Admin',
          submittedByDept: 'IT',
          submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          status: STATUS.APPROVED,
          hodApproval: { by: 'u4', byName: 'HOD IT', at: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(), action: 'approved' },
          adminApproval: { by: 'u5', byName: 'Director Silva', at: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(), notes: 'Approved', action: 'approved' },
          qrData: 'VIS-202606-0001',
          scannedAt: new Date(Date.now() - 1000 * 60 * 60 * 44).toISOString(),
          entryGranted: true,
          inTime: new Date(Date.now() - 1000 * 60 * 60 * 44).toISOString(),
          outTime: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString()
        },
        {
          id: 'VIS-202606-0002',
          visitorName: 'Amara Siriwardena',
          visitorNIC: '198503145620',
          visitorPhone: '0714567890',
          company: 'HR Services Ltd',
          hostName: 'Mrs. Perera',
          department: 'HR',
          visitDate: '2026-06-16',
          visitTime: '10:00',
          purpose: 'Staff training discussion',
          notes: 'Conference room B',
          submittedBy: 'u1',
          submittedByName: 'HR Dept User',
          submittedByDept: 'HR',
          submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          status: STATUS.APPROVED,
          hodApproval: { by: 'u2', byName: 'HOD HR', at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), action: 'approved' },
          adminApproval: { by: 'u5', byName: 'Director Silva', at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), notes: 'Approved for training', action: 'approved' },
          qrData: 'VIS-202606-0002',
          scannedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          entryGranted: true,
          inTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          outTime: null
        },
        {
          id: 'VIS-202606-0003',
          visitorName: 'John Doe',
          visitorNIC: '881234567V',
          visitorPhone: '0723456789',
          company: 'Finance Auditors',
          hostName: 'Mr. Rajan',
          department: 'Finance',
          visitDate: '2026-06-16',
          visitTime: '11:00',
          purpose: 'Annual account audit review',
          notes: 'Confidential review',
          submittedBy: 'u1',
          submittedByName: 'Finance User',
          submittedByDept: 'Finance',
          submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          status: STATUS.PENDING_ADMIN,
          hodApproval: { by: 'u3', byName: 'HOD Finance', at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), action: 'approved' },
          adminApproval: null,
          qrData: 'VIS-202606-0003',
          scannedAt: null,
          entryGranted: null,
          inTime: null,
          outTime: null
        },
        {
          id: 'VIS-202606-0004',
          visitorName: 'Sarah Taylor',
          visitorNIC: '956321458V',
          visitorPhone: '0754896231',
          company: 'Creative Media',
          hostName: 'Mrs. Fernando',
          department: 'Marketing',
          visitDate: '2026-06-17',
          visitTime: '13:00',
          purpose: 'Marketing materials delivery',
          notes: 'Needs entry for additional crew members',
          submittedBy: 'u1',
          submittedByName: 'Marketing User',
          submittedByDept: 'Marketing',
          submittedAt: new Date().toISOString(),
          status: STATUS.PENDING_HOD,
          hodApproval: null,
          adminApproval: null,
          qrData: 'VIS-202606-0004',
          scannedAt: null,
          entryGranted: null,
          inTime: null,
          outTime: null,
          groupMembers: [
            { name: 'Tom Jones', nic: '852013647V', phone: '0751234567' },
            { name: 'Lisa Kudrow', nic: '912034756V', phone: '0759876543' }
          ]
        },
        {
          id: 'VIS-202606-0005',
          visitorName: 'David Miller',
          visitorNIC: '784561230V',
          visitorPhone: '0781236547',
          company: 'Miller Elevators',
          hostName: 'Mr. Perera',
          department: 'Operations',
          visitDate: '2026-06-15',
          visitTime: '08:30',
          purpose: 'Elevator safety inspection',
          notes: 'Routine service check',
          submittedBy: 'u1',
          submittedByName: 'Operations User',
          submittedByDept: 'Operations',
          submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          status: STATUS.REJECTED,
          hodApproval: { by: 'u4', byName: 'HOD Operations', at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(), comment: 'Officer not in office today. Please reschedule.', action: 'rejected' },
          adminApproval: null,
          qrData: 'VIS-202606-0005',
          scannedAt: null,
          entryGranted: null,
          inTime: null,
          outTime: null
        },
        {
          id: 'VIS-202606-0006',
          visitorName: 'Kamal Perera',
          visitorNIC: '199014587632',
          visitorPhone: '0774561230',
          company: 'Lanka Telecom',
          hostName: 'Mr. Silva',
          department: 'IT',
          visitDate: '2026-06-16',
          visitTime: '14:00',
          purpose: 'Broadband link troubleshooting',
          notes: 'Server room access required',
          submittedBy: 'u1',
          submittedByName: 'IT User',
          submittedByDept: 'IT',
          submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          status: STATUS.APPROVED,
          hodApproval: { by: 'u4', byName: 'HOD IT', at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), action: 'approved' },
          adminApproval: { by: 'u5', byName: 'Director Silva', at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), notes: 'Approved', action: 'approved' },
          qrData: 'VIS-202606-0006',
          scannedAt: null,
          entryGranted: null,
          inTime: null,
          outTime: null
        },
        {
          id: 'VIS-202606-0007',
          visitorName: 'Nimali Fernando',
          visitorNIC: '931234567V',
          visitorPhone: '0761234567',
          company: 'Career Path Lanka',
          hostName: 'Mrs. Perera',
          department: 'HR',
          visitDate: '2026-06-17',
          visitTime: '09:00',
          purpose: 'Candidate interviews',
          notes: 'Meeting room 1',
          submittedBy: 'u1',
          submittedByName: 'HR User',
          submittedByDept: 'HR',
          submittedAt: new Date().toISOString(),
          status: STATUS.PENDING_HOD,
          hodApproval: null,
          adminApproval: null,
          qrData: 'VIS-202606-0007',
          scannedAt: null,
          entryGranted: null,
          inTime: null,
          outTime: null
        },
        {
          id: 'VIS-202606-0008',
          visitorName: 'Ruwan Jayasinghe',
          visitorNIC: '820456789V',
          visitorPhone: '0779876543',
          company: 'Tax Advisory Group',
          hostName: 'Mr. Rajan',
          department: 'Finance',
          visitDate: '2026-06-17',
          visitTime: '10:30',
          purpose: 'Quarterly tax planning session',
          notes: 'Group discussion',
          submittedBy: 'u1',
          submittedByName: 'Finance User',
          submittedByDept: 'Finance',
          submittedAt: new Date().toISOString(),
          status: STATUS.APPROVED,
          hodApproval: { by: 'u3', byName: 'HOD Finance', at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), action: 'approved' },
          adminApproval: { by: 'u5', byName: 'Director Silva', at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), notes: 'Approved', action: 'approved' },
          qrData: 'VIS-202606-0008',
          scannedAt: null,
          entryGranted: null,
          inTime: null,
          outTime: null,
          groupMembers: [
            { name: 'Nishan Alwis', nic: '883024567V', phone: '0771112223' }
          ]
        },
        {
          id: 'VIS-202606-0009',
          visitorName: 'Priyantha Bandara',
          visitorNIC: '197501245678',
          visitorPhone: '0711234567',
          company: 'Bandara Cleaning Services',
          hostName: 'Mr. Perera',
          department: 'Operations',
          visitDate: '2026-06-16',
          visitTime: '15:30',
          purpose: 'Office deep cleaning review',
          notes: 'Facility tour',
          submittedBy: 'u1',
          submittedByName: 'Operations User',
          submittedByDept: 'Operations',
          submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          status: STATUS.PENDING_ADMIN,
          hodApproval: { by: 'u4', byName: 'HOD Operations', at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), action: 'approved' },
          adminApproval: null,
          qrData: 'VIS-202606-0009',
          scannedAt: null,
          entryGranted: null,
          inTime: null,
          outTime: null
        },
        {
          id: 'VIS-202606-0010',
          visitorName: 'Kasun Wickramasinghe',
          visitorNIC: '910345678V',
          visitorPhone: '0729876543',
          company: 'Wickramasinghe Ads',
          hostName: 'Mrs. Fernando',
          department: 'Marketing',
          visitDate: '2026-06-15',
          visitTime: '11:00',
          purpose: 'Billboard project review',
          notes: 'Marketing team meeting',
          submittedBy: 'u1',
          submittedByName: 'Marketing User',
          submittedByDept: 'Marketing',
          submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          status: STATUS.REJECTED,
          hodApproval: { by: 'u4', byName: 'HOD Marketing', at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(), action: 'approved' },
          adminApproval: { by: 'u5', byName: 'Director Silva', at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), notes: 'Incorrect department selection. Resubmit under HR.', action: 'rejected' },
          qrData: 'VIS-202606-0010',
          scannedAt: null,
          entryGranted: null,
          inTime: null,
          outTime: null
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
    }
    
    // Initialize real-time cloud database synchronization if enabled
    setTimeout(() => {
      initFirebaseSync();
    }, 100);
  }
  // ─── AUTH ─────────────────────────────────────────────────
  function login(username, password) {
    const users = getAllUsers();
    // Case-insensitive username check
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  }
  // Cloud-aware login: if local fails, fetch users from Firebase and retry
  async function loginWithCloud(username, password) {
    // First try local storage
    const localResult = login(username, password);
    if (localResult) return localResult;
    // If Firebase is enabled, fetch users directly from cloud and retry
    if (!isFirebaseEnabled()) return null;
    const db = getFirestore();
    if (!db) return null;
    try {
      console.log('Local login failed. Fetching users from Firebase cloud...');
      const snapshot = await db.collection('users').get();
      const cloudUsers = [];
      snapshot.forEach(doc => cloudUsers.push(doc.data()));
      if (cloudUsers.length > 0) {
        // Update local storage with cloud users
        localStorage.setItem(USERS_KEY, JSON.stringify(cloudUsers));
        // Try login again with cloud users
        const user = cloudUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        if (user) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(user));
          return user;
        }
      }
    } catch (err) {
      console.warn('Cloud login check failed:', err);
    }
    return null;
  }
  function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
  }
  function getCurrentUser() {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  }
  function requireAuth(allowedRoles) {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'index.html';
      return null;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      showNotification('Access denied for your role', 'error');
      setTimeout(() => window.location.href = 'index.html', 1500);
      return null;
    }
    return user;
  }
  // ─── VISITOR DATA CRUD ───────────────────────────────────
  function getAll() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }
  function save(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }
  function generateId() {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const records = getAll();
    const currentMonthPrefix = `VIS-${yearMonth}-`;
    let maxSeq = 0;
    records.forEach(r => {
      if (r.id && r.id.startsWith(currentMonthPrefix)) {
        const parts = r.id.split('-');
        if (parts.length === 3) {
          const seq = parseInt(parts[2], 10);
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
          }
        }
      }
    });
    const nextSeq = maxSeq + 1;
    return `VIS-${yearMonth}-${String(nextSeq).padStart(4, '0')}`;
  }
  // ─── APPROVAL PATH CONFIG ──────────────────────────────────
  const APPROVAL_CONFIG_KEY = 'vps_approval_config';
  function getApprovalConfig() {
    const raw = localStorage.getItem(APPROVAL_CONFIG_KEY);
    return raw ? JSON.parse(raw) : { hodRequired: true, adminRequired: true };
  }
  function saveApprovalConfig(cfg) {
    localStorage.setItem(APPROVAL_CONFIG_KEY, JSON.stringify(cfg));
    syncConfigToCloud('approval', cfg);
  }
  function addRequest(visitorData, submittedBy) {
    const records = getAll();
    const appCfg = getApprovalConfig();
    let nextStatus = STATUS.PENDING_HOD;
    if (!appCfg.hodRequired) {
      nextStatus = appCfg.adminRequired ? STATUS.PENDING_ADMIN : STATUS.APPROVED;
    }
    const newRecord = {
      id: generateId(),
      ...visitorData,
      submittedBy: submittedBy.id,
      submittedByName: submittedBy.name,
      submittedByDept: submittedBy.department,
      submittedAt: new Date().toISOString(),
      status: nextStatus,
      hodApproval: null,
      adminApproval: null,
      qrData: null,
      scannedAt: null,
      entryGranted: null,
      inTime: null,
      outTime: null,
    };
    if (nextStatus === STATUS.APPROVED) {
      newRecord.qrData = buildQRData(newRecord);
    }
    records.unshift(newRecord);
    save(records);
    syncPassToCloud(newRecord);
    // Email Notifications triggers
    if (nextStatus === STATUS.PENDING_HOD) {
      sendEmailNotification('submitted', newRecord);
    } else if (nextStatus === STATUS.PENDING_ADMIN) {
      sendEmailNotification('hod_approved', newRecord);
    } else if (nextStatus === STATUS.APPROVED) {
      sendEmailNotification('approved', newRecord);
    }
    autoBackupPrompt();
    return newRecord;
  }
  function hodApprove(id, comment, approvedBy) {
    const records = getAll();
    const rec = records.find(r => r.id === id);
    if (!rec) return false;
    const appCfg = getApprovalConfig();
    const nextStatus = appCfg.adminRequired ? STATUS.PENDING_ADMIN : STATUS.APPROVED;
    rec.status = nextStatus;
    rec.hodApproval = {
      by: approvedBy.id,
      byName: approvedBy.name,
      at: new Date().toISOString(),
      comment: comment || '',
      action: 'approved',
    };
    if (nextStatus === STATUS.APPROVED) {
      rec.qrData = buildQRData(rec);
    }
    save(records);
    syncPassToCloud(rec);
    // Email Notifications triggers
    if (nextStatus === STATUS.PENDING_ADMIN) {
      sendEmailNotification('hod_approved', rec);
    } else if (nextStatus === STATUS.APPROVED) {
      sendEmailNotification('approved', rec);
    }
    autoBackupPrompt();
    return rec;
  }
  function hodReject(id, reason, rejectedBy) {
    const records = getAll();
    const rec = records.find(r => r.id === id);
    if (!rec) return false;
    rec.status = STATUS.REJECTED;
    rec.hodApproval = {
      by: rejectedBy.id,
      byName: rejectedBy.name,
      at: new Date().toISOString(),
      comment: reason || '',
      action: 'rejected',
    };
    save(records);
    syncPassToCloud(rec);
    sendEmailNotification('rejected', rec);
    autoBackupPrompt();
    return rec;
  }
  function adminApprove(id, notes, approvedBy) {
    const records = getAll();
    const rec = records.find(r => r.id === id);
    if (!rec) return false;
    rec.status = STATUS.APPROVED;
    rec.adminApproval = {
      by: approvedBy.id,
      byName: approvedBy.name,
      at: new Date().toISOString(),
      notes: notes || '',
      action: 'approved',
    };
    // Build QR data
    rec.qrData = buildQRData(rec);
    save(records);
    syncPassToCloud(rec);
    sendEmailNotification('approved', rec);
    autoBackupPrompt();
    return rec;
  }
  function adminReject(id, reason, rejectedBy) {
    const records = getAll();
    const rec = records.find(r => r.id === id);
    if (!rec) return false;
    rec.status = STATUS.REJECTED;
    rec.adminApproval = {
      by: rejectedBy.id,
      byName: rejectedBy.name,
      at: new Date().toISOString(),
      notes: reason || '',
      action: 'rejected',
    };
    save(records);
    syncPassToCloud(rec);
    sendEmailNotification('rejected', rec);
    autoBackupPrompt();
    return rec;
  }
  function buildQRData(rec) {
    return rec.id;
  }
  function recordCheckIn(id) {
    const records = getAll();
    const rec = records.find(r => r.id === id);
    if (!rec) return false;
    const now = new Date().toISOString();
    rec.inTime = now;
    rec.scannedAt = now;
    rec.entryGranted = true;
    save(records);
    syncPassToCloud(rec);
    autoBackupPrompt();
    return rec;
  }
  function recordCheckOut(id) {
    const records = getAll();
    const rec = records.find(r => r.id === id);
    if (!rec) return false;
    rec.outTime = new Date().toISOString();
    save(records);
    syncPassToCloud(rec);
    autoBackupPrompt();
    return rec;
  }
  function recordGateScan(id, granted) {
    const records = getAll();
    const rec = records.find(r => r.id === id);
    if (!rec) return false;
    const now = new Date().toISOString();
    rec.scannedAt = now;
    rec.entryGranted = granted;
    if (granted && !rec.inTime) {
      rec.inTime = now;
    }
    save(records);
    syncPassToCloud(rec);
    autoBackupPrompt();
    return rec;
  }
  function deleteRequest(id) {
    const records = getAll();
    const updated = records.filter(r => r.id !== id);
    save(updated);
    if (isFirebaseEnabled()) {
      const db = getFirestore();
      if (db) {
        db.collection('visitor_passes').doc(id).delete().catch(err => {
          console.error('Failed to delete request from cloud:', err);
        });
      }
    }
    autoBackupPrompt();
    return true;
  }
  function updateRequest(id, updates) {
    const records = getAll();
    const idx = records.findIndex(r => r.id === id);
    if (idx === -1) return false;
    records[idx] = {
      ...records[idx],
      ...updates,
      qrData: null
    };
    records[idx].qrData = buildQRData(records[idx]);
    save(records);
    syncPassToCloud(records[idx]);
    autoBackupPrompt();
    return records[idx];
  }
  function getById(id) {
    return getAll().find(r => r.id === id) || null;
  }
  function filter(opts = {}) {
    let records = getAll();
    if (opts.status) records = records.filter(r => r.status === opts.status);
    if (opts.department) records = records.filter(r => r.department === opts.department);
    if (opts.submittedBy) records = records.filter(r => r.submittedBy === opts.submittedBy);
    if (opts.dateFrom) records = records.filter(r => r.visitDate >= opts.dateFrom);
    if (opts.dateTo) records = records.filter(r => r.visitDate <= opts.dateTo);
    if (opts.search) {
      const q = opts.search.toLowerCase();
      records = records.filter(r =>
        r.visitorName?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q) ||
        r.visitorNIC?.toLowerCase().includes(q) ||
        r.hostName?.toLowerCase().includes(q) ||
        r.department?.toLowerCase().includes(q) ||
        r.purpose?.toLowerCase().includes(q)
      );
    }
    return records;
  }
  // ─── NOTIFICATIONS ────────────────────────────────────────
  function showNotification(message, type = 'info', duration = 3500) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const n = document.createElement('div');
    n.className = `notification ${type}`;
    n.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    document.body.appendChild(n);
    requestAnimationFrame(() => n.classList.add('show'));
    setTimeout(() => {
      n.classList.remove('show');
      setTimeout(() => n.remove(), 350);
    }, duration);
  }
  // ─── FORMATTERS ──────────────────────────────────────────
  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function formatDateTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
  function statusBadge(status) {
    const map = {
      [STATUS.PENDING_HOD]: `<span class="badge badge-pending">⏳ Pending HOD</span>`,
      [STATUS.PENDING_ADMIN]: `<span class="badge badge-hod">🔵 Pending Admin</span>`,
      [STATUS.APPROVED]: `<span class="badge badge-approved">✅ Approved</span>`,
      [STATUS.REJECTED]: `<span class="badge badge-rejected">❌ Rejected</span>`,
    };
    return map[status] || `<span class="badge">${status}</span>`;
  }
  function getPendingCountForRole(role) {
    const records = getAll();
    if (role === ROLES.HOD) return records.filter(r => r.status === STATUS.PENDING_HOD).length;
    if (role === ROLES.ADMIN) return records.filter(r => r.status === STATUS.PENDING_ADMIN).length;
    return 0;
  }
  // ─── EXCEL EXPORT ─────────────────────────────────────────
  function exportToExcel(records, filename = 'visitor_records') {
    if (typeof XLSX === 'undefined') {
      showNotification('Excel library not loaded', 'error');
      return;
    }
    const rows = records.map(r => ({
      'Pass ID': r.id,
      'Visitor Name': r.visitorName,
      'NIC': r.visitorNIC,
      'Phone': r.visitorPhone,
      'Company': r.company || '—',
      'Purpose': r.purpose,
      'Host Name': r.hostName,
      'Department': r.department,
      'Visit Date': r.visitDate,
      'Visit Time': r.visitTime,
      'Submitted By': r.submittedByName,
      'Submitted Dept': r.submittedByDept,
      'Submitted At': formatDateTime(r.submittedAt),
      'Status': r.status.replace(/_/g, ' ').toUpperCase(),
      'HOD Approval': r.hodApproval?.action || '—',
      'HOD Comment': r.hodApproval?.comment || '—',
      'HOD Approved By': r.hodApproval?.byName || '—',
      'Admin Approval': r.adminApproval?.action || '—',
      'Admin Notes': r.adminApproval?.notes || '—',
      'Admin Approved By': r.adminApproval?.byName || '—',
      'In Time (Entry)': formatDateTime(r.inTime),
      'Out Time (Exit)': formatDateTime(r.outTime),
      'Entry Scanned At': formatDateTime(r.scannedAt),
      'Entry Allowed': r.entryGranted === true ? 'Yes' : r.entryGranted === false ? 'No' : '—',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    // Style header row widths
    ws['!cols'] = Object.keys(rows[0] || {}).map(() => ({ wch: 20 }));
    XLSX.utils.book_append_sheet(wb, ws, 'Visitor Records');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showNotification('Excel file exported successfully!', 'success');
  }
  // ─── RENDER SIDEBAR ──────────────────────────────────────
  function renderSidebar(activeItem) {
    const user = getCurrentUser();
    if (!user) return;
    const pendingCount = getPendingCountForRole(user.role);
    const navByRole = {
      [ROLES.DIVISION]: [
        { icon: '🏠', label: 'Dashboard', href: 'division-user.html', id: 'dashboard' },
        { icon: '➕', label: 'New Visitor Request', href: '#new-request', id: 'new-request' },
        { icon: '📋', label: 'My Requests', href: '#my-requests', id: 'my-requests' },
        { icon: '🎫', label: 'Approved Passes', href: '#approved', id: 'approved' },
      ],
      [ROLES.HOD]: [
        { icon: '🏠', label: 'Dashboard', href: 'hod.html', id: 'dashboard' },
        { icon: '⏳', label: 'Pending Approval', href: '#pending', id: 'pending', badge: pendingCount },
        { icon: '✅', label: 'Approved', href: '#approved', id: 'approved' },
        { icon: '❌', label: 'Rejected', href: '#rejected', id: 'rejected' },
      ],
      [ROLES.ADMIN]: [
        { icon: '🏠', label: 'Dashboard', href: 'admin-director.html', id: 'dashboard' },
        { icon: '⏳', label: 'Pending Final Approval', href: '#pending', id: 'pending', badge: pendingCount },
        { icon: '✅', label: 'Approved Passes', href: '#approved', id: 'approved' },
        { icon: '📊', label: 'All Records', href: '#all', id: 'all' },
      ],
      [ROLES.ITADMIN]: [
        { icon: '👥', label: 'User Management', href: 'user-management.html', id: 'users' },
        { icon: '⚙️', label: 'Approval Settings', href: 'user-management.html#settings', id: 'approval-settings' },
        { icon: '✉️', label: 'Email Settings', href: 'user-management.html#email', id: 'email-settings' },
        { icon: '💾', label: 'Excel Backups', href: 'user-management.html#backup', id: 'backup-settings' },
        { icon: '🌐', label: 'Online Sync', href: 'user-management.html#cloud', id: 'cloud-settings' },
      ],
      [ROLES.SECURITY]: [
        { icon: '🏠', label: 'Dashboard', href: 'security.html', id: 'dashboard' },
        { icon: '📷', label: 'Scan QR Code', href: '#scan', id: 'scan' },
        { icon: '📋', label: 'Entry Log', href: '#log', id: 'log' },
      ],
    };
    const nav = navByRole[user.role] || [];
    const navHTML = nav.map(item => `
      <a class="nav-item ${activeItem === item.id ? 'active' : ''}" href="${item.href}" id="nav-${item.id}">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
        ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
      </a>
    `).join('');
    const roleLabels = {
      [ROLES.DIVISION]: 'Division User',
      [ROLES.HOD]: 'Head of Department',
      [ROLES.ADMIN]: 'Admin Director',
      [ROLES.ITADMIN]: 'IT Admin',
      [ROLES.SECURITY]: 'Security Officer',
    };
    const sidebarEl = document.getElementById('sidebar');
    if (!sidebarEl) return;
    sidebarEl.innerHTML = `
      <div class="sidebar-logo">
        <div class="logo-icon">🎫</div>
        <div>
          <h2>VisitorPass</h2>
          <span>Management System</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-label">Navigation</div>
        ${navHTML}
        <div class="nav-section-label" style="margin-top:auto">Reports</div>
        ${user.role !== ROLES.SECURITY ? `<a class="nav-item ${activeItem === 'reports' ? 'active' : ''}" href="reports.html" id="nav-reports"><span class="nav-icon">📊</span><span>Reports & Export</span></a>` : ''}
        ${(user.role === ROLES.ITADMIN) ? `<a class="nav-item ${activeItem === 'users' ? 'active' : ''}" href="user-management.html" id="nav-users"><span class="nav-icon">👥</span><span>User Management</span></a>` : ''}
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">${user.avatar}</div>
          <div class="user-details">
            <h4>${user.name}</h4>
            <span>${roleLabels[user.role] || user.role}</span>
          </div>
        </div>
        <div style="display:flex;gap:4px;margin-top:8px">
          <button class="btn btn-outline btn-sm" style="flex:1;font-size:10px;padding:4px;font-weight:500" onclick="openChangePasswordModal()">🔑 Password</button>
          <button class="btn btn-outline btn-sm btn-logout" style="flex:1;font-size:10px;padding:4px;margin-top:0;font-weight:500" onclick="VPS.logout()">🚪 Sign Out</button>
        </div>
      </div>
    `;

    // Initialize mobile responsive toggle button and overlay
    setupMobileSidebar(sidebarEl);
  }

  function setupMobileSidebar(sidebarEl) {
    const user = getCurrentUser();
    if (!user) return;

    const wrapper = document.querySelector('.app-wrapper') || document.body;

    // 1. Create blurred overlay backdrop if not present
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      wrapper.appendChild(overlay);
    }

    // 2. Create mobile header if not present
    let mobileHeader = document.querySelector('.mobile-header');
    if (!mobileHeader) {
      mobileHeader = document.createElement('div');
      mobileHeader.className = 'mobile-header';
      // Insert at the very top of the wrapper
      wrapper.insertBefore(mobileHeader, wrapper.firstChild);
    }

    // Render mobile header inner layout dynamically
    mobileHeader.innerHTML = `
      <button class="mobile-menu-btn" id="mobile-menu-trigger">☰</button>
      <div class="mobile-header-title">
        <span style="font-size: 18px;">🎫</span>
        <span style="font-weight: 800; background: linear-gradient(135deg, #f1f5f9, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">VisitorPass</span>
      </div>
      <div class="mobile-user-badge">${user.avatar || 'U'}</div>
    `;

    // 3. Clear and re-bind event listeners to avoid stale closure or duplicate trigger issues
    const menuTrigger = document.getElementById('mobile-menu-trigger');
    const newTrigger = menuTrigger.cloneNode(true);
    menuTrigger.parentNode.replaceChild(newTrigger, menuTrigger);

    const newOverlay = overlay.cloneNode(true);
    overlay.parentNode.replaceChild(newOverlay, overlay);

    newTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = sidebarEl.classList.toggle('open');
      newOverlay.classList.toggle('active', isOpen);
      newTrigger.innerHTML = isOpen ? '✕' : '☰';
    });

    newOverlay.addEventListener('click', () => {
      sidebarEl.classList.remove('open');
      newOverlay.classList.remove('active');
      newTrigger.innerHTML = '☰';
    });

    // Make sure we collapse sidebar on route transitions
    sidebarEl.classList.remove('open');
    newOverlay.classList.remove('active');
    newTrigger.innerHTML = '☰';
  }
  // ─── USER MANAGEMENT CRUD ──────────────────────────────────
  function getAllUsers() {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    // Safeguard: Ensure default admin/director accounts are always available as fallback
    DEFAULT_USERS.forEach(defUser => {
      if (!users.some(u => u.username === defUser.username)) {
        users.push(defUser);
      }
    });
    return users;
  }
  function getUserById(id) {
    return getAllUsers().find(u => u.id === id) || null;
  }
  function addUser(userData) {
    const users = getAllUsers();
    // Case-insensitive username uniqueness check
    const existing = users.find(u => u.username.toLowerCase() === userData.username.toLowerCase());
    if (existing) return { error: 'Username already exists' };
    const newUser = {
      id: 'u' + Date.now(),
      username: userData.username,
      password: userData.password,
      name: userData.name,
      role: userData.role,
      email: userData.email || '',
      department: userData.department || 'General',
      avatar: userData.name.charAt(0).toUpperCase(),
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    syncUserToCloud(newUser);
    return newUser;
  }
  function updateUser(id, updates) {
    const users = getAllUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    // Prevent duplicate usernames
    if (updates.username && users.find(u => u.username === updates.username && u.id !== id)) {
      return { error: 'Username already taken' };
    }
    users[idx] = { ...users[idx], ...updates, id };
    if (updates.name) users[idx].avatar = updates.name.charAt(0).toUpperCase();
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    syncUserToCloud(users[idx]);
    // Update session if editing current user
    const session = getCurrentUser();
    if (session && session.id === id) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(users[idx]));
    }
    return users[idx];
  }
  function deleteUser(id) {
    const session = getCurrentUser();
    if (session && session.id === id) return { error: 'Cannot delete your own account' };
    const users = getAllUsers().filter(u => u.id !== id);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    deleteUserFromCloud(id);
    return true;
  }
  // ─── EMAIL SETTINGS ───────────────────────────────────────
  const EMAIL_CONFIG_KEY = 'vps_email_config';
  const DEFAULT_EMAIL_CONFIG = {
    enabled: true,
    serviceId: 'service_lkya9ra',
    templateId: 'template_k6oujm2',
    publicKey: 'fJ8WCcMeuWqCh1xnl',
    hodEmail: '',
    adminEmail: ''
  };
  function getEmailConfig() {
    const raw = localStorage.getItem(EMAIL_CONFIG_KEY);
    if (!raw) return { ...DEFAULT_EMAIL_CONFIG };
    try {
      const parsed = JSON.parse(raw);
      // If older/invalid service ID was cached, override with current
      const sId = (parsed.serviceId && parsed.serviceId !== 'service_58xyyk2') ? parsed.serviceId : DEFAULT_EMAIL_CONFIG.serviceId;
      return {
        enabled: parsed.enabled !== undefined ? parsed.enabled : DEFAULT_EMAIL_CONFIG.enabled,
        serviceId: sId,
        templateId: parsed.templateId || DEFAULT_EMAIL_CONFIG.templateId,
        publicKey: parsed.publicKey || DEFAULT_EMAIL_CONFIG.publicKey,
        hodEmail: parsed.hodEmail || '',
        adminEmail: parsed.adminEmail || '',
        notifSubmit: parsed.notifSubmit !== undefined ? parsed.notifSubmit : true,
        notifHod: parsed.notifHod !== undefined ? parsed.notifHod : true,
        notifApproved: parsed.notifApproved !== undefined ? parsed.notifApproved : true,
        notifRejected: parsed.notifRejected !== undefined ? parsed.notifRejected : true
      };
    } catch (e) {
      return { ...DEFAULT_EMAIL_CONFIG };
    }
  }
  function saveEmailConfig(cfg) {
    localStorage.setItem(EMAIL_CONFIG_KEY, JSON.stringify(cfg));
    syncConfigToCloud('email', cfg);
  }
  async function sendEmailNotification(type, record) {
    const cfg = getEmailConfig();
    if (!cfg.enabled || !cfg.serviceId || !cfg.templateId || !cfg.publicKey) return;
    if (typeof emailjs === 'undefined') {
      console.warn('EmailJS library is not loaded on this page.');
      return;
    }

    // Check event toggles
    if (type === 'submitted' && cfg.notifSubmit === false) return;
    if (type === 'hod_approved' && cfg.notifHod === false) return;
    if (type === 'approved' && cfg.notifApproved === false) return;
    if (type === 'rejected' && cfg.notifRejected === false) return;

    const allUsers = getAllUsers();
    const currentOrigin = window.location.origin && window.location.origin !== 'null' 
      ? window.location.origin 
      : '';
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    const appBaseUrl = currentOrigin ? `${currentOrigin}${basePath}` : basePath;

    // Resolve Department HOD Email
    const deptHod = allUsers.find(u => 
      u.role === ROLES.HOD && 
      u.department && 
      u.department.toLowerCase() === (record.department || '').toLowerCase() && 
      u.email
    );
    // Fallback order: Specific HOD email -> configured hodEmail -> first admin email -> any HOD email
    const fallbackHod = allUsers.find(u => u.role === ROLES.HOD && u.email)?.email;
    const adminUser = allUsers.find(u => u.role === ROLES.ADMIN && u.email);
    const adminEmail = (adminUser && adminUser.email) ? adminUser.email : (cfg.adminEmail || 'visitorpassdbc@gmail.com');
    const adminName = (adminUser && adminUser.name) ? adminUser.name : 'Admin Director';

    const hodEmail = (deptHod && deptHod.email) 
      ? deptHod.email 
      : (cfg.hodEmail || fallbackHod || adminEmail || 'visitorpassdbc@gmail.com');
    const hodName = (deptHod && deptHod.name) ? deptHod.name : 'Head of Department';

    // Build group members text if present
    let groupText = '';
    if (record.groupMembers && record.groupMembers.length > 0) {
      groupText = '\n👥 Accompanying Visitors (' + record.groupMembers.length + '):\n' +
        record.groupMembers.map((m, i) => `  ${i + 1}. ${m.name} ${m.nic ? '(NIC: ' + m.nic + ')' : ''} ${m.phone ? '(Tel: ' + m.phone + ')' : ''}`).join('\n');
    }

    const hodApproveLink = `${appBaseUrl}/hod.html`;
    const adminApproveLink = `${appBaseUrl}/admin-director.html`;
    const verifyPassLink = `${appBaseUrl}/verify.html?scan=${record.id}`;

    const templates = {
      submitted: {
        to_email: hodEmail,
        to_name: hodName,
        subject: `[Approval Required] New Visitor Request — ${record.id} (${record.visitorName})`,
        message: 
`Dear ${hodName},

A new visitor pass request has been submitted for your department and is awaiting your approval.

📋 PASS DETAILS:
• Pass ID: ${record.id}
• Visitor Name: ${record.visitorName}
• NIC / Passport: ${record.visitorNIC || '—'}
• Phone: ${record.visitorPhone || '—'}
• Organization / Company: ${record.company || 'Individual'}
• Host Name: ${record.hostName}
• Department: ${record.department}
• Scheduled Date & Time: ${record.visitDate} at ${record.visitTime}
• Purpose of Visit: ${record.purpose || '—'}
• Special Notes / Clearance: ${record.notes || 'None'}
${groupText}

👤 REQUESTED BY:
• Submitted by: ${record.submittedByName} (${record.submittedByDept})
• Submitted At: ${formatDateTime(record.submittedAt)}

👉 ACTION REQUIRED:
Please login to the HOD Portal to review and approve or reject this request:
${hodApproveLink}

Thank you,
Visitor Pass Management System`,
      },

      hod_approved: {
        to_email: adminEmail,
        to_name: adminName,
        subject: `[Final Approval Required] Visitor Pass — ${record.id} (${record.visitorName})`,
        message: 
`Dear ${adminName},

A visitor pass request has been approved by the Head of Department and is now awaiting your final executive approval.

📋 PASS DETAILS:
• Pass ID: ${record.id}
• Visitor Name: ${record.visitorName}
• NIC: ${record.visitorNIC || '—'}
• Phone: ${record.visitorPhone || '—'}
• Company: ${record.company || 'Individual'}
• Host: ${record.hostName} (${record.department})
• Scheduled Date & Time: ${record.visitDate} at ${record.visitTime}
• Purpose: ${record.purpose || '—'}
${groupText}

✅ HOD APPROVAL:
• Approved by: ${record.hodApproval?.byName || 'HOD'}
• Date & Time: ${formatDateTime(record.hodApproval?.at)}
• HOD Notes/Comments: "${record.hodApproval?.comment || 'Recommended & Approved'}"

👉 ACTION REQUIRED:
Please login to the Director Portal to grant final approval and issue the QR Pass:
${adminApproveLink}

Thank you,
Visitor Pass Management System`,
      },

      approved: {
        to_email: getUserById(record.submittedBy)?.email || hodEmail || cfg.hodEmail || adminEmail,
        to_name: record.submittedByName,
        subject: `✅ Visitor Pass Approved — ${record.id} (${record.visitorName})`,
        message: 
`Dear ${record.submittedByName},

Your visitor pass request has been fully APPROVED.

📋 PASS DETAILS:
• Pass ID: ${record.id}
• Visitor Name: ${record.visitorName}
• Date & Time: ${record.visitDate} at ${record.visitTime}
• Approved By: ${record.adminApproval?.byName || record.hodApproval?.byName || 'Management'}
• Verification Link: ${verifyPassLink}

The digital QR Pass is ready. You may now share or print the pass for your visitor.

Thank you,
Visitor Pass Management System`,
      },

      rejected: {
        to_email: getUserById(record.submittedBy)?.email || hodEmail || cfg.hodEmail || adminEmail,
        to_name: record.submittedByName,
        subject: `❌ Visitor Request Rejected — ${record.id} (${record.visitorName})`,
        message: 
`Dear ${record.submittedByName},

Your visitor request (${record.id}) has been REJECTED.

• Visitor Name: ${record.visitorName}
• Rejected By: ${record.adminApproval?.action === 'rejected' ? (record.adminApproval?.byName || 'Director') : (record.hodApproval?.byName || 'HOD')}
• Reason: "${record.adminApproval?.notes || record.hodApproval?.comment || 'Not specified'}"

Please login to make corrections and resubmit if necessary.

Thank you,
Visitor Pass Management System`,
      },
    };

    const tpl = templates[type];
    if (!tpl || !tpl.to_email) {
      console.warn(`No recipient email address found for notification type: ${type}`);
      return;
    }

    try {
      emailjs.init(cfg.publicKey);
      await emailjs.send(cfg.serviceId, cfg.templateId, {
        to_email: tpl.to_email,
        email: tpl.to_email,
        recipient: tpl.to_email,
        user_email: tpl.to_email,
        to_name: tpl.to_name,
        name: tpl.to_name,
        subject: tpl.subject,
        message: tpl.message,
        pass_id: record.id,
      });
      console.log(`Email sent successfully to ${tpl.to_email} (${type})`);
      showNotification(`📧 Email notification sent to ${tpl.to_name} (${tpl.to_email})`, 'success', 3500);
    } catch (err) {
      console.error('EmailJS error:', err);
      showNotification(`⚠️ Email dispatch failed: ${err.text || err.message || 'Check EmailJS config'}`, 'warning', 4000);
    }
  }
  // ─── AUTO EXCEL BACKUP TRIGGER ────────────────────────────
  function autoBackupPrompt() {
    const cfg = getEmailConfig();
    if (!cfg.autoBackup) return;
    setTimeout(() => {
      const records = getAll();
      exportToExcel(records, 'auto_backup');
    }, 800);
  }
  // ─── QR GENERATOR ─────────────────────────────────────────
  function generateQR(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (typeof QRCode === 'undefined') {
      container.innerHTML = `<p style="color:#64748b;font-size:12px">QR lib loading...</p>`;
      return;
    }
    new QRCode(container, {
      text: data,
      width: 200,
      height: 200,
      colorDark: '#1a1a2e',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H,
    });
  }
  // ─── PASSWORD CHANGE MODAL (DYNAMIC INJECTION) ────────────
  function changePassword(userId, currentPassword, newPassword) {
    const users = getAllUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { error: 'User not found' };
    
    if (users[idx].password !== currentPassword) {
      return { error: 'Incorrect current password' };
    }
    
    users[idx].password = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    syncUserToCloud(users[idx]);
    
    const session = getCurrentUser();
    if (session && session.id === userId) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(users[idx]));
    }
    return true;
  }
  function openChangePasswordModal() {
    let modal = document.getElementById('vps-change-password-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'vps-change-password-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal" style="max-width:400px">
          <div class="modal-header">
            <h2 class="modal-title">🔑 Change Account Password</h2>
            <button class="modal-close" onclick="document.getElementById('vps-change-password-modal').classList.remove('active')">✕</button>
          </div>
          <form id="vps-change-password-form">
            <div class="form-group" style="margin-bottom:12px">
              <label class="form-label">Current Password *</label>
              <input type="password" class="form-control" id="vps-pwd-curr" required />
            </div>
            <div class="form-group" style="margin-bottom:12px">
              <label class="form-label">New Password *</label>
              <input type="password" class="form-control" id="vps-pwd-new" required />
            </div>
            <div class="form-group" style="margin-bottom:16px">
              <label class="form-label">Confirm New Password *</label>
              <input type="password" class="form-control" id="vps-pwd-conf" required />
            </div>
            <div style="display:flex;gap:12px;justify-content:flex-end">
              <button type="button" class="btn btn-outline" onclick="document.getElementById('vps-change-password-modal').classList.remove('active')">Cancel</button>
              <button type="submit" class="btn btn-primary">Update Password</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
      modal.addEventListener('click', e => {
        if (e.target === modal) modal.classList.remove('active');
      });
      const form = document.getElementById('vps-change-password-form');
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const curr = document.getElementById('vps-pwd-curr').value;
        const newP = document.getElementById('vps-pwd-new').value;
        const conf = document.getElementById('vps-pwd-conf').value;
        
        if (newP !== conf) {
          showNotification('New passwords do not match!', 'error');
          return;
        }
        const user = getCurrentUser();
        if (!user) return;
        const res = changePassword(user.id, curr, newP);
        if (res === true) {
          showNotification('Password updated successfully!', 'success');
          modal.classList.remove('active');
          form.reset();
        } else {
          showNotification(res.error || 'Failed to update password', 'error');
        }
      });
    }
    document.getElementById('vps-pwd-curr').value = '';
    document.getElementById('vps-pwd-new').value = '';
    document.getElementById('vps-pwd-conf').value = '';
    modal.classList.add('active');
  }
  // Bind password change modal globally
  window.openChangePasswordModal = openChangePasswordModal;
  // ─── CLOUD DATABASE SYNC (FIREBASE) ─────────────────────────
  // Paste your Firebase Config below to share one database across all users/devices online:
  const GLOBAL_FIREBASE_CONFIG = {
    enabled: true, // Set to true to activate this config for all users/devices
    apiKey: "AIzaSyBDZ4_uJePzKnj9ARAnTZhQij-5EFAkNzo",
    authDomain: "visitor-pass-system-7abd7.firebaseapp.com",
    projectId: "visitor-pass-system-7abd7",
    storageBucket: "visitor-pass-system-7abd7.firebasestorage.app",
    messagingSenderId: "540329595407",
    appId: "1:540329595407:web:e358bef86f9c6018b4c97a"
  };

  const FIREBASE_CONFIG_KEY = 'vps_firebase_config';
  let dbInstance = null;
  let isSyncingActive = false;
  function getFirebaseConfig() {
    // Priority 1: Use hardcoded global configuration if enabled
    if (GLOBAL_FIREBASE_CONFIG && GLOBAL_FIREBASE_CONFIG.enabled) {
      return GLOBAL_FIREBASE_CONFIG;
    }
    // Priority 2: Fallback to browser's localStorage configuration
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
    return raw ? JSON.parse(raw) : {
      enabled: false,
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    };
  }
  function saveFirebaseConfig(cfg) {
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(cfg));
  }
  function isFirebaseEnabled() {
    const cfg = getFirebaseConfig();
    return cfg.enabled && typeof firebase !== 'undefined';
  }
  function getFirestore() {
    if (!isFirebaseEnabled()) return null;
    if (dbInstance) return dbInstance;
    try {
      const cfg = getFirebaseConfig();
      const firebaseConfig = {
        apiKey: cfg.apiKey,
        authDomain: cfg.authDomain,
        projectId: cfg.projectId,
        storageBucket: cfg.storageBucket,
        messagingSenderId: cfg.messagingSenderId,
        appId: cfg.appId
      };
      if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
      }
      dbInstance = firebase.firestore();
      return dbInstance;
    } catch (err) {
      console.error('Firebase initialization failed:', err);
      return null;
    }
  }
  function initFirebaseSync() {
    const db = getFirestore();
    if (!db) return;
    if (isSyncingActive) return;
    isSyncingActive = true;
    console.log('Firebase Sync Active: Hooking up Firestore listeners');
    // 1. Listen to users
    db.collection('users').onSnapshot(snapshot => {
      const users = [];
      snapshot.forEach(doc => users.push(doc.data()));
      if (snapshot.empty || users.length === 0) {
        // Auto-populate default users in Firebase if database is empty
        console.log('Firebase database empty. Auto-populating default users...');
        DEFAULT_USERS.forEach(u => {
          db.collection('users').doc(u.id).set(u).catch(err => console.warn('Auto-populate user failed:', err));
        });
      } else {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        const current = getCurrentUser();
        if (current) {
          const updated = users.find(u => u.id === current.id);
          if (updated) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
          }
        }
      }
      window.dispatchEvent(new CustomEvent('vps-data-updated'));
    }, err => {
      console.warn('Firestore users subscribe error:', err);
      window.dispatchEvent(new CustomEvent('vps-sync-error', { detail: err }));
    });
    // 2. Listen to visitor passes
    db.collection('visitor_passes').onSnapshot(snapshot => {
      const passes = [];
      snapshot.forEach(doc => passes.push(doc.data()));
      passes.sort((a, b) => b.id.localeCompare(a.id));
      if (passes.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(passes));
      }
      window.dispatchEvent(new CustomEvent('vps-data-updated'));
    }, err => console.warn('Firestore passes subscribe error:', err));
    // 3. Listen to config
    db.collection('config').doc('approval').onSnapshot(doc => {
      if (doc.exists) {
        localStorage.setItem(APPROVAL_CONFIG_KEY, JSON.stringify(doc.data()));
      } else {
        // Auto-populate default approval config in Firebase
        const defaultApproval = { hodRequired: true, adminRequired: true };
        db.collection('config').doc('approval').set(defaultApproval).catch(err => console.warn('Auto-populate config error:', err));
      }
      window.dispatchEvent(new CustomEvent('vps-data-updated'));
    }, err => console.warn('Firestore approval config subscribe error:', err));
    db.collection('config').doc('email').onSnapshot(doc => {
      if (doc.exists) {
        localStorage.setItem(EMAIL_CONFIG_KEY, JSON.stringify(doc.data()));
      } else {
        // Auto-populate default email config in Firebase
        const defaultEmail = { enabled: false, serviceId: '', templateId: '', publicKey: '', hodEmail: '', adminEmail: '' };
        db.collection('config').doc('email').set(defaultEmail).catch(err => console.warn('Auto-populate email error:', err));
      }
      window.dispatchEvent(new CustomEvent('vps-data-updated'));
    }, err => console.warn('Firestore email config subscribe error:', err));
  }
  function syncPassToCloud(record) {
    if (!isFirebaseEnabled()) return;
    const db = getFirestore();
    if (!db) return;
    db.collection('visitor_passes').doc(record.id).set(record).catch(err => {
      console.warn('Error syncing pass to cloud:', err);
    });
  }
  function syncUserToCloud(user) {
    if (!isFirebaseEnabled()) return;
    const db = getFirestore();
    if (!db) return;
    db.collection('users').doc(user.id).set(user).catch(err => {
      console.warn('Error syncing user to cloud:', err);
    });
  }
  function deleteUserFromCloud(id) {
    if (!isFirebaseEnabled()) return;
    const db = getFirestore();
    if (!db) return;
    db.collection('users').doc(id).delete().catch(err => {
      console.warn('Error deleting user from cloud:', err);
    });
  }
  function syncConfigToCloud(type, cfg) {
    if (!isFirebaseEnabled()) return;
    const db = getFirestore();
    if (!db) return;
    db.collection('config').doc(type).set(cfg).catch(err => {
      console.warn('Error syncing config to cloud:', err);
    });
  }
  async function pushLocalDataToCloud() {
    if (!isFirebaseEnabled()) return { error: 'Firebase is not enabled' };
    const db = getFirestore();
    if (!db) return { error: 'Firebase not initialized' };
    try {
      showNotification('Cloud Sync: Uploading users...', 'info', 1500);
      const users = getAllUsers();
      for (const u of users) {
        await db.collection('users').doc(u.id).set(u);
      }
      showNotification('Cloud Sync: Uploading passes...', 'info', 1500);
      const records = getAll();
      for (const r of records) {
        await db.collection('visitor_passes').doc(r.id).set(r);
      }
      showNotification('Cloud Sync: Uploading configuration...', 'info', 1500);
      const appCfg = getApprovalConfig();
      await db.collection('config').doc('approval').set(appCfg);
      const emailCfg = getEmailConfig();
      await db.collection('config').doc('email').set(emailCfg);
      showNotification('Cloud Sync: Upload completed successfully!', 'success');
      return true;
    } catch (err) {
      console.error('Push data error:', err);
      return { error: err.message };
    }
  }
  async function pullCloudDataToLocal() {
    if (!isFirebaseEnabled()) return { error: 'Firebase is not enabled' };
    const db = getFirestore();
    if (!db) return { error: 'Firebase not initialized' };
    try {
      showNotification('Cloud Sync: Fetching data...', 'info', 1500);
      
      const usersSnap = await db.collection('users').get();
      const users = [];
      usersSnap.forEach(doc => users.push(doc.data()));
      if (users.length > 0) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
      const passesSnap = await db.collection('visitor_passes').get();
      const passes = [];
      passesSnap.forEach(doc => passes.push(doc.data()));
      passes.sort((a, b) => b.id.localeCompare(a.id));
      if (passes.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(passes));
      }
      const appCfgSnap = await db.collection('config').doc('approval').get();
      if (appCfgSnap.exists) {
        localStorage.setItem(APPROVAL_CONFIG_KEY, JSON.stringify(appCfgSnap.data()));
      }
      const emailCfgSnap = await db.collection('config').doc('email').get();
      if (emailCfgSnap.exists) {
        localStorage.setItem(EMAIL_CONFIG_KEY, JSON.stringify(emailCfgSnap.data()));
      }
      showNotification('Cloud Sync: Download completed successfully!', 'success');
      window.dispatchEvent(new CustomEvent('vps-data-updated'));
      return true;
    } catch (err) {
      console.error('Pull data error:', err);
      return { error: err.message };
    }
  }
  async function syncWithBackend() {
    try {
      const token = localStorage.getItem('vps_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch('/api/requests', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data && data.records && Array.isArray(data.records)) {
          const localRecords = getAll();
          const map = new Map();
          // First add local records
          localRecords.forEach(r => map.set(r.id, r));
          // Then overwrite/add backend records
          data.records.forEach(r => map.set(r.id, r));
          const merged = Array.from(map.values());
          merged.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
          save(merged);
          return merged;
        }
      }
    } catch (err) {
      // Backend not running or offline, proceed with local
    }
    return getAll();
  }
  // ─── PUBLIC API ───────────────────────────────────────────
  return {
    STATUS, ROLES, DIVISIONS,
    init, login, loginWithCloud, logout, getCurrentUser, requireAuth,
    getAll, getById, filter, syncWithBackend,
    addRequest, deleteRequest, updateRequest, hodApprove, hodReject, adminApprove, adminReject, recordGateScan,
    showNotification, formatDate, formatDateTime, statusBadge,
    getPendingCountForRole, exportToExcel, renderSidebar, generateQR,
    // User management
    getAllUsers, getUserById, addUser, updateUser, deleteUser,
    // Email
    getEmailConfig, saveEmailConfig, sendEmailNotification,
    // Auto backup
    autoBackupPrompt,
    // Approval path
    getApprovalConfig, saveApprovalConfig,
    // Check-in Out
    recordCheckIn, recordCheckOut,
    // Password change
    changePassword,
    // Firebase Cloud Sync
    getFirebaseConfig, saveFirebaseConfig, isFirebaseEnabled, initFirebaseSync,
    pushLocalDataToCloud, pullCloudDataToLocal,
  };
}
)();
// Auto-init
VPS.init();
