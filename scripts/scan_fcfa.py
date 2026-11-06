import os
import re

regex = re.compile(r'\bFCFA\b')
non_string_lines = []

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            p = os.path.join(root, file)
            with open(p, 'r', encoding='utf-8') as fp:
                for idx, line in enumerate(fp, 1):
                    c_line = re.sub(r'//.*$', '', line)
                    if regex.search(c_line):
                        no_str = re.sub(r'("[^"]*"|\'[^\']*\'|`[^`]*`)', '', c_line)
                        if regex.search(no_str):
                            non_string_lines.append((p, idx, c_line.strip()))

print(f"Lines where FCFA is outside string literals: {len(non_string_lines)}")
for p, idx, l in non_string_lines:
    safe = l.encode('ascii', errors='replace').decode('ascii')
    print(f"{p}:{idx} -> {safe}")
