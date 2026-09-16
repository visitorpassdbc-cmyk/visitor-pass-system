process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const SERVICE_ACCOUNT_PATH = 'C:/Users/Admin/Downloads/corporate-visitor-pass-firebase-adminsdk-fbsvc-cb7b7b0282.json';
const SITE_ID = 'corporate-visitor-pass';
const PROJECT_DIR = 'C:/.gemini/antigravity/scratch/visitor-pass-system';
const { GoogleAuth } = require(path.join(PROJECT_DIR, 'node_modules/google-auth-library'));

async function getAccessToken() {
  const auth = new GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase']
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token;
}

function getAllFiles(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const relPath = '/' + path.relative(baseDir, filePath).replace(/\\/g, '/');

    // Skip unwanted files
    if (file.startsWith('.') || 
        file === 'node_modules' || 
        file.endsWith('.exe') || 
        file.endsWith('.zip') || 
        file.endsWith('.bat') || 
        file.endsWith('.ps1') || 
        file.endsWith('.db') ||
        file === 'server.js' ||
        file === 'database.js' ||
        file === 'package.json' ||
        file === 'package-lock.json') {
      continue;
    }

    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, baseDir));
    } else {
      results.push({ fullPath: filePath, relPath });
    }
  }
  return results;
}

async function deploy() {
  console.log('1. Getting access token...');
  const token = await getAccessToken();

  console.log('2. Preparing files...');
  const files = getAllFiles(PROJECT_DIR);
  console.log(`Found ${files.length} static files to deploy.`);

  const fileMap = {}; // relPath -> { hash, gzipped }
  const filesPayload = {}; // relPath -> hash

  for (const f of files) {
    const content = fs.readFileSync(f.fullPath);
    const gzipped = zlib.gzipSync(content);
    const hash = crypto.createHash('sha256').update(gzipped).digest('hex');
    fileMap[hash] = { gzipped, relPath: f.relPath };
    filesPayload[f.relPath] = hash;
  }

  console.log('3. Creating new version on Firebase Hosting...');
  const createRes = await fetch(`https://firebasehosting.googleapis.com/v1beta1/sites/${SITE_ID}/versions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
  const versionData = await createRes.json();
  if (!createRes.ok) {
    throw new Error(`Create version failed: ${JSON.stringify(versionData)}`);
  }
  const versionName = versionData.name;
  console.log(`Version created: ${versionName}`);

  console.log('4. Populating files to find upload requirements...');
  const popRes = await fetch(`https://firebasehosting.googleapis.com/v1beta1/${versionName}:populateFiles`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ files: filesPayload })
  });
  const popData = await popRes.json();
  if (!popRes.ok) {
    throw new Error(`Populate files failed: ${JSON.stringify(popData)}`);
  }

  const uploadUrl = popData.uploadUrl;
  const uploadRequiredHashes = popData.uploadRequiredHashes || [];
  console.log(`Upload required for ${uploadRequiredHashes.length} files.`);

  for (let i = 0; i < uploadRequiredHashes.length; i++) {
    const hash = uploadRequiredHashes[i];
    const fileInfo = fileMap[hash];
    console.log(`[${i + 1}/${uploadRequiredHashes.length}] Uploading ${fileInfo.relPath}...`);

    const upRes = await fetch(`${uploadUrl}/${hash}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream'
      },
      body: fileInfo.gzipped
    });
    if (!upRes.ok) {
      const errText = await upRes.text();
      throw new Error(`Upload failed for ${fileInfo.relPath}: ${errText}`);
    }
  }

  console.log('5. Finalizing version...');
  const finRes = await fetch(`https://firebasehosting.googleapis.com/v1beta1/${versionName}?update_mask=status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'FINALIZED' })
  });
  const finData = await finRes.json();
  if (!finRes.ok) {
    throw new Error(`Finalize version failed: ${JSON.stringify(finData)}`);
  }
  console.log('Version finalized successfully.');

  console.log('6. Releasing version live...');
  const relRes = await fetch(`https://firebasehosting.googleapis.com/v1beta1/sites/${SITE_ID}/releases?versionName=${encodeURIComponent(versionName)}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const relData = await relRes.json();
  if (!relRes.ok) {
    throw new Error(`Release failed: ${JSON.stringify(relData)}`);
  }

  console.log('✅ Deployment complete! Live site: https://' + SITE_ID + '.web.app');
}

deploy().catch(err => {
  console.error('❌ Deployment error:', err);
  process.exit(1);
});
