from flask import Flask, jsonify, request
import os, time, hashlib
app=Flask(__name__)
@app.get("/")
def index():
    n=max(1,min(int(request.args.get("work","15000")),200000))
    x=b"cloud-dynamics"
    t=time.perf_counter()
    for _ in range(n): x=hashlib.sha256(x).digest()
    return jsonify(application="cpu-bound", work=n, elapsed_ms=(time.perf_counter()-t)*1000)
@app.get("/health")
def health(): return "ok\n"
@app.get("/metrics")
def metrics(): return "app_info{application=\"cpu-bound\"} 1\n",200,{"Content-Type":"text/plain"}
app.run(host="0.0.0.0",port=int(os.getenv("PORT","8080")),threaded=True)
