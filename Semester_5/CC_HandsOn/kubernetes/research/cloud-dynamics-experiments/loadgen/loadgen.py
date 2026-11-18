#!/usr/bin/env python3
"""Dependency-free controlled HTTP workload generator for Cloud Dynamics controlled experiments."""
import argparse, csv, math, random, statistics, threading, time
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

def args():
    p = argparse.ArgumentParser()
    p.add_argument("--url", required=True)
    p.add_argument("--profile", choices=["constant","ramp","burst","periodic","variable"], required=True)
    p.add_argument("--duration", type=float, required=True)
    p.add_argument("--timeout", type=float, default=5)
    p.add_argument("--sample-interval", type=float, default=1)
    p.add_argument("--output")
    p.add_argument("--discard-output", action="store_true")
    p.add_argument("--rps", type=float)
    p.add_argument("--start-rps", type=float)
    p.add_argument("--end-rps", type=float)
    p.add_argument("--base-rps", type=float)
    p.add_argument("--burst-rps", type=float)
    p.add_argument("--burst-start", type=float, default=0)
    p.add_argument("--burst-duration", type=float, default=0)
    p.add_argument("--min-rps", type=float)
    p.add_argument("--max-rps", type=float)
    p.add_argument("--period-seconds", type=float, default=60)
    p.add_argument("--change-interval", type=float, default=30)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--workers", type=int, default=256)
    return p.parse_args()

def percentile(vals, q):
    if not vals: return 0.0
    s = sorted(vals)
    i = min(len(s)-1, max(0, math.ceil(q*len(s))-1))
    return s[i]

def target_rate(a, elapsed, rng, variable_state):
    if a.profile == "constant":
        return max(0.0, a.rps)
    if a.profile == "ramp":
        f = min(1.0, max(0.0, elapsed / max(a.duration, 1e-9)))
        return max(0.0, a.start_rps + (a.end_rps-a.start_rps)*f)
    if a.profile == "burst":
        inside = a.burst_start <= elapsed < a.burst_start + a.burst_duration
        return max(0.0, a.burst_rps if inside else a.base_rps)
    if a.profile == "periodic":
        mid = (a.min_rps+a.max_rps)/2
        amp = (a.max_rps-a.min_rps)/2
        return max(0.0, mid + amp*math.sin(2*math.pi*elapsed/max(a.period_seconds,1e-9)))
    bucket = int(elapsed // max(a.change_interval, 1e-9))
    if variable_state[0] != bucket:
        variable_state[:] = [bucket, rng.uniform(a.min_rps, a.max_rps)]
    return max(0.0, variable_state[1])

def one_request(url, timeout):
    t0 = time.perf_counter()
    ok = False
    try:
        req = Request(url, headers={"User-Agent":"cloud-dynamics-stage3/1.0"})
        with urlopen(req, timeout=timeout) as r:
            r.read(1)
            ok = 200 <= getattr(r, "status", 200) < 400
    except (URLError, HTTPError, TimeoutError, OSError):
        ok = False
    return ok, (time.perf_counter()-t0)*1000.0

def main():
    a = args()
    rng = random.Random(a.seed)
    variable_state = [-1, 0.0]
    start = time.monotonic()
    next_sample = start + a.sample_interval
    next_send = start
    rows, futures = [], []
    lock = threading.Lock()
    interval_sent = 0

    out = None
    writer = None
    if not a.discard_output:
        if not a.output:
            raise SystemExit("--output is required unless --discard-output is used")
        out = open(a.output, "w", newline="")
        writer = csv.writer(out)
        writer.writerow(["timestamp_epoch","elapsed_s","target_rps","sent","success","failed",
                         "achieved_rps","mean_latency_ms","p95_latency_ms"])

    with ThreadPoolExecutor(max_workers=a.workers) as pool:
        while True:
            now = time.monotonic()
            elapsed = now-start
            if elapsed >= a.duration:
                break
            rate = target_rate(a, elapsed, rng, variable_state)
            if rate <= 0:
                time.sleep(min(0.05, a.duration-elapsed))
            elif now >= next_send:
                futures.append(pool.submit(one_request, a.url, a.timeout))
                interval_sent += 1
                next_send = max(next_send + 1.0/rate, now)
            else:
                time.sleep(min(0.005, next_send-now))

            now = time.monotonic()
            if now >= next_sample:
                done, pending = [], []
                for f in futures:
                    (done if f.done() else pending).append(f)
                futures = pending
                results = [f.result() for f in done]
                success = sum(1 for ok,_ in results if ok)
                failed = len(results)-success
                lat = [ms for _,ms in results]
                sample_elapsed = now-start
                sample_rate = target_rate(a, sample_elapsed, rng, variable_state)
                row = [f"{time.time():.6f}", f"{sample_elapsed:.3f}", f"{sample_rate:.3f}",
                       interval_sent, success, failed,
                       f"{interval_sent/a.sample_interval:.3f}",
                       f"{statistics.mean(lat) if lat else 0:.3f}",
                       f"{percentile(lat,0.95):.3f}"]
                if writer:
                    writer.writerow(row); out.flush()
                interval_sent = 0
                next_sample += a.sample_interval

        # Wait for outstanding requests, but do not extend offered-load scheduling.
        results = [f.result() for f in futures]
        if writer and (results or interval_sent):
            success = sum(1 for ok,_ in results if ok)
            failed = len(results)-success
            lat = [ms for _,ms in results]
            elapsed = time.monotonic()-start
            rate = target_rate(a, min(elapsed,a.duration), rng, variable_state)
            writer.writerow([f"{time.time():.6f}", f"{elapsed:.3f}", f"{rate:.3f}",
                             interval_sent, success, failed,
                             f"{interval_sent/a.sample_interval:.3f}",
                             f"{statistics.mean(lat) if lat else 0:.3f}",
                             f"{percentile(lat,0.95):.3f}"])
    if out:
        out.close()

if __name__ == "__main__":
    main()
