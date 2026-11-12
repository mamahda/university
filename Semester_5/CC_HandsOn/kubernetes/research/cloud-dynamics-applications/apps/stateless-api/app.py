from flask import Flask, jsonify
import os, time
app=Flask(__name__)
@app.get("/")
def index(): return jsonify(versi='0.0.2',application="stateless-api", status="ok", ts=time.time())
@app.get("/health")
def health(): return "ok\n"
@app.get("/metrics")
def metrics(): return "app_info{application=\"stateless-api\"} 1\n",200,{"Content-Type":"text/plain"}
app.run(host="0.0.0.0",port=int(os.getenv("PORT","8080")),threaded=True)
