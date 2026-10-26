const express = require('express');
const { create, ev } = require('@open-wa/wa-automate');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8085;
const AUTH_KEY = process.env.AUTH_KEY || process.env.WA_API_KEY || 'qapril_wa_secret_2026';
const SESSION_PATH = process.env.SESSION_PATH || '/app/session';

let latestQr = null;
let clientInstance = null;
let isConnected = false;
let connectedPhone = null;
let currentStatus = 'INITIALIZING';

// Écoute de l'événement QR Code avant toute initialisation
ev.on('qr.**', async (base64Qr, asciiQR, attempts, urlCode) => {
  console.log(`[OPENWA] Nouveau QR Code généré (Tentative: ${attempts})`);
  latestQr = base64Qr;
  isConnected = false;
  connectedPhone = null;
  currentStatus = 'WAITING_FOR_SCAN';
});

// Middleware d'authentification pour les endpoints protégés
function checkAuth(req, res, next) {
  if (!AUTH_KEY) return next();
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '') || req.headers['api-key'];
  if (token === AUTH_KEY) return next();
  return res.status(401).json({ error: 'Non autorisé: Clé API invalide' });
}

async function initClient() {
  try {
    currentStatus = 'STARTING_BROWSER';
    console.log('[OPENWA] Lancement du moteur Chromium WhatsApp...');

    clientInstance = await create({
      sessionId: 'qapril_session',
      sessionDataPath: SESSION_PATH,
      useChrome: true,
      headless: true,
      qrTimeout: 0,
      authTimeout: 0,
      cacheEnabled: false,
      restartOnCrash: true,
      chromiumArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    isConnected = true;
    latestQr = null;
    currentStatus = 'CONNECTED';

    try {
      const me = await clientInstance.getMe();
      connectedPhone = me?.wid?.user || me?.id?.user || 'Connecté';
      console.log(`[OPENWA] ✅ Client WhatsApp connecté avec succès sur le numéro: +${connectedPhone}`);
    } catch {
      connectedPhone = 'Connecté';
      console.log('[OPENWA] ✅ Client WhatsApp connecté avec succès');
    }

    clientInstance.onStateChanged((state) => {
      console.log(`[OPENWA] Changement d'état de session: ${state}`);
      if (state === 'CONFLICT' || state === 'UNPAIRED' || state === 'UNLAUNCHED') {
        isConnected = false;
        connectedPhone = null;
        currentStatus = 'DISCONNECTED';
      }
    });

  } catch (err) {
    console.error('[OPENWA] Erreur initialisation client:', err.message);
    currentStatus = 'ERROR';
    isConnected = false;
  }
}

// Initialisation au lancement
initClient();

// ── Endpoints HTTP ───────────────────────────────────────────────────

// Endpoint public interne pour récupérer l'état et le QR Code dans l'admin QAPRIL
app.get('/qr', (req, res) => {
  res.json({
    connected: isConnected,
    phone: connectedPhone,
    status: currentStatus,
    qr: latestQr
  });
});

app.get('/status', (req, res) => {
  res.json({
    connected: isConnected,
    phone: connectedPhone,
    status: currentStatus,
    hasQr: Boolean(latestQr)
  });
});

// Envoi de messages texte (utilisé par auth.ts et openwa.ts dans QAPRIL)
app.post('/sendText', checkAuth, async (req, res) => {
  const { chatId, content, text } = req.body;
  const messageContent = content || text;

  if (!chatId || !messageContent) {
    return res.status(400).json({ error: 'Paramètres manquants: chatId et content sont requis' });
  }

  if (!clientInstance || !isConnected) {
    return res.status(503).json({ error: 'WhatsApp non connecté. Veuillez scanner le QR Code depuis la console Admin.' });
  }

  try {
    const result = await clientInstance.sendText(chatId, messageContent);
    console.log(`[OPENWA] Message envoyé avec succès à ${chatId}`);
    return res.json({ success: true, response: result, id: result });
  } catch (err) {
    console.error(`[OPENWA] Erreur envoi vers ${chatId}:`, err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Compatibilité fallback /sendMessage
app.post('/sendMessage', checkAuth, async (req, res) => {
  const { to, body } = req.body;
  if (!to || !body) {
    return res.status(400).json({ error: 'Paramètres manquants: to et body sont requis' });
  }
  if (!clientInstance || !isConnected) {
    return res.status(503).json({ error: 'WhatsApp non connecté. Veuillez scanner le QR Code depuis la console Admin.' });
  }
  try {
    const result = await clientInstance.sendText(to, body);
    return res.json({ success: true, id: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Réinitialisation de session si l'administrateur veut changer de numéro
app.post('/reset', checkAuth, async (req, res) => {
  console.log('[OPENWA] Réinitialisation de la session demandée par l\'admin...');
  try {
    if (clientInstance) {
      await clientInstance.kill().catch(() => {});
      clientInstance = null;
    }
    isConnected = false;
    connectedPhone = null;
    latestQr = null;
    currentStatus = 'RESETTING';

    // Nettoyer les fichiers de session
    if (fs.existsSync(SESSION_PATH)) {
      fs.rmSync(SESSION_PATH, { recursive: true, force: true });
      fs.mkdirSync(SESSION_PATH, { recursive: true });
    }

    setTimeout(() => {
      initClient();
    }, 2000);

    return res.json({ success: true, message: 'Session réinitialisée. Nouveau QR code en cours de génération.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[OPENWA] Passerelle WhatsApp prête et écoute sur http://0.0.0.0:${PORT}`);
});
