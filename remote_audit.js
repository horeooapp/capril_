const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const fs = require('fs');

async function runAudit() {
  const keyEd25519 = fs.existsSync('C:\\Users\\hecki\\.ssh\\id_ed25519') ? fs.readFileSync('C:\\Users\\hecki\\.ssh\\id_ed25519', 'utf8') : null;
  const keyGithub = fs.existsSync('C:\\Users\\hecki\\.ssh\\id_github_deploy') ? fs.readFileSync('C:\\Users\\hecki\\.ssh\\id_github_deploy', 'utf8') : null;

  const attempts = [
    { username: 'root', port: 2222, password: 'Qat@server2026' },
    { username: 'github', port: 2222, password: 'Qat@server2026' },
    { username: 'root', port: 2222, privateKey: keyEd25519 },
    { username: 'github', port: 2222, privateKey: keyEd25519 },
    { username: 'github', port: 2222, privateKey: keyGithub },
  ];
  
  let connected = false;

  for (const config of attempts) {
    try {
      console.log(`Attempting connection: ${config.username}@187.77.93.154:${config.port} (${config.privateKey ? 'Key' : 'Pass'})...`);
      await ssh.connect({
        host: '187.77.93.154',
        port: config.port,
        username: config.username,
        password: config.password,
        privateKey: config.privateKey,
        tryKeyboard: true,
      });
      console.log(`Connected successfully!`);
      connected = true;
      break;
    } catch (error) {
      console.log(`Failed: ${error.message}`);
    }
  }

  if (!connected) {
    console.error('ERROR: All attempts failed.');
    process.exit(1);
  }
// ... rest

  try {
    const auditScript = `
#!/bin/bash
# ... (rest of the script remains the same)
`;
    // Using a simpler script for testing connection first
    const testResult = await ssh.execCommand('uname -a && uptime', { cwd: '/tmp' });
    console.log('STDOUT: ' + testResult.stdout);
    
    process.exit(0);
  } catch (error) {
    console.error('ERROR during command execution: ' + error.message);
    process.exit(1);
  }
}

runAudit();
