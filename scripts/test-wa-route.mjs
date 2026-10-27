import { Client } from 'ssh2';

const config = {
  host: '187.77.182.168',
  port: 22,
  username: 'root',
  password: process.env.VPS_PASSWORD || 'Qap@vpserv2026',
};

const conn = new Client();

conn.on('ready', () => {
  const testPayload = JSON.stringify({
    chatId: "2250700000000",
    text: "Test ping from qapril app"
  });

  const cmd = `
    echo "=== TEST CURL FROM qapril_app TO qapril_whatsapp:8085 ==="
    docker exec qapril_app wget -qO- --post-data '${testPayload}' --header "Content-Type: application/json" http://qapril_whatsapp:8085/ || echo "wget to qapril_whatsapp failed"
    echo ""
    echo "=== TEST CURL FROM qapril_app TO openwa:8085 ==="
    docker exec qapril_app wget -qO- --post-data '${testPayload}' --header "Content-Type: application/json" http://openwa:8085/ || echo "wget to openwa failed"
    echo ""
    echo "=== CHECK APP ENV IN CONTAINER ==="
    docker exec qapril_app env | grep -iE 'openwa|whatsapp'
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end());
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
  });
}).connect(config);
