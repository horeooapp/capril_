import { Client } from 'ssh2';

const config = {
  host: '187.77.182.168',
  port: 22,
  username: 'root',
  password: process.env.VPS_PASSWORD || 'Qap@vpserv2026',
};

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH connection established');
  const cmd = `
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo "=== OPENWA CONTAINER LOGS (LAST 50 LINES) ==="
    docker logs --tail 50 qapril_openwa 2>&1
    echo "=== OPENWA HTTP STATUS CHECK ==="
    docker exec qapril_app wget -qO- http://openwa:8085/status || echo "Cannot reach openwa:8085 from app"
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`Command closed with code ${code}`);
      conn.end();
    });
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
  });
}).connect(config);
