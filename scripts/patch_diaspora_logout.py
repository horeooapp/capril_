with open('src/components/DiasporaDashboard.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

target = '<BtnSec label="Déconnexion" color={T.red}/>'
assert target in c, 'Target not found'
c = c.replace(target, '<BtnSec label="Déconnexion" color={T.red} onClick={() => executeLogout("/login")}/>')

with open('src/components/DiasporaDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated DiasporaDashboard.tsx')

