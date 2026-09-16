// ====================================================================
// SECURE VISITOR PASS MANAGEMENT SYSTEM - BACKEND REST API SERVER
// Node.js + Express + Atomic JSON DB + bcrypt + JWT
// ====================================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dbLayer = require('./database');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'vps_jwt_secret_fallback_key_2026';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from project directory
app.use(express.static(__dirname));

// Route "/" defaults to the Public Password-Free Request Portal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'request.html'));
});

// ─── AUTH MIDDLEWARE ───────────────────────────────────────────
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired session token' });
    req.user = user;
    next();
  });
}

function requireRoles(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    }
    next();
  };
}

// ─── 1. PUBLIC PASS SUBMISSION (NO PASSWORD REQUIRED) ──────────
app.post('/api/requests', (req, res) => {
  try {
    const { visitorData, requester } = req.body;
    if (!visitorData || !visitorData.visitorName || !visitorData.visitorNIC) {
      return res.status(400).json({ error: 'Visitor name and NIC are required.' });
    }

    const passId = dbLayer.generatePassId();
    const nowIso = new Date().toISOString();

    const record = {
      id: passId,
      visitorName: visitorData.visitorName,
      visitorNIC: visitorData.visitorNIC,
      visitorPhone: visitorData.visitorPhone || '—',
      company: visitorData.company || 'Individual',
      hostName: visitorData.hostName || '—',
      department: visitorData.department || requester?.department || 'General',
      visitDate: visitorData.visitDate || nowIso.split('T')[0],
      visitTime: visitorData.visitTime || '09:00',
      purpose: visitorData.purpose || 'Official Visit',
      notes: visitorData.notes || '',
      groupMembers: visitorData.groupMembers || [],
      submittedBy: requester?.id || 'public_web',
      submittedByName: requester?.name || 'Staff Member',
      submittedByDept: requester?.department || visitorData.department || 'General',
      submittedAt: nowIso,
      status: 'pending_hod',
      hodApproval: null,
      adminApproval: null,
      qrData: null,
      scannedAt: null,
      entryGranted: null,
      inTime: null,
      outTime: null
    };

    dbLayer.addPass(record);
    res.status(201).json({ success: true, record });
  } catch (err) {
    console.error('Error submitting public request:', err);
    res.status(500).json({ error: 'Failed to submit visitor request' });
  }
});

// ─── 2. AUTHENTICATION & LOGIN (FOR HOD, ADMIN, SECURITY) ───────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = dbLayer.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department,
      email: user.email,
      avatar: user.avatar
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: tokenPayload });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// ─── 3. GET PASSES (SYNC & ROLE-FILTERED) ──────────────────────
app.get('/api/requests', (req, res) => {
  try {
    let records = dbLayer.getAllPasses();

    // Check optional auth header if present
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role === 'hod' && decoded.department && decoded.department !== 'All' && !req.query.all) {
          records = records.filter(r => 
            (r.department || '').trim().toLowerCase() === decoded.department.trim().toLowerCase() ||
            (r.department || '').toLowerCase().includes(decoded.department.toLowerCase()) ||
            decoded.department.toLowerCase().includes((r.department || '').toLowerCase())
          );
        }
      } catch(e) {}
    } else if (req.query.department && req.query.department !== 'All') {
      records = records.filter(r => (r.department || '').trim().toLowerCase() === req.query.department.trim().toLowerCase());
    }

    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch visitor passes' });
  }
});

// ─── 4. PUBLIC VERIFICATION ENDPOINT (FOR GATE / QR SCAN) ──────
app.get('/api/requests/:id', (req, res) => {
  try {
    const r = dbLayer.getPassById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Pass not found' });
    res.json({ success: true, record: r });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pass' });
  }
});

