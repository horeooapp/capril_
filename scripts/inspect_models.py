import re

with open(r'e:\Projets_Cornerstone\site_crnstneros\capril_\prisma\schema.prisma', 'r', encoding='utf-8') as f:
    schema = f.read()

def get_model(name):
    pattern = rf'model\s+{name}\s+\{{([^}}]+)\}}'
    m = re.search(pattern, schema)
    if m:
        return m.group(0)
    return None

models = [
    'User', 'Candidature', 'Annonce', 'Lease', 'Receipt',
    'Property', 'MandatGestion', 'Occupant', 'AttestationResidence',
    'DeclarationPaiement', 'TransmissionAdressage', 'AutomationSettings'
]

for name in models:
    res = get_model(name)
    if res:
        print(f'=== MODEL {name} (lines: {res.count(chr(10))}) ===')
        # print first 5 and last 5 lines
        lines = res.split('\n')
        for l in lines[:8]:
            print(' ', l)
        print('  ...')
        for l in lines[-6:]:
            print(' ', l)

