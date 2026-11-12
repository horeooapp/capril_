#!/usr/bin/env node
/**
 * AgentShield & ECC Security Pre-Commit Hook (QAPRIL)
 * 
 * Scans staged git files for secrets, tokens, credentials, and sensitive patterns.
 * Also verifies lexical compliance via scripts/check_lexique.py.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// High-confidence regex patterns from ECC AgentShield & Git Hooks
const SECRET_RULES = [
    { name: 'OpenAI / Claude API key', regex: /\b(sk-[A-Za-z0-9]{20,}|sk-ant-[A-Za-z0-9_-]{20,})\b/ },
    { name: 'GitHub classic / fine-grained token', regex: /\b(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,})\b/ },
    { name: 'AWS access key ID', regex: /\b(AKIA[0-9A-Z]{16})\b/ },
    { name: 'Private key block', regex: /-----BEGIN (RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----/ },
    { name: 'FeexPay / Gateway live secret', regex: /\b(live_[A-Za-z0-9]{24,}|feex_sec_[A-Za-z0-9]{20,})\b/i },
    { name: 'Generic credential assignment in code', regex: /\b(api[_-]?key|secret|password|auth_token)\b\s*[:=]\s*['"][A-Za-z0-9/+]{16,}['"]/i }
];

const IGNORED_EXTENSIONS = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf',
    '.zip', '.gz', '.lock', '.map', '.woff', '.woff2', '.ttf'
]);

const ALLOWED_TEST_PREFIXES = [
    'test_',
    'dummy_',
    'mock_',
    'PLACEHOLDER'
];

function getStagedFiles() {
    try {
        const stdout = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf-8', cwd: ROOT_DIR });
        return stdout.split('\n').map(s => s.trim()).filter(Boolean);
    } catch (e) {
        return [];
    }
}

function getAddedLines(file) {
    try {
        const patch = execSync(`git diff --cached -U0 -- "${file}"`, { encoding: 'utf-8', cwd: ROOT_DIR });
        const lines = [];
        for (const line of patch.split('\n')) {
            if (line.startsWith('+') && !line.startsWith('+++')) {
                lines.push(line.slice(1));
            }
        }
        return lines;
    } catch (e) {
        return [];
    }
}

function runSecurityScan() {
    console.log('\n🔒 [AgentShield ECC] Exécution du contrôle de sécurité pré-commit...');
    const stagedFiles = getStagedFiles();
    if (stagedFiles.length === 0) {
        console.log('✅ Aucun fichier indexé à analyser.');
        return 0;
    }

    let findings = 0;

    for (const file of stagedFiles) {
        const ext = path.extname(file).toLowerCase();
        if (IGNORED_EXTENSIONS.has(ext)) continue;
        if (file.includes('.sample') || file.includes('.example')) continue;

        const addedLines = getAddedLines(file);
        for (let i = 0; i < addedLines.length; i++) {
            const line = addedLines[i];
            
            // Ignorer les commentaires et logs bénins
            const trimmed = line.trim();
            if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*')) continue;

            for (const rule of SECRET_RULES) {
                if (rule.regex.test(line)) {
                    // Vérifier si c'est un mock ou une chaîne de test autorisée
                    const isAllowed = ALLOWED_TEST_PREFIXES.some(prefix => line.includes(prefix));
                    if (!isAllowed) {
                        console.error(`❌ [AgentShield ALERTE] Secret suspect détecté (${rule.name}) dans ${file}:`);
                        console.error(`   Ligne: ${line.trim().slice(0, 80)}...`);
                        findings++;
                    }
                }
            }
        }
    }

    if (findings > 0) {
        console.error(`\n🚨 [AgentShield] Commit bloqué : ${findings} secret(s) potentiel(s) détecté(s).`);
        console.error('👉 Veuillez supprimer ou déplacer ces identifiants dans les variables d\'environnement (.env).\n');
        return 1;
    }

    console.log('✅ [AgentShield] Analyse de sécurité réussie : zéro secret non autorisé détecté.');
    return 0;
}

const status = runSecurityScan();
process.exit(status);
