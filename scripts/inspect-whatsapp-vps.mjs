import { Client } from 'ssh2';

const config = {
  host: '187.77.182.168',
  port: 22,
  username: 'root',
  password: process.env.VPS_PASSWORD || 'Qap@vpserv2026',
};

const conn = new Client();

conn.on('ready', () => {
  const cmd = `
    echo "=== INSPECT qapril_whatsapp ==="
    docker inspect qapril_whatsapp | grep -iE 'image|network|env' | head -n 30
    echo "=== qapril_whatsapp logs ==="
    docker logs --tail 25 qapril_whatsapp 2>&1
    echo "=== .env / .env.docker WhatsApp variables in /opt/qapril ==="
    grep -iE 'whatsapp|openwa' /opt/qapril/.env /opt/qapril/.env.docker 2>/dev/null || true
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      conn.end();
    });
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
  });
}).connect(config);
