from flask import Flask, jsonify
import os, time, redis
app=Flask(__name__)
r=redis.Redis(host=os.getenv("REDIS_HOST","redis"),port=6379,decode_responses=True)
@app.get("/")
def index():
    t=time.perf_counter(); n=r.incr("requests")
    return jsonify(application="cache-api", counter=n, redis_elapsed_ms=(time.perf_counter()-t)*1000)
@app.get("/health")
def health():
    try: r.ping(); return "ok\n"
    except Exception as e: return str(e),503
@app.get("/metrics")
def metrics(): return 'app_info{application="cache-api"} 1\n',200,{"Content-Type":"text/plain"}
app.run(host="0.0.0.0",port=int(os.getenv("PORT","8080")),threaded=True)
