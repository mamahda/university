#!/usr/bin/env python3
import argparse,csv,json,statistics,math
from pathlib import Path
def read(p):
 with open(p,newline="") as f:return list(csv.DictReader(f))
def nums(rs,c):
 out=[]
 for x in rs:
  try:
   v=float(x.get(c,""));
   if math.isfinite(v):out.append(v)
  except:pass
 return out
def pct(x,p):
 x=sorted(x); k=(len(x)-1)*p; a=int(k); b=min(a+1,len(x)-1); return x[a]+(x[b]-x[a])*(k-a)
def one(e,o):
 rs=read(e/'combined.csv'); o.mkdir(parents=True,exist_ok=True); rows=[]
 for c in (rs[0].keys() if rs else []):
  x=nums(rs,c)
  if x:
   m=statistics.fmean(x); s=statistics.stdev(x) if len(x)>1 else 0
   rows.append(dict(metric=c,n=len(x),mean=m,std=s,min=min(x),p50=pct(x,.5),p95=pct(x,.95),max=max(x),cv=s/m if m else None))
 with open(o/'descriptive-statistics.csv','w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=['metric','n','mean','std','min','p50','p95','max','cv']);w.writeheader();w.writerows(rows)
 return {'experiment_id':e.name,'rows':len(rs)}
def main():
 p=argparse.ArgumentParser();s=p.add_subparsers(dest='cmd',required=True)
 q=s.add_parser('experiment');q.add_argument('--experiment',required=True);q.add_argument('--output',required=True)
 q=s.add_parser('campaign');q.add_argument('--results',required=True);q.add_argument('--output',required=True);a=p.parse_args()
 if a.cmd=='experiment':one(Path(a.experiment),Path(a.output))
 else:
  rec=[]
  for e in sorted(Path(a.results).iterdir()):
   if e.is_dir() and (e/'combined.csv').exists():rec.append(one(e,Path(a.output)/'experiments'/e.name))
  Path(a.output).mkdir(parents=True,exist_ok=True)
  with open(Path(a.output)/'campaign-summary.csv','w',newline='') as f:
   w=csv.DictWriter(f,fieldnames=['experiment_id','rows']);w.writeheader();w.writerows(rec)
  print('Analyzed',len(rec),'experiments')
if __name__=='__main__':main()
