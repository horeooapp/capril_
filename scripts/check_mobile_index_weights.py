with open('native_apps/proprietaire/app/(tabs)/index.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

count_800 = text.count("fontWeight: '800'")
count_700 = text.count("fontWeight: '700'")
count_999 = text.count("borderRadius: 999")
count_sparkles = text.count("Sparkles")
print(f"800: {count_800}, 700: {count_700}, 999: {count_999}, Sparkles: {count_sparkles}")

