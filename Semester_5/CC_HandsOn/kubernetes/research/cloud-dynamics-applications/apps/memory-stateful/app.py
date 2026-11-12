from flask import Flask, jsonify, request
import os, time, threading
app=Flask(__name__); store=[]; lock=threading.Lock()
@app.get("/")
def index():
    kb=max(1,min(int(request.args.get("kb","4")),1024))
    with lock:
        store.append(os.urandom(kb*1024))
        count=len(store); total=sum(len(x) for x in store)
    return jsonify(application="memory-stateful", objects=count, allocated_bytes=total)
@app.post("/reset")
def reset():
    with lock: store.clear()
    return jsonify(status="reset")
@app.get("/health")
def health(): return "ok\n"
@app.get("/metrics")
def metrics():
    with lock: n=len(store); b=sum(len(x) for x in store)
    return f'app_objects {n}\napp_allocated_bytes {b}\n',200,{"Content-Type":"text/plain"}
app.run(host="0.0.0.0",port=int(os.getenv("PORT","8080")),threaded=True)
