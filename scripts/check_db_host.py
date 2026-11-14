from urllib.parse import urlparse

with open(r'e:\Projets_Cornerstone\site_crnstneros\capril_\.env', 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('DATABASE_URL='):
            url = line.split('=', 1)[1].strip().strip('\'"')
            p = urlparse(url)
            print('DATABASE_URL Host:', p.hostname, 'Port:', p.port, 'DB:', p.path)
            break

