with open('src/app/admin/admin-v2.css', 'r', encoding='utf-8') as f:
    text = f.read()

# Add no-scrollbar rules for admin portal
scrollbar_fix = """
/* HIDE VERTICAL & HORIZONTAL SCROLLBAR FOR ADMIN PORTAL */
html:has(.admin-v2),
body:has(.admin-v2),
.admin-v2,
.admin-v2 .main-content,
.admin-v2 .content,
.admin-v2 .nav {
  scrollbar-width: none !important; /* Firefox */
  -ms-overflow-style: none !important; /* IE and Edge */
}

html:has(.admin-v2)::-webkit-scrollbar,
body:has(.admin-v2)::-webkit-scrollbar,
.admin-v2::-webkit-scrollbar,
.admin-v2 .main-content::-webkit-scrollbar,
.admin-v2 .content::-webkit-scrollbar,
.admin-v2 .nav::-webkit-scrollbar,
.admin-v2 *::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}
"""

if "/* HIDE VERTICAL & HORIZONTAL SCROLLBAR FOR ADMIN PORTAL */" not in text:
    text = text + scrollbar_fix
    with open('src/app/admin/admin-v2.css', 'w', encoding='utf-8') as f:
        f.write(text)
    print("admin-v2.css updated")
else:
    print("Already present in admin-v2.css")

