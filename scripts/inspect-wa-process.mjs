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
    docker inspect qapril_whatsapp --format 'WorkingDir: {{.Config.WorkingDir}} Entrypoint: {{.Config.Entrypoint}} Cmd: {{.Config.Cmd}}'
    echo "--- PS AUX INSIDE qapril_whatsapp ---"
    docker exec qapril_whatsapp ps aux
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end());
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
  });
}).connect(config);
