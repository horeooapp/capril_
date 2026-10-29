import os
from PIL import Image, ImageOps

logo_path = 'public/logo.png'
if not os.path.exists(logo_path):
    print("Logo not found!")
    exit(1)

logo = Image.open(logo_path)
bbox = logo.getbbox()
emblem = logo.crop(bbox)

os.makedirs('public/icons', exist_ok=True)
os.makedirs('public/assets/icons', exist_ok=True)

# Generate square icon with safe padding
# safe_ratio: 0.72 for maskable icons (Android safe-zone is central 80% circle)
def make_icon(size, bg_color=(255, 255, 255, 255), safe_ratio=0.75):
    canvas = Image.new('RGBA', (size, size), bg_color)
    target_dim = int(size * safe_ratio)
    aspect = emblem.width / emblem.height
    if aspect > 1:
        ew = target_dim
        eh = int(target_dim / aspect)
    else:
        eh = target_dim
        ew = int(target_dim * aspect)
    
    resized = emblem.resize((ew, eh), Image.Resampling.LANCZOS)
    x = (size - ew) // 2
    y = (size - eh) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas

# 1. Standard PNG icons (Clean white background with centered QAPRIL emblem)
for size in [192, 512]:
    img = make_icon(size, bg_color=(255, 255, 255, 255), safe_ratio=0.76)
    img.save(f'public/icon-{size}.png', 'PNG')
    img.save(f'public/icons/icon-{size}.png', 'PNG')

# 2. Maskable icons (with full safe zone margin for circular/squircle cuts on Android & Windows)
for size in [192, 512]:
    img = make_icon(size, bg_color=(255, 255, 255, 255), safe_ratio=0.70)
    img.save(f'public/icons/icon-maskable-{size}.png', 'PNG')

# 3. Apple Touch Icon (180x180, iOS requires solid non-transparent background)
apple_icon = make_icon(180, bg_color=(255, 255, 255, 255), safe_ratio=0.76)
apple_icon.convert('RGB').save('public/apple-touch-icon.png', 'PNG')

# 4. Favicon (64x64 & 32x32)
fav = make_icon(64, bg_color=(255, 255, 255, 0), safe_ratio=0.90)
fav.save('public/favicon.png', 'PNG')

# 5. Sync webp icons in assets/icons
for size in [48, 72, 96, 128, 192, 256, 512]:
    img = make_icon(size, bg_color=(255, 255, 255, 255), safe_ratio=0.75)
    img.convert('RGB').save(f'public/assets/icons/icon-{size}.webp', 'WEBP')

print("All PWA icons generated successfully!")

