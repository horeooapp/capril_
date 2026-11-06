with open('native_apps/proprietaire/app/(tabs)/properties.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace extreme fontWeights (800) with 600 / 500
text = text.replace("fontWeight: '800'", "fontWeight: '600'")
text = text.replace("fontWeight: '700'", "fontWeight: '500'")

# Replace radius 999 on badges with nested radius 6
text = text.replace("borderRadius: 999", "borderRadius: 6")

# Card radius from 18 to 16
text = text.replace("borderRadius: 18", "borderRadius: 16")

with open('native_apps/proprietaire/app/(tabs)/properties.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Properties screen unslopped successfully")

