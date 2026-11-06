with open("src/app/dashboard/(portal)/float/page.tsx", "r", encoding="utf-8") as f:
    c = f.read()

target = """                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors">
                    + Nouveau Pool
                </button>"""

replacement = """                <Link href="/dashboard/wallet" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors inline-block">
                    + Configurer Trésorerie
                </Link>"""

if target in c:
    c = c.replace(target, replacement)
    with open("src/app/dashboard/(portal)/float/page.tsx", "w", encoding="utf-8") as f:
        f.write(c)
    print("float/page.tsx updated successfully!")
else:
    # check CRLF
    target_crlf = target.replace("\n", "\r\n")
    replacement_crlf = replacement.replace("\n", "\r\n")
    if target_crlf in c:
        c = c.replace(target_crlf, replacement_crlf)
        with open("src/app/dashboard/(portal)/float/page.tsx", "w", encoding="utf-8") as f:
            f.write(c)
        print("float/page.tsx updated with CRLF successfully!")
    else:
        print("Target not found in float/page.tsx")

