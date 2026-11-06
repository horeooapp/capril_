with open('src/app/admin/(authenticated)/layout.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = """            <style dangerouslySetInnerHTML={{__html: `
              body {
                background: #F8FAFC !important;
              }
            `}} />"""

replacement = """            <style dangerouslySetInnerHTML={{__html: `
              html, body {
                background: #F8FAFC !important;
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
              }
              html::-webkit-scrollbar,
              body::-webkit-scrollbar,
              *::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
              }
            `}} />"""

if target in text:
    text = text.replace(target, replacement, 1)
    with open('src/app/admin/(authenticated)/layout.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Admin layout style updated")
else:
    print("Target not found in layout.tsx")

