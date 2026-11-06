"""
Script de déslopage des gradients inline, barres de progression et motifs résiduels
Standard QAPRIL : Zéro Dégradé.
"""
import os
import re

def clean_inline_and_arbitrary(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    orig = content

    # 1. QapriLocataireUI & TenantPortalDashboard patterns
    content = re.sub(
        r'linear-gradient\(145deg,\$\{T\.navy\}\s*0%,\$\{T\.teal\}\s*100%\)',
        '${T.navy}',
        content
    )
    content = re.sub(
        r'linear-gradient\(135deg,\$\{T\.navy\}08,\$\{T\.teal\}08\)',
        '#F8FAFC',
        content
    )
    content = re.sub(
        r'linear-gradient\(135deg,\$\{T\.navy\},\$\{T\.teal\}\)',
        '${T.navy}',
        content
    )
    content = re.sub(
        r'linear-gradient\(90deg,#[a-zA-Z0-9]+,#[a-zA-Z0-9]+\)',
        '${T.teal}',
        content
    )
    content = re.sub(
        r'linear-gradient\(90deg,\$\{T\.[a-zA-Z0-9]+\},\$\{T\.[a-zA-Z0-9]+\}\)',
        '${T.teal}',
        content
    )

    # 2. Arbitrary Tailwind gradients bg-[linear-gradient(...)] or bg-[radial-gradient(...)]
    content = re.sub(
        r'bg-\[linear-gradient\([^\]]+\)\]',
        'bg-slate-50',
        content
    )
    content = re.sub(
        r'bg-\[radial-gradient\([^\]]+\)\]',
        '',
        content
    )

    # 3. Inline style radial-gradient & linear-gradient decorative background grids in public marketing pages
    # e.g., backgroundImage: "radial-gradient(circle at 50% 30% ...)"
    content = re.sub(
        r'backgroundImage:\s*["\']radial-gradient\([^"\']+\)[^"\']*["\']',
        'backgroundImage: "none"',
        content
    )
    content = re.sub(
        r'background:\s*["\']radial-gradient\([^"\']+\)[^"\']*["\']',
        'background: "transparent"',
        content
    )
    content = re.sub(
        r'backgroundImage:\s*["\']linear-gradient\([^"\']+\)[^"\']*["\']',
        'backgroundImage: "none"',
        content
    )
    content = re.sub(
        r'background:\s*["\']linear-gradient\([^"\']+\)[^"\']*["\']',
        'background: "transparent"',
        content
    )

    # 4. Any leftover bg-gradient-to-...
    content = re.sub(
        r'\bbg-gradient-to-[a-z0-9]+\b',
        '',
        content
    )

    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    target_dirs = ['src/app', 'src/components']
    count = 0
    for t in target_dirs:
        for root, dirs, files in os.walk(t):
            if 'node_modules' in root or '.next' in root:
                continue
            for f in files:
                if f.endswith(('.tsx', '.ts')):
                    p = os.path.join(root, f)
                    if clean_inline_and_arbitrary(p):
                        count += 1
                        print(f"Nettoyé : {p}")

    print(f"\nNettoyage inline terminé ! {count} fichiers mis à jour.")

if __name__ == '__main__':
    main()

