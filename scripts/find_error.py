import os

search_terms = ['Erreur Flux Agence', 'Impossible de charger', 'obsolète', 'Flux Agence', 'dashboard/agency', 'dashboard']

for root, dirs, files in os.walk('.'):
    if any(p in root for p in ['node_modules', '.git', '.next']):
        continue
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    for term in search_terms:
                        if term in content:
                            print(f'Found "{term}" in {filepath}')
            except Exception as e:
                pass
