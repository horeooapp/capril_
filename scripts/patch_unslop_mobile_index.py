with open('native_apps/proprietaire/app/(tabs)/index.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace weight 800 with 600
text = text.replace("fontWeight: '800'", "fontWeight: '600'")

# Remove Sparkles import
text = text.replace("  Sparkles,\n", "")

with open('native_apps/proprietaire/app/(tabs)/index.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Mobile index unslopped successfully")

