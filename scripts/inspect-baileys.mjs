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
    docker inspect qapril_whatsapp --format '{{json .Config.Env}}'
    echo "--- Ports & Network of qapril_whatsapp ---"
    docker inspect qapril_whatsapp --format 'Ports: {{json .NetworkSettings.Ports}} Networks: {{json .NetworkSettings.Networks}}'
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end());
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
  });
}).connect(config);