// ─── 5. APPROVAL ENDPOINT (HOD & ADMIN) ────────────────────────
app.post('/api/requests/:id/approve', authenticateToken, requireRoles(['hod', 'admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { comment, notes } = req.body;
    const rec = dbLayer.getPassById(id);
    if (!rec) return res.status(404).json({ error: 'Pass not found' });

    const nowIso = new Date().toISOString();

    if (req.user.role === 'hod') {
      const updated = dbLayer.updatePass(id, {
        status: 'pending_admin',
        hodApproval: {
          by: req.user.id,
          byName: req.user.name,
          at: nowIso,
          comment: comment || 'Recommended for approval',
          action: 'approved'
        }
      });
      return res.json({ success: true, message: 'HOD approval recorded', record: updated });
    }

    if (req.user.role === 'admin') {
      const updated = dbLayer.updatePass(id, {
        status: 'approved',
        adminApproval: {
          by: req.user.id,
          byName: req.user.name,
          at: nowIso,
          notes: notes || 'Approved',
          action: 'approved'
        },
        qrData: id
      });
      return res.json({ success: true, message: 'Final approval granted, QR pass issued', record: updated });
    }
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ error: 'Failed to process approval' });
  }
});

// ─── 6. REJECTION ENDPOINT ─────────────────────────────────────
app.post('/api/requests/:id/reject', authenticateToken, requireRoles(['hod', 'admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const nowIso = new Date().toISOString();

    let updates = { status: 'rejected' };
    if (req.user.role === 'hod') {
      updates.hodApproval = {
        by: req.user.id,
        byName: req.user.name,
        at: nowIso,
        comment: reason || 'Rejected by HOD',
        action: 'rejected'
      };
    } else {
      updates.adminApproval = {
        by: req.user.id,
        byName: req.user.name,
        at: nowIso,
        notes: reason || 'Rejected by Director',
        action: 'rejected'
      };
    }

    const updated = dbLayer.updatePass(id, updates);
    res.json({ success: true, message: 'Request rejected', record: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

// ─── 7. GATE SCAN & CHECK-IN/OUT (SECURITY) ────────────────────
app.post('/api/requests/:id/scan', authenticateToken, requireRoles(['security', 'admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { granted } = req.body;
    const nowIso = new Date().toISOString();
    const rec = dbLayer.getPassById(id);
    if (!rec) return res.status(404).json({ error: 'Pass not found' });

    const updated = dbLayer.updatePass(id, {
      scannedAt: nowIso,
      entryGranted: !!granted,
      inTime: rec.inTime || (granted ? nowIso : null)
    });

    res.json({ success: true, message: 'Gate scan recorded', record: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record scan' });
  }
});

app.post('/api/requests/:id/checkout', authenticateToken, requireRoles(['security', 'admin']), (req, res) => {
  try {
    const { id } = req.params;
    const nowIso = new Date().toISOString();
    const updated = dbLayer.updatePass(id, { outTime: nowIso });
    res.json({ success: true, message: 'Visitor checked out', record: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check out' });
  }
});

// ─── 8. USER MANAGEMENT (IT ADMIN ONLY) ────────────────────────
app.get('/api/users', authenticateToken, requireRoles(['itadmin']), (req, res) => {
  try {
    const users = dbLayer.getAllUsers().map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      department: u.department,
      email: u.email,
      avatar: u.avatar
    }));
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', authenticateToken, requireRoles(['itadmin']), async (req, res) => {
  try {
    const { username, password, name, role, department, email } = req.body;
    if (!username || !password || !name || !role) {
      return res.status(400).json({ error: 'Missing required user fields' });
    }

    const existing = dbLayer.getUserByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'u_' + Date.now();
    const avatar = name.charAt(0).toUpperCase();

    const newUser = {
      id: userId,
      username: username.trim(),
      password_hash: hashedPassword,
      name,
      role,
      department: department || 'General',
      email: email || '',
      avatar
    };

    dbLayer.addUser(newUser);
    res.status(201).json({ success: true, message: 'User created successfully', userId });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.delete('/api/users/:id', authenticateToken, requireRoles(['itadmin']), (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    dbLayer.deleteUser(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ─── START SERVER & INITIALIZE DATABASE ────────────────────────
async function startServer() {
  try {
    await dbLayer.initDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log('====================================================');
      console.log(`🚀 Secure Visitor Pass System Server running!`);
      console.log(`👉 Local URL: http://localhost:${PORT}`);
      console.log(`👉 Public Portal: http://localhost:${PORT}/request.html`);
      console.log(`👉 Database: Atomic Encrypted JSON (data/visitor_system.json)`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('Fatal server startup error:', err);
    process.exit(1);
  }
}

startServer();
