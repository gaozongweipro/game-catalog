import json
d=json.load(open('public/data/games.json'))
d=[g for g in d if g.get('cover_url','').startswith('http')]
d.sort(key=lambda g:str(g.get('release_date')),reverse=True)
seen=set();out=[]
for g in d:
    k=(g.get('title_en') or '')[:20]
    if k in seen: continue
    seen.add(k);out.append(g['cover_url'])
    if len(out)>=24: break
json.dump(out,open('src/splash-covers.json','w'))
print(len(out))
