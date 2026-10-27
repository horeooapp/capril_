import { Client } from 'ssh2';
import * as path from 'path';

const config = {
  host: '187.77.182.168',
  port: 22,
  username: 'root',
  password: process.env.VPS_PASSWORD || 'Qap@vpserv2026',
};

const filesToUpload = [
  'src/actions/lease.actions.ts',
  'src/actions/marketplace-actions.ts',
  'src/app/dashboard/(portal)/leases/new/page.tsx',
  'src/app/dashboard/(portal)/matching/matching-client.tsx',
  'src/app/mon-espace-locataire/leases/[id]/page.tsx',
  'src/app/mon-espace-locataire/marketplace/marketplace-tenant-client.tsx',
];

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH connection established');
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      process.exit(1);
    }

    async function uploadAll() {
      for (const relPath of filesToUpload) {
        const localPath = path.resolve('e:/Projets_Cornerstone/site_crnstneros/capril_', relPath);
        const remotePath = '/opt/qapril/' + relPath.replace(/\\/g, '/');
        console.log(`Uploading ${relPath}...`);
        await new Promise((resolve, reject) => {
          sftp.fastPut(localPath, remotePath, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        console.log(`Uploaded ${relPath} OK`);
      }

      console.log('Files uploaded. Running docker compose build app && docker compose up -d app...');
      conn.exec('cd /opt/qapril && docker compose build app && docker compose up -d app', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code) => {
          console.log(`\nDocker build & up completed with exit code: ${code}`);
          conn.end();
          process.exit(code || 0);
        });
        stream.on('data', d => process.stdout.write(d));
        stream.stderr.on('data', d => process.stderr.write(d));
      });
    }

    uploadAll().catch(e => {
      console.error('Upload error:', e);
      conn.end();
      process.exit(1);
    });
  });
}).connect(config);
