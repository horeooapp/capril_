import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8085;
const WAHA_URL = process.env.WAHA_URL || 'http://openwa-api:3000';
const WAHA_API_KEY = process.env.WAHA_API_KEY || 'qapril_wa_secret_2026';
const SESSION_NAME = process.env.SESSION_NAME || 'qapril';

// Helper pour appeler WAHA
async function callWaha(endpoint, options = {}) {
  const url = `${WAHA_URL.replace(/\\/$/, '')}${endpoint}`;
  const headers = {
    'x-api-key': WAHA_API_KEY,
    ...(options.headers || {})
  };
  return fetch(url, { ...options, headers });
}

// Assurer que la session existe et est démarrée
async function ensureSession() {
  try {
    const res = await callWaha('/api/sessions');
    const sessions = await res.json();
    const current = Array.isArray(sessions) ? sessions.find(s => s.name === SESSION_NAME) : null;
    
    if (!current) {
      console.log(`[BRIDGE] Création de la session ${SESSION_NAME}...`);
      await callWaha('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: SESSION_NAME, start: true })
      });
    } else if (current.status === 'STOPPED' || current.status === 'FAILED') {
      console.log(`[BRIDGE] Redémarrage de la session ${SESSION_NAME} (${current.status})...`);
      await callWaha(`/api/sessions/${SESSION_NAME}/start`, { method: 'POST' });
    }
  } catch (err) {
    console.error('[BRIDGE] Erreur ensureSession:', err.message);
  }
}

// 1. Endpoint /qr compatible avec le frontend Next.js de QAPRIL
app.get('/qr', async (req, res) => {
  try {
    const sessionRes = await callWaha(`/api/sessions/${SESSION_NAME}`);
    if (!sessionRes.ok) {
      await ensureSession();
      return res.json({ connected: false, phone: null, status: 'STARTING', qr: null });
    }
    
    const sessionData = await sessionRes.json();
    const status = sessionData.status;

    if (status === 'WORKING') {
      const meRes = await callWaha(`/api/sessions/${SESSION_NAME}/me`);
      const meData = meRes.ok ? await meRes.json() : null;
      const phone = meData?.id ? meData.id.replace(/@.*$/, '') : 'Connecté';
      return res.json({
        connected: true,
        phone,
        status: 'CONNECTED',
        qr: null
      });
    }

    if (status === 'STOPPED' || status === 'FAILED') {
      await callWaha(`/api/sessions/${SESSION_NAME}/start`, { method: 'POST' });
      return res.json({ connected: false, phone: null, status: 'RESTARTING', qr: null });
    }

    // Récupérer le QR code en image PNG et convertir en base64 Data URL
    const qrRes = await callWaha(`/api/${SESSION_NAME}/auth/qr`);
    if (qrRes.ok) {
      const buffer = await qrRes.buffer();
      const base64 = `data:image/png;base64,${buffer.toString('base64')}`;
      return res.json({
        connected: false,
        phone: null,
        status: 'WAITING_FOR_SCAN',
        qr: base64
      });
    }

    return res.json({ connected: false, phone: null, status, qr: null });
  } catch (err) {
    console.error('[BRIDGE] Erreur /qr:', err.message);
    return res.json({ connected: false, phone: null, status: 'ERROR', error: err.message, qr: null });
  }
});

// 2. Endpoint /status
app.get('/status', async (req, res) => {
  try {
    const sessionRes = await callWaha(`/api/sessions/${SESSION_NAME}`);
    const sessionData = sessionRes.ok ? await sessionRes.json() : null;
    const connected = sessionData?.status === 'WORKING';
    return res.json({ connected, status: sessionData?.status || 'UNKNOWN' });
  } catch (err) {
    return res.json({ connected: false, status: 'ERROR', error: err.message });
  }
});

// 3. Endpoint /sendText
app.post('/sendText', async (req, res) => {
  const { chatId, content, text } = req.body;
  const messageContent = content || text;
  if (!chatId || !messageContent) {
    return res.status(400).json({ error: 'chatId et content requis' });
  }

  try {
    const wahaRes = await callWaha('/api/sendText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: SESSION_NAME,
        chatId: chatId.includes('@') ? chatId : `${chatId}@c.us`,
        text: messageContent
      })
    });

    const data = await wahaRes.json();
    if (wahaRes.ok) {
      return res.json({ success: true, response: data, id: data?.id });
    }
    return res.status(wahaRes.status).json({ success: false, error: data?.message || 'Erreur WAHA' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Endpoint /reset
app.post('/reset', async (req, res) => {
  try {
    await callWaha(`/api/sessions/${SESSION_NAME}/logout`, { method: 'POST' }).catch(() => {});
    await callWaha(`/api/sessions/${SESSION_NAME}/restart`, { method: 'POST' }).catch(() => {});
    return res.json({ success: true, message: 'Session réinitialisée.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[WAHA BRIDGE] 🚀 Passerelle démarrée sur le port ${PORT}`);
  ensureSession();
});
