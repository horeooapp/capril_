with open('src/app/admin/admin-v2.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Remove background sci-fi grid
old_bg = """  background-color: var(--bg-main);
  background-image: 
    linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;"""
new_bg = """  background-color: var(--bg-main);"""
css = css.replace(old_bg, new_bg)

# 2. Neutralize radial gradients on sidebar pseudo elements
old_before = """background:radial-gradient(circle,rgba(255,102,0,.1) 0%,transparent 70%);"""
new_before = """background:none;"""
css = css.replace(old_before, new_before)

old_after = """background:radial-gradient(circle,rgba(0,154,61,.08) 0%,transparent 70%);"""
new_after = """background:none;"""
css = css.replace(old_after, new_after)

# 3. Remove translateY transforms
css = css.replace("transform: translateY(-2px);", "/* transform: none */")
css = css.replace("transform: translateY(-5px) scale(1.01);", "/* transform: none */")
css = css.replace(".admin-v2 .bar:hover{filter:brightness(1.5); transform: translateY(-2px);}", ".admin-v2 .bar:hover{opacity: 0.9;}")

# 4. Chart bar shadow
css = css.replace("box-shadow: 0 4px 15px rgba(0,0,0,0.2);", "box-shadow: none;")

# 5. KPI card hover shadow
css = css.replace("box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);", "border-color: #CBD5E1;")

# 6. Weights & Tabular nums
css = css.replace(".admin-v2 .kpi-val{font-family:var(--font-head);font-size:26px;font-weight:800;letter-spacing:-0.5px;line-height:1;color:var(--text-main);}", ".admin-v2 .kpi-val{font-family:var(--font-head);font-size:24px;font-weight:600;letter-spacing:-0.02em;line-height:1;color:var(--text-main);font-variant-numeric:tabular-nums;}")
css = css.replace(".admin-v2 .page-title{font-family:var(--font-head);font-size:24px;font-weight:800;color:var(--text-main);letter-spacing:-0.5px}", ".admin-v2 .page-title{font-family:var(--font-head);font-size:22px;font-weight:600;color:var(--text-main);letter-spacing:-0.02em}")

# 7. Pill border radius
css = css.replace("border-radius:20px;font-size:11px;font-weight:700;", "border-radius:6px;font-size:11px;font-weight:500;")

with open('src/app/admin/admin-v2.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("admin-v2.css patched successfully!")

