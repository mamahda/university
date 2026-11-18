#!/usr/bin/env python3
import argparse,csv,json,os,re,sys,time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen,Request

def parse_env(path):
    out={}
    for raw in Path(path).read_text().splitlines():
        s=raw.strip()
        if not s or s.startswith("#") or "=" not in s: continue
        k,v=s.split("=",1); out[k.strip()]=v.strip().strip('"').strip("'")
    return out

def prom_range(base,query,start,end,step):
    qs=urlencode({"query":query,"start":start,"end":end,"step":step})
    req=Request(base.rstrip("/")+"/api/v1/query_range?"+qs,headers={"User-Agent":"cloud-dynamics-metrics/1.0"})
    with urlopen(req,timeout=30) as r: obj=json.load(r)
    if obj.get("status")!="success": raise RuntimeError(obj)
    return obj.get("data",{}).get("result",[])

def flatten(series):
    rows=[]
    for item in series:
        labels=item.get("metric",{})
        label=",".join(f"{k}={v}" for k,v in sorted(labels.items()))
        for ts,val in item.get("values",[]):
            try: fv=float(val)
            except: continue
            rows.append((float(ts),label,fv))
    return rows

def write_metric(path,rows):
    with open(path,"w",newline="") as f:
        w=csv.writer(f); w.writerow(["timestamp_epoch","series","value"])
        w.writerows(rows)

def aggregate(rows):
    by={}
    for ts,_,v in rows: by.setdefault(round(ts,6),[]).append(v)
    return {k:sum(v)/len(v) for k,v in by.items()}

def nearest(d,t,tol):
    if not d:return ""
    candidates=[k for k in d if abs(k-t)<=tol]
    if not candidates:return ""
    k=min(candidates,key=lambda x:abs(x-t))
    return d[k]

def load_workload(path):
    with open(path,newline="") as f:return list(csv.DictReader(f))

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--experiment",required=True)
    p.add_argument("--prometheus-url",required=True)
    p.add_argument("--namespace",default="cloud-dynamics")
    p.add_argument("--queries",required=True)
    p.add_argument("--app")
    a=p.parse_args()
    exp=Path(a.experiment)
    win=parse_env(exp/"measurement-window.env")
    meta=json.loads((exp/"metadata.json").read_text())
    app=a.app or meta.get("application",{}).get("name","")
    if not app or app=="cloud-dynamics-app" or app=="unspecified":
        raise SystemExit("Application name is missing. Set APPLICATION_NAME in experiment metadata or pass --app.")
    start=float(win["MEASUREMENT_START_EPOCH"]); end=float(win["MEASUREMENT_END_EPOCH"])
    step=float(win.get("SAMPLE_INTERVAL","1"))
    qenv=parse_env(a.queries)
    datasets={}
    status=[]
    outdir=exp/"metrics"; outdir.mkdir(exist_ok=True)
    for name,q in qenv.items():
        q=q.replace("__NAMESPACE__",a.namespace).replace("__APP__",re.escape(app))
        try:
            rows=flatten(prom_range(a.prometheus_url,q,start,end,step))
            write_metric(outdir/(name.lower()+".csv"),rows)
            datasets[name]=aggregate(rows)
            status.append((name,"ok",len(rows),q))
        except Exception as e:
            write_metric(outdir/(name.lower()+".csv"),[])
            datasets[name]={}
            status.append((name,"error",0,q+" | "+str(e)))
    with open(outdir/"collection-status.csv","w",newline="") as f:
        w=csv.writer(f);w.writerow(["metric","status","rows","query"]);w.writerows(status)

    workload=load_workload(exp/"workload.csv")
    metric_names=list(qenv)
    with open(exp/"combined.csv","w",newline="") as f:
        base=list(workload[0].keys()) if workload else ["timestamp_epoch"]
        w=csv.DictWriter(f,fieldnames=base+metric_names)
        w.writeheader()
        for row in workload:
            t=float(row["timestamp_epoch"])
            out=dict(row)
            for n in metric_names: out[n]=nearest(datasets.get(n,{}),t,max(step,1.0)*1.5)
            w.writerow(out)
    summary={
      "experiment_id":win.get("EXPERIMENT_ID",exp.name),
      "application":app,"namespace":a.namespace,
      "prometheus_url":a.prometheus_url,
      "start_epoch":start,"end_epoch":end,"step":step,
      "metrics":{n:{"status":s,"rows":r} for n,s,r,_ in status}
    }
    (outdir/"collection-metadata.json").write_text(json.dumps(summary,indent=2))
    print("Created:",exp/"combined.csv")
    print("Metric directory:",outdir)

if __name__=="__main__":main()
