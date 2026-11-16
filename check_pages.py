import pymupdf

docs = [
    ('doc3', 'THEHAMMER Fire Pumb 1250 GPM 8 bar.pdf'),
    ('doc4', 'THEHAMMER Fire Pumb 1250 GPM.pdf'),
    ('doc5', 'THEHAMMER Fire Pumb 1500 GPM 8 bar.pdf')
]

for label, fname in docs:
    d = pymupdf.open('images/catalogs/' + fname)
    print(f"=== {label}: {fname} ({len(d)} pages) ===")
    for pno in range(len(d)):
        page = d[pno]
        txt = page.get_text().strip()
        first_few = [l.strip() for l in txt.split('\n') if l.strip()][:3]
        print(f"Page {pno+1}: text len={len(txt)}, sample={first_few}")
