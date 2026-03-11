import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('187.77.93.154', port=22, username='root', key_filename='github_deploy_key')

setup_script = """#!/bin/bash
set -e
echo "Starting installation..."

if ! id "github" &>/dev/null; then
    useradd -m github
    usermod -aG sudo github
    echo "github ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/github
fi

echo "Downloading runner..."
su - github -c '
    mkdir -p actions-runner && cd actions-runner
    VERSION=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | grep \"tag_name\" | cut -d\\\" -f4 | sed \"s/v//\")
    if [ -z "$VERSION" ]; then VERSION="2.322.0"; fi
    curl -o actions-runner-linux-x64.tar.gz -L "https://github.com/actions/runner/releases/download/v${VERSION}/actions-runner-linux-x64-${VERSION}.tar.gz"
    tar xzf ./actions-runner-linux-x64.tar.gz
    sudo ./bin/installdependencies.sh
    
    echo "Configuring runner..."
    ./config.sh --url https://github.com/horeooapp/capril_ --token B7AEOHWIBKAZASSGCKV2IS3JWDGOO --unattended --name Hostinger-VPS --replace
'

echo "Installing service..."
cd /home/github/actions-runner
./svc.sh install github || true
./svc.sh start || true
./svc.sh status
echo "SUCCESS: Runner installed and started!"
"""

commands = [
    "cat << 'EOF_GHA' > /tmp/install_runner.sh\n" + setup_script + "\nEOF_GHA",
    "chmod +x /tmp/install_runner.sh",
    "/tmp/install_runner.sh"
]

for cmd in commands:
    print("Executing:", cmd.split('\\n')[0])
    stdin, stdout, stderr = client.exec_command(cmd)
    # Print the output in real time
    for line in iter(stdout.readline, ""):
        print(line, end="")
    for line in iter(stderr.readline, ""):
        print("ERR:", line, end="")

client.close()
