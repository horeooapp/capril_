const { NodeSSH } = require('node-ssh')
const fs = require('fs')
const path = require('path')

const ssh = new NodeSSH()

async function run() {
  try {
    console.log('Connecting to SSH (Port 2222)...')
    await ssh.connect({
      host: '187.77.93.154',
      username: 'root',
      password: 'Qap@server2026',
      port: 2222
    })
    console.log('Connected!')

    const sqlContent = fs.readFileSync(path.join(__dirname, 'm17_migration.sql'), 'utf8')
    
    console.log('Executing M17 Migration SQL via sudo -u postgres on VPS...')
    const command = `sudo -u postgres psql -d qapril <<'EOF'
${sqlContent}
EOF
`
    const result = await ssh.execCommand(command)

    console.log('STDOUT:', result.stdout)
    console.log('STDERR:', result.stderr)
    
    if (result.code === 0) {
       console.log('SUCCESS: Migration M17 completed.')
    } else {
       console.log('FAILED with code', result.code)
    }

  } catch (error) {
    console.error('CRITICAL ERROR:', error)
  } finally {
    ssh.dispose()
    process.exit()
  }
}

run()
