from PIL import Image
import os

def make_square(path):
    if not os.path.exists(path):
        return
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    max_dim = max(w, h, 1024)
    new_img = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
    offset = ((max_dim - w) // 2, (max_dim - h) // 2)
    new_img.paste(img, offset)
    new_img.save(path)
    print(f"Resized {path}: {img.size} -> {new_img.size}")

for app in ['native_apps/locataire', 'native_apps/proprietaire']:
    make_square(f"{app}/assets/icon.png")
    make_square(f"{app}/assets/adaptive-icon.png")

