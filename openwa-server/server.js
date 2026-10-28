const express = require('express');
const http = require('http');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8085;
const WAHA_URL = process.env.WAHA_URL || 'http://openwa-api:3000';
const WAHA_API_KEY = process.env.WAHA_API_KEY || 'qapril_wa_secret_2026';
const SESSION_NAME = process.env.SESSION_NAME || 'default';

// Utiliser le fetch natif de Node 18+ ou https
function requestWaha(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, WAHA_URL);
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: {
        'x-api-key': WAHA_API_KEY,
        ...(options.headers || {})
      }
    }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          headers: res.headers,
          buffer: () => Promise.resolve(buffer),
          json: () => {
            try { return Promise.resolve(JSON.parse(buffer.toString('utf-8'))); }
            catch(e) { return Promise.resolve({}); }
          },
          text: () => Promise.resolve(buffer.toString('utf-8'))
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function ensureSession() {
  try {
    const res = await requestWaha('/api/sessions');
    const sessions = await res.json();
    const current = Array.isArray(sessions) ? sessions.find(s => s.name === SESSION_NAME) : null;
    
    if (!current) {
      console.log(`[BRIDGE] Création session ${SESSION_NAME}...`);
      await requestWaha('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: SESSION_NAME, start: true })
      });
    } else if (current.status === 'FAILED') {
      console.log(`[BRIDGE] Nettoyage et recréation session ${SESSION_NAME} (statut FAILED)...`);
      await requestWaha(`/api/sessions/${SESSION_NAME}`, { method: 'DELETE' }).catch(() => {});
      await requestWaha('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: SESSION_NAME, start: true })
      });
    } else if (current.status === 'STOPPED') {
      console.log(`[BRIDGE] Redémarrage session ${SESSION_NAME} (STOPPED)...`);
      await requestWaha(`/api/sessions/${SESSION_NAME}/start`, { method: 'POST' });
    }
  } catch (err) {
    console.error('[BRIDGE] Erreur ensureSession:', err.message);
  }
}

app.get('/qr', async (req, res) => {
  try {
    const sessionRes = await requestWaha(`/api/sessions/${SESSION_NAME}`);
    if (!sessionRes.ok) {
      await ensureSession();
      return res.json({ connected: false, phone: null, status: 'STARTING', qr: null });
    }
    
    const sessionData = await sessionRes.json();
    const status = sessionData.status;

    if (status === 'WORKING') {
      const meRes = await requestWaha(`/api/sessions/${SESSION_NAME}/me`);
      const meData = meRes.ok ? await meRes.json() : null;
      const phone = meData?.id ? meData.id.replace(/@.*$/, '') : 'Connecté';
      return res.json({
        connected: true,
        phone,
        status: 'CONNECTED',
        qr: null
      });
    }

    if (status === 'STOPPED') {
      await requestWaha(`/api/sessions/${SESSION_NAME}/start`, { method: 'POST' });
      return res.json({ connected: false, phone: null, status: 'RESTARTING', qr: null });
    }

    if (status === 'FAILED') {
      console.log(`[BRIDGE] Nettoyage session FAILED dans /qr...`);
      await requestWaha(`/api/sessions/${SESSION_NAME}`, { method: 'DELETE' }).catch(() => {});
      await requestWaha('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: SESSION_NAME, start: true })
      }).catch(() => {});
      return res.json({ connected: false, phone: null, status: 'RESTARTING', qr: null });
    }

    const qrRes = await requestWaha(`/api/${SESSION_NAME}/auth/qr`);
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

app.get('/status', async (req, res) => {
  try {
    const sessionRes = await requestWaha(`/api/sessions/${SESSION_NAME}`);
    const sessionData = sessionRes.ok ? await sessionRes.json() : null;
    const connected = sessionData?.status === 'WORKING';
    return res.json({ connected, status: sessionData?.status || 'UNKNOWN' });
  } catch (err) {
    return res.json({ connected: false, status: 'ERROR', error: err.message });
  }
});

app.post(['/sendText', '/api/sessions/:sessionId/messages/send-text'], async (req, res) => {
  const { chatId, content, text } = req.body;
  const messageContent = content || text;
  if (!chatId || !messageContent) {
    return res.status(400).json({ error: 'chatId et content requis' });
  }

  try {
    const wahaRes = await requestWaha('/api/sendText', {
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
      return res.json({ success: true, response: data, id: data?.id, messageId: data?.id });
    }
    return res.status(wahaRes.status).json({ success: false, error: data?.message || 'Erreur WAHA' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/reset', async (req, res) => {
  try {
    await requestWaha(`/api/sessions/${SESSION_NAME}/logout`, { method: 'POST' }).catch(() => {});
    await requestWaha(`/api/sessions/${SESSION_NAME}/start`, { method: 'POST' }).catch(() => {});
    return res.json({ success: true, message: 'Session réinitialisée.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[WAHA BRIDGE] 🚀 Passerelle démarrée sur le port ${PORT}`);
  ensureSession();
});
