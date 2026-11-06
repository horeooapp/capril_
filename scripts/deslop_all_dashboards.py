"""
Script de déslopage complet pour les Dashboards, Portails et Pages Web de QAPRIL
Applique le Standard QAPRIL : Zéro Dégradé ni Glassmorphism.
"""
import os
import re

GLASS_PATTERNS = [
    # Remove backdrop-blur tailwind classes
    (re.compile(r'\bbackdrop-blur(?:-[a-z0-9]+)?\b'), ''),
    (re.compile(r'\b-webkit-backdrop-filter:[^;]+;'), ''),
    (re.compile(r'\bbackdrop-filter:[^;]+;'), ''),
    # Replace milky transparent white cards with solid white
    (re.compile(r'\bbg-white/(?:60|70|75|80|85|90|95)\b'), 'bg-white'),
    # Replace milky dark backgrounds
    (re.compile(r'\bbg-slate-900/(?:70|75|80|85|90)\b'), 'bg-slate-900'),
    (re.compile(r'\bbg-slate-950/(?:70|75|80|85|90)\b'), 'bg-slate-950'),
    (re.compile(r'\bbg-gray-900/(?:70|75|80|85|90)\b'), 'bg-gray-900'),
]

GRADIENT_PATTERNS = [
    # Text gradients: bg-clip-text text-transparent bg-gradient-to-...
    (
        re.compile(r'\bbg-clip-text\s+text-transparent\s+bg-gradient-to-[a-z]+\s+from-[^\s"\']+\s+(?:via-[^\s"\']+\s+)?to-[^\s"\']+'),
        'text-slate-900'
    ),
    (
        re.compile(r'\btext-transparent\s+bg-clip-text\s+bg-gradient-to-[a-z]+\s+from-[^\s"\']+\s+(?:via-[^\s"\']+\s+)?to-[^\s"\']+'),
        'text-slate-900'
    ),
    (
        re.compile(r'\bbg-clip-text\s+text-transparent\b'),
        'text-slate-900'
    ),
    # Common Amber / Orange gradients on buttons and badges
    (
        re.compile(r'\bbg-gradient-to-r\s+from-(?:orange|amber)-[0-9]+\s+(?:via-[^\s"\']+\s+)?to-(?:amber|orange|yellow)-[0-9]+\b'),
        'bg-[#D97706]'
    ),
    (
        re.compile(r'\bbg-gradient-to-br\s+from-(?:orange|amber)-[0-9]+\s+(?:via-[^\s"\']+\s+)?to-(?:amber|orange|yellow)-[0-9]+\b'),
        'bg-[#D97706]'
    ),
    # Emerald / Green gradients
    (
        re.compile(r'\bbg-gradient-to-r\s+from-(?:emerald|green|teal)-[0-9]+\s+(?:via-[^\s"\']+\s+)?to-(?:emerald|teal|green)-[0-9]+\b'),
        'bg-[#059669]'
    ),
    (
        re.compile(r'\bbg-gradient-to-br\s+from-(?:emerald|green|teal)-[0-9]+\s+(?:via-[^\s"\']+\s+)?to-(?:emerald|teal|green)-[0-9]+\b'),
        'bg-[#059669]'
    ),
    # Blue / Sky gradients
    (
        re.compile(r'\bbg-gradient-to-r\s+from-(?:blue|sky|indigo)-[0-9]+\s+(?:via-[^\s"\']+\s+)?to-(?:blue|sky|indigo|cyan)-[0-9]+\b'),
        'bg-[#0284C7]'
    ),
    (
        re.compile(r'\bbg-gradient-to-br\s+from-(?:blue|sky|indigo)-[0-9]+\s+(?:via-[^\s"\']+\s+)?to-(?:blue|sky|indigo|cyan)-[0-9]+\b'),
        'bg-[#0284C7]'
    ),
    # Slate / Dark gradients
    (
        re.compile(r'\bbg-gradient-to-[a-z]+\s+from-slate-900\s+(?:via-[^\s"\']+\s+)?to-slate-[0-9]+\b'),
        'bg-slate-900'
    ),
    (
        re.compile(r'\bbg-gradient-to-[a-z]+\s+from-slate-950\s+(?:via-[^\s"\']+\s+)?to-slate-[0-9]+\b'),
        'bg-slate-950'
    ),
    (
        re.compile(r'\bbg-gradient-to-[a-z]+\s+from-gray-900\s+(?:via-[^\s"\']+\s+)?to-gray-[0-9]+\b'),
        'bg-gray-900'
    ),
    # White / Light card gradients
    (
        re.compile(r'\bbg-gradient-to-[a-z]+\s+from-white\s+(?:via-[^\s"\']+\s+)?to-(?:slate|gray|neutral)-50\b'),
        'bg-white'
    ),
    # Image overlay gradients
    (
        re.compile(r'\bbg-gradient-to-t\s+from-slate-950(?:/\d+)?\s+via-slate-950(?:/\d+)?\s+to-(?:slate-950(?:/\d+)?|transparent)\b'),
        'bg-slate-950/80'
    ),
    (
        re.compile(r'\bbg-gradient-to-t\s+from-black(?:/\d+)?\s+(?:via-[^\s"\']+\s+)?to-transparent\b'),
        'bg-black/60'
    ),
    (
        re.compile(r'\bbg-gradient-to-b\s+from-transparent\s+(?:via-[^\s"\']+\s+)?to-black(?:/\d+)?\b'),
        'bg-black/60'
    ),
    # Generic remaining bg-gradient-to-* fallback
    (
        re.compile(r'\bbg-gradient-to-[a-z]+\s+from-[^\s"\']+\s+(?:via-[^\s"\']+\s+)?to-[^\s"\']+\b'),
        'bg-slate-900'
    ),
]

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    orig = content
    # Apply glassmorphism cleaners
    for pattern, repl in GLASS_PATTERNS:
        content = pattern.sub(repl, content)

    # Apply gradient cleaners
    for pattern, repl in GRADIENT_PATTERNS:
        content = pattern.sub(repl, content)

    # Clean double spaces inside classNames
    content = re.sub(r'className="([^"]+)"', lambda m: f'className="{" ".join(m.group(1).split())}"', content)
    content = re.sub(r"className='([^']+)'", lambda m: f"className='{' '.join(m.group(1).split())}'", content)

    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    target_dirs = [
        'src/app',
        'src/components',
    ]

    modified_count = 0
    total_scanned = 0

    for tdir in target_dirs:
        for root, dirs, files in os.walk(tdir):
            if 'node_modules' in root or '.next' in root:
                continue
            for f in files:
                if f.endswith(('.tsx', '.ts')) and not f.endswith('.d.ts'):
                    total_scanned += 1
                    path = os.path.join(root, f)
                    if clean_file(path):
                        modified_count += 1
                        print(f"Desloppé : {path}")

    print(f"\nTerminé ! {modified_count} fichiers désloppés sur {total_scanned} scannés.")

if __name__ == '__main__':
    main()

