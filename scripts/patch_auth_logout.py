with open('src/actions/auth.ts', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('await signOut({ redirectTo: baseUrl })', 'await signOut({ redirectTo: "/login" })')

with open('src/actions/auth.ts', 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated auth.ts')

