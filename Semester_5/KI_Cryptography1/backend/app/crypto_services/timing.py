"""Optional phase timings; no database or application configuration dependencies."""

from contextlib import contextmanager
from time import perf_counter_ns

Timings = list[tuple[str, int]]


@contextmanager
def measure(operation: str, timings: Timings | None):
    if timings is None:
        yield
        return
    started = perf_counter_ns()
    yield
    timings.append((operation, perf_counter_ns() - started))
