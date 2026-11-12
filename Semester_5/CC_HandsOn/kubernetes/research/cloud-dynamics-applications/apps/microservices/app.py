from flask import Flask, jsonify
import os, time, urllib.request
app=Flask(__name__)
role=os.getenv("ROLE","frontend")
@app.get("/")
def index():
    if role=="backend":
        return jsonify(service="backend", timestamp=time.time())
    url=os.getenv("BACKEND_URL","http://backend:8080/")
    t=time.perf_counter()
    with urllib.request.urlopen(url,timeout=3) as r: body=r.read().decode()
    return jsonify(service="frontend", backend=body, backend_elapsed_ms=(time.perf_counter()-t)*1000)
@app.get("/health")
def health(): return "ok\n"
@app.get("/metrics")
def metrics(): return f'app_info{{application="microservices",role="{role}"}} 1\n',200,{"Content-Type":"text/plain"}
app.run(host="0.0.0.0",port=int(os.getenv("PORT","8080")),threaded=True)
