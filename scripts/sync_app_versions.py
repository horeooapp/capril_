import json

with open('config/version.json', 'r', encoding='utf-8') as f:
    ver_cfg = json.load(f)

new_version = ver_cfg['version']
build_num = ver_cfg['buildNumber']

# 1. Update locataire
with open('native_apps/locataire/app.json', 'r', encoding='utf-8') as f:
    loc_app = json.load(f)
loc_app['expo']['version'] = new_version
if 'android' not in loc_app['expo']:
    loc_app['expo']['android'] = {}
loc_app['expo']['android']['versionCode'] = build_num

with open('native_apps/locataire/app.json', 'w', encoding='utf-8') as f:
    json.dump(loc_app, f, indent=2)

with open('native_apps/locataire/package.json', 'r', encoding='utf-8') as f:
    loc_pkg = json.load(f)
loc_pkg['version'] = new_version
with open('native_apps/locataire/package.json', 'w', encoding='utf-8') as f:
    json.dump(loc_pkg, f, indent=2)

print(f"Locataire version updated to {new_version} (versionCode: {build_num})")

# 2. Update proprietaire
with open('native_apps/proprietaire/app.json', 'r', encoding='utf-8') as f:
    prop_app = json.load(f)
prop_app['expo']['version'] = new_version
if 'android' not in prop_app['expo']:
    prop_app['expo']['android'] = {}
prop_app['expo']['android']['versionCode'] = build_num

with open('native_apps/proprietaire/app.json', 'w', encoding='utf-8') as f:
    json.dump(prop_app, f, indent=2)

with open('native_apps/proprietaire/package.json', 'r', encoding='utf-8') as f:
    prop_pkg = json.load(f)
prop_pkg['version'] = new_version
with open('native_apps/proprietaire/package.json', 'w', encoding='utf-8') as f:
    json.dump(prop_pkg, f, indent=2)

print(f"Propriétaire version updated to {new_version} (versionCode: {build_num})")

