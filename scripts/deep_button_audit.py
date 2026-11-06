import os
import re

dirs = ['src/app/admin', 'src/app/dashboard', 'src/app/mon-espace-locataire', 'src/components']

empty_click = re.compile(r'onClick\s*=\s*\{(?:\s*\(\s*\)\s*=>\s*\{[^}]*\}|\s*\w+\s*)\}')
# scan buttons
button_tag = re.compile(r'<button\b([^>]*)>', re.IGNORECASE)

results = []

for d in dirs:
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.tsx'):
                path = os.path.join(root, f)
                with open(path, 'r', encoding='utf-8', errors='ignore') as fl:
                    lines = fl.readlines()
                    for idx, line in enumerate(lines):
                        # Detect buttons without onClick, type="submit", formAction, or disabled
                        if '<button' in line:
                            # look at a window of 5 lines to capture full tag
                            tag_chunk = "".join(lines[idx:min(idx+5, len(lines))])
                            m = button_tag.search(tag_chunk)
                            if m:
                                attrs = m.group(1)
                                if 'onClick' not in attrs and 'type="submit"' not in attrs and "type='submit'" not in attrs and 'formAction' not in attrs and 'asChild' not in attrs:
                                    results.append((path, idx+1, line.strip()))

print(f"Buttons without handler found: {len(results)}\n")
for p, lnum, code in results[:40]:
    print(f"{p}:{lnum} -> {code[:80]}")

