import os
import re

# Additional targeted patterns
def replace_secondary(content: str) -> tuple[str, int]:
    count = 0
    new_content = content

    # 1. JSX text ending with FCFA</ or FCFA</span> or FCFA</p> or FCFA</div> or FCFA</h2> or FCFA</h3>
    new_content, c = re.subn(r'\bFCFA\s*(</[a-zA-Z0-9]+>)', r'XOF\1', new_content)
    count += c

    # 2. FCFA followed by special char or space in JSX (e.g. "FCFA · " or "FCFA • ")
    new_content, c = re.subn(r'\bFCFA\b(\s*[·•\-\|\,\;])', r'XOF\1', new_content)
    count += c

    # 3. "500k+ FCFA" or similar
    new_content, c = re.subn(r'(\d+k?\+?)\s*FCFA\b', r'\1 XOF', new_content)
    count += c

    # 4. "FCFA/h" -> "XOF/h"
    new_content, c = re.subn(r'\bFCFA/h\b', 'XOF/h', new_content)
    count += c

    # 5. "Côte d'Ivoire · FCFA" -> "Côte d'Ivoire · XOF"
    new_content, c = re.subn(r'Côte d\'Ivoire · FCFA', "Côte d'Ivoire · XOF", new_content)
    count += c

    # 6. "francs CFA" -> "francs CFA (XOF)" or "FCFA" in contracts
    new_content, c = re.subn(r'Francs CFA \(en chiffres\)\s*<strong>\{([^}]+)\.toLocaleString\(\)\}\s*FCFA</strong>', 
                             r'francs CFA (en chiffres) <strong>{\1.toLocaleString()} XOF</strong>', new_content)
    count += c
    new_content, c = re.subn(r'francs CFA \(en chiffres\)\s*<strong>\{([^}]+)\.toLocaleString\(\)\}\s*FCFA</strong>', 
                             r'francs CFA (en chiffres) <strong>{\1.toLocaleString()} XOF</strong>', new_content)
    count += c

    # 7. Isolated "FCFA" in template literals: e.g. `${fmt(amount)} FCFA` -> `${fmt(amount)} XOF`
    new_content, c = re.subn(r'\}\s*FCFA\b', r'} XOF', new_content)
    count += c

    return new_content, count

total_changed = 0
total_repl = 0

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            p = os.path.join(root, file)
            with open(p, 'r', encoding='utf-8') as f:
                content = f.read()
            updated, c = replace_secondary(content)
            if c > 0 and updated != content:
                with open(p, 'w', encoding='utf-8') as f:
                    f.write(updated)
                total_changed += 1
                total_repl += c

print(f"Secondary replacements: {total_repl} in {total_changed} files.")
