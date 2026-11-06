#!/usr/bin/env python3
"""
QAPRIL Release Management CLI
Usage:
    python scripts/release.py --status
    python scripts/release.py --bump patch --notes "Corrections mineures et performance"
    python scripts/release.py --bump minor --notes "Nouveaux modules et refonte d'ecrans"
    python scripts/release.py --deploy
"""

import os
import sys
import json
import argparse
import subprocess
from datetime import datetime

VERSION_CONFIG_PATH = 'config/version.json'

def load_version_config():
    if not os.path.exists(VERSION_CONFIG_PATH):
        raise FileNotFoundError(f"{VERSION_CONFIG_PATH} non trouve")
    with open(VERSION_CONFIG_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_version_config(cfg):
    with open(VERSION_CONFIG_PATH, 'w', encoding='utf-8') as f:
        json.dump(cfg, f, indent=2, ensure_ascii=False)

def bump_semver(version: str, bump_type: str) -> str:
    parts = [int(p) for p in version.split('.')]
    while len(parts) < 3:
        parts.append(0)
    
    if bump_type == 'major':
        parts[0] += 1
        parts[1] = 0
        parts[2] = 0
    elif bump_type == 'minor':
        parts[1] += 1
        parts[2] = 0
    elif bump_type == 'patch':
        parts[2] += 1
    return f"{parts[0]}.{parts[1]}.{parts[2]}"

def sync_code_files(new_ver: str, new_build: int, notes: str = None):
    # 1. Update config/version.json
    cfg = load_version_config()
    cfg['version'] = new_ver
    cfg['buildNumber'] = new_build
    cfg['releaseDate'] = datetime.now().strftime('%Y-%m-%d')
    if notes:
        cfg['apps']['locataire']['releaseNotes'] = notes
        cfg['apps']['proprietaire']['releaseNotes'] = notes
    cfg['apps']['locataire']['version'] = new_ver
    cfg['apps']['locataire']['versionCode'] = new_build
    cfg['apps']['proprietaire']['version'] = new_ver
    cfg['apps']['proprietaire']['versionCode'] = new_build
    save_version_config(cfg)

    # 2. Update app.json and package.json for locataire
    for app_dir in ['native_apps/locataire', 'native_apps/proprietaire']:
        app_json_path = os.path.join(app_dir, 'app.json')
        pkg_json_path = os.path.join(app_dir, 'package.json')
        ver_ts_path = os.path.join(app_dir, 'lib/version.ts')

        if os.path.exists(app_json_path):
            with open(app_json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            data['expo']['version'] = new_ver
            if 'android' not in data['expo']:
                data['expo']['android'] = {}
            data['expo']['android']['versionCode'] = new_build
            with open(app_json_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)

        if os.path.exists(pkg_json_path):
            with open(pkg_json_path, 'r', encoding='utf-8') as f:
                pkg_data = json.load(f)
            pkg_data['version'] = new_ver
            with open(pkg_json_path, 'w', encoding='utf-8') as f:
                json.dump(pkg_data, f, indent=2)

        if os.path.exists(ver_ts_path):
            with open(ver_ts_path, 'r', encoding='utf-8') as f:
                vcontent = f.read()
            import re
            vcontent = re.sub(r"APP_VERSION = '[\d\.]+';", f"APP_VERSION = '{new_ver}';", vcontent)
            vcontent = re.sub(r"BUILD_NUMBER = \d+;", f"BUILD_NUMBER = {new_build};", vcontent)
            with open(ver_ts_path, 'w', encoding='utf-8') as f:
                f.write(vcontent)

    print(f"[OK] Fichiers synchronises en v{new_ver} (Build {new_build})")

def show_status():
    cfg = load_version_config()
    print("=" * 50)
    print("  ETAT DE VERSIONING QAPRIL")
    print("=" * 50)
    print(f"Version globale     : v{cfg['version']} (Build {cfg['buildNumber']})")
    print(f"Date de release     : {cfg['releaseDate']}")
    print(f"Support minimal     : v{cfg['minSupportedVersion']}")
    print(f"Canal principal     : {cfg['channel']}")
    print("-" * 50)
    print(f"Locataire           : v{cfg['apps']['locataire']['version']} (code: {cfg['apps']['locataire']['versionCode']})")
    print(f"Notes Locataire     : {cfg['apps']['locataire']['releaseNotes']}")
    print(f"Proprietaire        : v{cfg['apps']['proprietaire']['version']} (code: {cfg['apps']['proprietaire']['versionCode']})")
    print(f"Notes Proprietaire  : {cfg['apps']['proprietaire']['releaseNotes']}")
    print("=" * 50)

def deploy_ota(msg: str):
    print("=== Deploiement OTA sur les deux applications et canaux ===")
    apps = ['locataire', 'proprietaire']
    branches = ['preview', 'production']

    for app in apps:
        app_dir = f'native_apps/{app}'
        for branch in branches:
            print(f"\n--> Publication EAS {app} [{branch}]...")
            cmd = f'cd {app_dir} && npx eas-cli update --branch {branch} --message "{msg}" --non-interactive'
            res = subprocess.run(cmd, shell=True)
            if res.returncode == 0:
                print(f"[OK] {app} [{branch}] publie avec succes.")
            else:
                print(f"[ERR] Echec de publication {app} [{branch}].")

def main():
    parser = argparse.ArgumentParser(description="QAPRIL Release Manager")
    parser.add_argument('--status', action='store_true', help="Afficher la version courante")
    parser.add_argument('--bump', choices=['patch', 'minor', 'major'], help="Incrémenter la version")
    parser.add_argument('--notes', type=str, help="Notes de mise à jour (Changelog)")
    parser.add_argument('--deploy', action='store_true', help="Déployer les mises à jour OTA immédiatement")

    args = parser.parse_args()

    if args.status or (not args.bump and not args.deploy):
        show_status()
        return

    if args.bump:
        cfg = load_version_config()
        curr_ver = cfg['version']
        curr_build = cfg.get('buildNumber', 1)

        new_ver = bump_semver(curr_ver, args.bump)
        new_build = curr_build + 1

        print(f"Bumping version {curr_ver} -> {new_ver} (Build {curr_build} -> {new_build})")
        sync_code_files(new_ver, new_build, args.notes)

    if args.deploy:
        cfg = load_version_config()
        msg = args.notes or f"Release v{cfg['version']} build {cfg['buildNumber']}"
        deploy_ota(msg)

if __name__ == '__main__':
    main()

