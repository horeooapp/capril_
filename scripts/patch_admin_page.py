with open('src/app/admin/(authenticated)/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Remove kpi-glow
code = code.replace('<div className="kpi-glow"></div>', '')

# 2. Fix rainbow chart bars
old_bar = """<div 
                                        className={`bar ${idx % 2 === 0 ? 'orange' : 'vert'}`} 
                                        style={{ height: `${(t.amount / maxTrendAmount) * 90 + 5}%` }}
                                        title={`${t.amount.toLocaleString()} F`}
                                    ></div>"""

new_bar = """<div 
                                        className="bar" 
                                        style={{ 
                                            height: `${(t.amount / maxTrendAmount) * 90 + 5}%`,
                                            backgroundColor: idx === currentTrend.length - 1 ? 'var(--ci-vert)' : '#CBD5E1',
                                            borderRadius: '6px 6px 2px 2px'
                                        }}
                                        title={`${t.amount.toLocaleString()} F`}
                                    ></div>"""
code = code.replace(old_bar, new_bar)

# 3. Fix CDC-CI gradient card
old_cdc = """<div className="mm-card mtn-card mt-2 col-span-2" style={{ background: 'linear-gradient(135deg, var(--ci-nuit), #3b82f6)', color: '#fff' }}>"""
new_cdc = """<div className="mm-card mtn-card mt-2 col-span-2" style={{ backgroundColor: '#0F172A', color: '#fff', border: '1px solid #1E293B', borderRadius: '10px' }}>"""
code = code.replace(old_cdc, new_cdc)

# 4. Clean up uppercase font-black in modules grid
code = code.replace('text-xl font-black text-gray-900', 'text-xl font-semibold text-slate-900 font-mono')
code = code.replace('text-[10px] uppercase text-gray-500 font-bold', 'text-[11px] text-slate-500 font-medium')

# 5. Clean up font-weight: 800 in bottom row
code = code.replace("fontWeight: 800", "fontWeight: 600, fontVariantNumeric: 'tabular-nums'")

with open('src/app/admin/(authenticated)/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("page.tsx patched successfully!")

