from flask import Flask, jsonify
import os, time, psycopg
app=Flask(__name__)
def conn():
    return psycopg.connect(host=os.getenv("DB_HOST","postgres"), dbname=os.getenv("DB_NAME","app"),
      user=os.getenv("DB_USER","app"), password=os.getenv("DB_PASSWORD","app"))
@app.get("/")
def index():
    t=time.perf_counter()
    with conn() as c:
        with c.cursor() as cur:
            cur.execute("CREATE TABLE IF NOT EXISTS hits(id BIGSERIAL PRIMARY KEY, created_at TIMESTAMPTZ DEFAULT now())")
            cur.execute("INSERT INTO hits DEFAULT VALUES RETURNING id"); row=cur.fetchone()[0]
            cur.execute("SELECT count(*) FROM hits"); count=cur.fetchone()[0]
        c.commit()
    return jsonify(application="database-api", id=row, rows=count, db_elapsed_ms=(time.perf_counter()-t)*1000)
@app.get("/health")
def health():
    try:
        with conn() as c:
            with c.cursor() as cur: cur.execute("SELECT 1")
        return "ok\n"
    except Exception as e: return str(e),503
@app.get("/metrics")
def metrics(): return 'app_info{application="database-api"} 1\n',200,{"Content-Type":"text/plain"}
app.run(host="0.0.0.0",port=int(os.getenv("PORT","8080")),threaded=True)
