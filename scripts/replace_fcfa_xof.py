import os
import re

# Files or patterns that define Prisma types or internal identifiers where property name change would break DB
SKIP_IDENTIFIERS = {
    'totalRentFcfa', 'rentFcfa', 'montantFCFA', 'montantFcfa', 'totalFcfa',
    'prixFcfa', 'budgetMaxFcfa', 'declaredRentFcfa', 'coutEstimeFcfa',
    'TAUX_EUR_FCFA', 'EXCHANGE_RATE_EUR_FCFA', 'QAPRIL_QUITTANCE_PRIX_FCFA', 'FCFA_EUR'
}

# Targeted text replacements (e.g. 'FCFA', ' FCFA', '(FCFA)')
def replace_in_content(content: str, filepath: str) -> tuple[str, int]:
    count = 0
    new_content = content
    
    # 1. Text representations
    # "MONTANT (FCFA)" -> "MONTANT (XOF)"
    new_content, c = re.subn(r'\(FCFA\)', '(XOF)', new_content)
    count += c
    
    # "FCFA/mois" -> "XOF/mois"
    new_content, c = re.subn(r'FCFA/mois', 'XOF/mois', new_content)
    count += c

    # "FCFA TTC" -> "XOF TTC"
    new_content, c = re.subn(r'FCFA\s+TTC', 'XOF TTC', new_content)
    count += c

    # "FCFA / mois" -> "XOF / mois"
    new_content, c = re.subn(r'FCFA\s+/\s+mois', 'XOF / mois', new_content)
    count += c
    
    # "FCFA / an" -> "XOF / an"
    new_content, c = re.subn(r'FCFA\s+/\s+an', 'XOF / an', new_content)
    count += c

    # 2. JSX / HTML text: ">FCFA<" -> ">XOF<"
    new_content, c = re.subn(r'>\s*FCFA\s*<', '>XOF<', new_content)
    count += c

    # 3. String literals containing " FCFA" or ' FCFA' or ` FCFA`
    # e.g. `${amount} FCFA` -> `${amount} XOF`
    new_content, c = re.subn(r'(\s+)FCFA([`\'"\s\.,;:\?!])', r'\1XOF\2', new_content)
    count += c

    # 4. currency: 'FCFA' or currency: "FCFA" -> currency: 'XOF'
    new_content, c = re.subn(r'(currency\s*:\s*[\'"])FCFA([\'"])', r'\g<1>XOF\g<2>', new_content)
    count += c

    # 5. devise: 'FCFA' -> devise: 'XOF'
    new_content, c = re.subn(r'(devise\s*:\s*[\'"])FCFA([\'"])', r'\g<1>XOF\g<2>', new_content)
    count += c

    # 6. unit="FCFA" -> unit="XOF"
    new_content, c = re.subn(r'unit\s*=\s*([\'"])FCFA([\'"])', r'unit=\1XOF\2', new_content)
    count += c
    new_content, c = re.subn(r'unit\s*=\s*([\'"])FCFA\s*/\s*Mois([\'"])', r'unit=\1XOF / Mois\2', new_content)
    count += c

    # 7. Isolated "FCFA" in options/labels: e.g. "50k - 150k FCFA" -> "50k - 150k XOF"
    new_content, c = re.subn(r'(\d+k?)\s*FCFA', r'\1 XOF', new_content)
    count += c

    # 8. Remaining isolated string literal 'FCFA' or "FCFA" when not a property key
    # e.g. `['FCFA', 'EUR']` -> `['XOF', 'EUR']`
    new_content, c = re.subn(r'([\'"])FCFA([\'"])', r'\1XOF\2', new_content)
    count += c

    # 9. In comments or docs: "en FCFA" -> "en XOF"
    new_content, c = re.subn(r'\ben FCFA\b', 'en XOF', new_content)
    count += c

    return new_content, count

total_changed_files = 0
total_replacements = 0

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    original = f.read()
                
                updated, c = replace_in_content(original, filepath)
                if c > 0 and updated != original:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(updated)
                    total_changed_files += 1
                    total_replacements += c
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

print(f"Replacement complete: {total_replacements} replacements across {total_changed_files} files.")
