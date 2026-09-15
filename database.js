// ====================================================================
// SECURE EMBEDDED LOCAL DATABASE LAYER
// Atomic JSON Storage with bcrypt password hashing
// No external database engine or native C++ compilers required.
// ====================================================================
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'visitor_system.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbCache = {
  users: [],
  visitor_passes: [],
  config: {
    approval: { hodRequired: true, adminRequired: true },
    email: { enabled: false, serviceId: '', templateId: '', publicKey: '', hodEmail: '', adminEmail: '' }
  }
};

function loadDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      dbCache = JSON.parse(content);
    } catch (err) {
      console.error('Failed to parse database file, initializing fresh:', err);
    }
  }
}

function saveDatabase() {
  try {
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(dbCache, null, 2), 'utf8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

async function initDatabase() {
  loadDatabase();

  // Seed default approver accounts if users list is empty
  if (!dbCache.users || dbCache.users.length === 0) {
    console.log('Seeding default secure approver accounts with bcrypt hashes...');
    const hashedPwd = await bcrypt.hash('admin123', 10);
    const hashedHodPwd = await bcrypt.hash('hod123', 10);

    dbCache.users = [
      {
        id: 'u_director',
        username: 'director',
        password_hash: hashedPwd,
        name: 'Director Fernando',
        role: 'admin',
        department: 'All',
        email: 'director@company.com',
        avatar: 'D'
      },
      {
        id: 'u_itadmin',
        username: 'itadmin',
        password_hash: hashedPwd,
        name: 'IT Admin',
        role: 'itadmin',
        department: 'IT',
        email: 'itadmin@company.com',
        avatar: 'I'
      },
      {
        id: 'u_hod_it',
        username: 'hod_it',
        password_hash: hashedHodPwd,
        name: 'HOD IT (Mr. Silva)',
        role: 'hod',
        department: 'IT',
        email: 'hod_it@company.com',
        avatar: 'H'
      },
      {
        id: 'u_hod_hr',
        username: 'hod_hr',
        password_hash: hashedHodPwd,
        name: 'HOD HR (Mrs. Perera)',
        role: 'hod',
        department: 'HR',
        email: 'hod_hr@company.com',
        avatar: 'H'
      },
      {
        id: 'u_security',
        username: 'security',
        password_hash: hashedPwd,
        name: 'Security Officer',
        role: 'security',
        department: 'Security',
        email: 'security@company.com',
        avatar: 'S'
      }
    ];

    saveDatabase();
    console.log('Default accounts initialized successfully with bcrypt.');
  }
}

// ─── USER OPERATIONS ───────────────────────────────────────────
function getAllUsers() {
  return dbCache.users || [];
}

function getUserByUsername(username) {
  if (!username) return null;
  return (dbCache.users || []).find(u => u.username.toLowerCase() === username.toLowerCase().trim());
}

function getUserById(id) {
  return (dbCache.users || []).find(u => u.id === id);
}

function addUser(userData) {
  dbCache.users = dbCache.users || [];
  dbCache.users.push(userData);
  saveDatabase();
  return userData;
}

function deleteUser(id) {
  dbCache.users = (dbCache.users || []).filter(u => u.id !== id);
  saveDatabase();
  return true;
}

// ─── PASS OPERATIONS ───────────────────────────────────────────
function getAllPasses() {
  return dbCache.visitor_passes || [];
}

function getPassById(id) {
  return (dbCache.visitor_passes || []).find(p => p.id === id);
}

function addPass(passRecord) {
  dbCache.visitor_passes = dbCache.visitor_passes || [];
  dbCache.visitor_passes.unshift(passRecord);
  saveDatabase();
  return passRecord;
}

function updatePass(id, updates) {
  const idx = (dbCache.visitor_passes || []).findIndex(p => p.id === id);
  if (idx === -1) return null;
  dbCache.visitor_passes[idx] = { ...dbCache.visitor_passes[idx], ...updates };
  saveDatabase();
  return dbCache.visitor_passes[idx];
}

function generatePassId() {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prefix = `VIS-${yearMonth}-`;

  let maxSeq = 0;
  (dbCache.visitor_passes || []).forEach(p => {
    if (p.id && p.id.startsWith(prefix)) {
      const parts = p.id.split('-');
      if (parts.length === 3) {
        const seq = parseInt(parts[2], 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }
  });

  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}

// ─── CONFIG OPERATIONS ─────────────────────────────────────────
function getConfig(key) {
  dbCache.config = dbCache.config || {};
  return dbCache.config[key] || null;
}

function saveConfig(key, value) {
  dbCache.config = dbCache.config || {};
  dbCache.config[key] = value;
  saveDatabase();
  return value;
}

module.exports = {
  initDatabase,
  getAllUsers,
  getUserByUsername,
  getUserById,
  addUser,
  deleteUser,
  getAllPasses,
  getPassById,
  addPass,
  updatePass,
  generatePassId,
  getConfig,
  saveConfig
};
