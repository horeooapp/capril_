with open('native_apps/locataire/components/KycVerificationModal.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines, 1):
    q_single = line.count("'")
    q_double = line.count('"')
    # If a line has odd number of quotes
    if q_single % 2 != 0:
        print(f"SINGLE {i}: {line.strip()}")
    if q_double % 2 != 0:
        print(f"DOUBLE {i}: {line.strip()}")
