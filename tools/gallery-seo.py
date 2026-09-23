#!/usr/bin/env python3
"""Regenerate what search engines read about the gallery from assets/gallery/manifest.json:
the <noscript> list in gallery/index.html, the ImageGallery JSON-LD in its <head>,
and the image entries under /gallery in sitemap.xml. Run after editing the manifest."""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = 'https://prannayh.com'
PERSON = {'@type': 'Person', 'name': 'Prannay Hebbar', 'url': SITE + '/'}
items = json.load(open(ROOT / 'assets/gallery/manifest.json'))
photos = [i for i in items if i['kind'] == 'photo']
videos = [i for i in items if i['kind'] == 'video']

def noscript():
    lis = []
    for it in items:
        img = it.get('thumb') or it.get('poster')
        lis.append(f'      <li><a href="{it["src"]}"><img src="{img}" width="{it["w"]}" height="{it["h"]}" alt="{it["alt"]}" loading="lazy"></a></li>')
    return ('      <noscript>\n'
            f'      <p class="gallery__count">All photos · {len(items)}</p>\n'
            '      <ul class="gallery__static">\n' + '\n'.join(lis) + '\n      </ul>\n      </noscript>')

def jsonld():
    media = []
    for it in photos:
        media.append({'@type': 'ImageObject', 'contentUrl': SITE + it['src'], 'thumbnailUrl': SITE + it['thumb'],
                      'width': it['w'], 'height': it['h'], 'caption': it['alt'], 'name': it['alt'],
                      'creator': PERSON, 'copyrightHolder': PERSON, 'creditText': 'Prannay Hebbar',
                      'datePublished': str(it['year']), 'contentLocation': it['albumTitle']})
    for it in videos:
        media.append({'@type': 'VideoObject', 'contentUrl': SITE + it['src'], 'thumbnailUrl': SITE + it['poster'],
                      'width': it['w'], 'height': it['h'], 'name': it['alt'], 'description': it['alt'],
                      'duration': f'PT{it["duration"]}S', 'uploadDate': f'{it["year"]}-01-01', 'creator': PERSON})
    data = {'@context': 'https://schema.org', '@type': 'ImageGallery', 'name': 'Gallery · Prannay Hebbar',
            'url': SITE + '/gallery', 'description': 'Photos and short clips by Prannay Hebbar. Stanford, the Presidio, trips in the US, Halloween, around the Bay. 2024 – 2025.',
            'author': PERSON, 'about': PERSON, 'associatedMedia': media}
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '</script>'

def sitemap_gallery():
    imgs = ''.join(f'\n    <image:image><image:loc>{SITE}{it["src"]}</image:loc><image:title>{it["alt"]}</image:title></image:image>' for it in photos)
    return f'<url><loc>{SITE}/gallery</loc>{imgs}\n  </url>'

# gallery/index.html
p = ROOT / 'gallery/index.html'
s = p.read_text()
s, n = re.subn(r'      <noscript>\n      <p class="gallery__count">.*?</noscript>', noscript(), s, count=1, flags=re.S)
assert n == 1, 'noscript block not found'
ld = jsonld()
if 'application/ld+json' in s:
    s, n = re.subn(r'  <script type="application/ld\+json">.*?</script>\n', '  ' + ld + '\n', s, count=1, flags=re.S)
else:
    s = s.replace('</head>', '  ' + ld + '\n</head>', 1)
p.write_text(s)

# sitemap.xml
p = ROOT / 'sitemap.xml'
s = p.read_text()
if 'xmlns:image' not in s:
    s = s.replace('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
                  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">')
s, n = re.subn(r'<url><loc>https://prannayh\.com/gallery</loc>.*?</url>', sitemap_gallery(), s, count=1, flags=re.S)
assert n == 1, 'gallery url not in sitemap'
p.write_text(s)
print(f'{len(photos)} photos, {len(videos)} videos → noscript, JSON-LD, sitemap')
