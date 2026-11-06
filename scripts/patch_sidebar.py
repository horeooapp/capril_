with open("src/components/admin/AdminSidebar.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = 'Notifications WhatsApp</a>' if 'Notifications WhatsApp</a>' in content else 'Notifications WhatsApp\n            </Link>'
if target not in content:
    target = 'Notifications WhatsApp\r\n            </Link>'

sms_link = '''
            <Link href="/admin/sms" className={`nav-item ${pathname === '/admin/sms' ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none"><path d="M2 3h12a1 1 0 011 1v7a1 1 0 01-1 1H4l-3 3V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              Passerelle SMS Orange
            </Link>'''

if target in content:
    content = content.replace(target, target + sms_link, 1)
    with open("src/components/admin/AdminSidebar.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully patched AdminSidebar.tsx!")
else:
    print("Target not found in AdminSidebar.tsx")

