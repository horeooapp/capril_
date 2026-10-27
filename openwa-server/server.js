const express = require('express');
const { create, ev } = require('@open-wa/wa-automate');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8085;
const AUTH_KEY = process.env.AUTH_KEY || process.env.WA_API_KEY || 'qapril_wa_secret_2026';
const SESSION_PATH = process.env.SESSION_PATH || '/app/session';
// Wrapper Chrome qui injecte --no-sandbox sans passer par chromiumArgs
const CHROME_WRAPPER = process.env.CHROME_WRAPPER || '/usr/local/bin/chrome-wrapper';

let latestQr = null;
let clientInstance = null;
let isConnected = false;
let connectedPhone = null;
let currentStatus = 'INITIALIZING';
let retryCount = 0;
const MAX_RETRIES = 5;

// ── Nettoyage des dossiers de session corrompus (_IGNORE_*) ──────────
function cleanCorruptedSessions() {
  try {
    if (!fs.existsSync(SESSION_PATH)) {
      fs.mkdirSync(SESSION_PATH, { recursive: true });
      return;
    }
    const entries = fs.readdirSync(SESSION_PATH);
    for (const entry of entries) {
      if (entry.startsWith('_IGNORE_')) {
        const fullPath = path.join(SESSION_PATH, entry);
        console.log(`[OPENWA] 🧹 Nettoyage session corrompue: ${fullPath}`);
        fs.rmSync(fullPath, { recursive: true, force: true });
      }
    }
  } catch (err) {
    console.warn('[OPENWA] Avertissement nettoyage session:', err.message);
  }
}

// Écoute des QR codes avant initialisation
ev.on('qr.**', async (base64Qr, asciiQR, attempts, urlCode) => {
  console.log(`[OPENWA] 📱 Nouveau QR Code (Tentative: ${attempts})`);
  latestQr = base64Qr;
  isConnected = false;
  connectedPhone = null;
  currentStatus = 'WAITING_FOR_SCAN';
});

// Middleware d'authentification
function checkAuth(req, res, next) {
  if (!AUTH_KEY) return next();
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '') || req.headers['api-key'];
  if (token === AUTH_KEY) return next();
  return res.status(401).json({ error: 'Non autorisé: Clé API invalide' });
}

async function initClient() {
  cleanCorruptedSessions();

  try {
    currentStatus = 'STARTING_BROWSER';
    console.log(`[OPENWA] 🚀 Démarrage Chromium via wrapper (tentative ${retryCount + 1}/${MAX_RETRIES})...`);
    console.log(`[OPENWA] Wrapper: ${CHROME_WRAPPER}`);

    clientInstance = await create({
      sessionId: 'qapril_session',
      sessionDataPath: SESSION_PATH,

      // ⚠️ IMPORTANT : PAS de chromiumArgs avec MD mode (v4.76+)
      // Les flags --no-sandbox sont injectés via le wrapper chrome-wrapper.sh
      executablePath: CHROME_WRAPPER,

      headless: true,
      qrTimeout: 0,    // Pas de timeout sur l'attente du QR
      authTimeout: 0,  // Pas de timeout sur l'authentification
      cacheEnabled: false,
      restartOnCrash: true,
      // NE PAS mettre chromiumArgs — cela brise le mode Multi-Device
    });

    isConnected = true;
    latestQr = null;
    currentStatus = 'CONNECTED';
    retryCount = 0;

    try {
      const me = await clientInstance.getMe();
      connectedPhone = me?.wid?.user || me?.id?.user || 'Connecté';
      console.log(`[OPENWA] ✅ WhatsApp connecté sur: +${connectedPhone}`);
    } catch {
      connectedPhone = 'Connecté';
      console.log('[OPENWA] ✅ WhatsApp connecté avec succès');
    }

    clientInstance.onStateChanged((state) => {
      console.log(`[OPENWA] État de session: ${state}`);
      if (state === 'CONFLICT' || state === 'UNPAIRED' || state === 'UNLAUNCHED') {
        isConnected = false;
        connectedPhone = null;
        currentStatus = 'DISCONNECTED';
        setTimeout(() => scheduleRetry(), 5000);
      }
    });

  } catch (err) {
    console.error(`[OPENWA] ❌ Erreur init (tentative ${retryCount + 1}):`, err.message);
    currentStatus = 'ERROR';
    isConnected = false;
    clientInstance = null;
    scheduleRetry();
  }
}

function scheduleRetry() {
  if (retryCount >= MAX_RETRIES) {
    console.error(`[OPENWA] ❌ Échec après ${MAX_RETRIES} tentatives.`);
    currentStatus = 'FAILED';
    return;
  }
  retryCount++;
  const delay = Math.min(15000 * retryCount, 120000);
  console.log(`[OPENWA] ⏳ Retry dans ${delay / 1000}s (${retryCount}/${MAX_RETRIES})...`);
  setTimeout(() => initClient(), delay);
}

// Démarrage après stabilisation du conteneur
setTimeout(() => initClient(), 3000);

// ── Endpoints HTTP ───────────────────────────────────────────────────

app.get('/qr', (req, res) => {
  res.json({
    connected: isConnected,
    phone: connectedPhone,
    status: currentStatus,
    qr: latestQr,
    retryCount,
    maxRetries: MAX_RETRIES,
  });
});

app.get('/status', (req, res) => {
  res.json({
    connected: isConnected,
    phone: connectedPhone,
    status: currentStatus,
    hasQr: Boolean(latestQr),
    retryCount,
  });
});

app.post('/sendText', checkAuth, async (req, res) => {
  const { chatId, content, text } = req.body;
  const messageContent = content || text;

  if (!chatId || !messageContent) {
    return res.status(400).json({ error: 'chatId et content sont requis' });
  }
  if (!clientInstance || !isConnected) {
    return res.status(503).json({ error: 'WhatsApp non connecté. Scannez le QR depuis /admin/whatsapp' });
  }

  try {
    const result = await clientInstance.sendText(chatId, messageContent);
    console.log(`[OPENWA] ✉️ Message envoyé à ${chatId}`);
    return res.json({ success: true, response: result, id: result });
  } catch (err) {
    console.error(`[OPENWA] Erreur envoi vers ${chatId}:`, err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/sendMessage', checkAuth, async (req, res) => {
  const { to, body } = req.body;
  if (!to || !body) return res.status(400).json({ error: 'to et body sont requis' });
  if (!clientInstance || !isConnected) return res.status(503).json({ error: 'WhatsApp non connecté.' });
  try {
    const result = await clientInstance.sendText(to, body);
    return res.json({ success: true, id: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/reset', checkAuth, async (req, res) => {
  console.log('[OPENWA] 🔄 Réinitialisation manuelle...');
  try {
    if (clientInstance) {
      await clientInstance.kill().catch(() => {});
      clientInstance = null;
    }
    isConnected = false;
    connectedPhone = null;
    latestQr = null;
    currentStatus = 'RESETTING';
    retryCount = 0;

    if (fs.existsSync(SESSION_PATH)) {
      fs.rmSync(SESSION_PATH, { recursive: true, force: true });
      fs.mkdirSync(SESSION_PATH, { recursive: true });
    }

    setTimeout(() => initClient(), 3000);
    return res.json({ success: true, message: 'Session réinitialisée. QR code en cours de génération.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[OPENWA] 🚀 Passerelle WhatsApp démarrée sur http://0.0.0.0:${PORT}`);
});
