with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    lines = f.readlines()

current_model = None
for i in range(len(lines)):
    line = lines[i]
    if line.strip().startswith('model '):
        current_model = line.strip().split()[1]
    if 'ReceiptStatus' in line:
        print(f'Replacing in model {current_model} at line {i+1}')
        if current_model == 'LegalEntity':
            lines[i] = '  status            String                 @default("pending")\n'
        elif current_model == 'IdentityDocument':
            lines[i] = '  status           String       @default("pending")\n'
        elif current_model == 'PaymentIntent':
            lines[i] = '  status         String   @default("pending")\n'
        elif current_model == 'Receipt':
            lines[i] = '  status             String           @default("pending")\n'
        elif current_model == 'Notification':
            lines[i] = '  status     String   @default("pending")\n'
        else:
            lines[i] = '  status     String   @default("pending")\n'

with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Done.')
