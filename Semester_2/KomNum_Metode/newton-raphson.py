import numpy as np
import sympy as sp
import pandas as pd

x = sp.symbols('x')

#f = -0.875*x**2 + 1.75*x + 2.625 # 3
#f = -2.1 + 6.21*x - 3.9*x**2 + 0.667*x**3 # 4
#f = -23.33 + 79.35*x - 88.09*x**2 + 41.6*x**3 - 8.68*x**4 + 0.658*x**5 # 5
f_deriv = sp.diff(f, x)

def function(x_val):
    f_eval = f.subs(x, x_val)
    f_deriv_eval = f_deriv.subs(x, x_val)
    return f_eval / f_deriv_eval if f_deriv_eval != 0 else float('inf')

def error(x1, x0):
    return abs((x1 - x0) / x1) if x1 != 0 else 0

def newtonraphson(x0, n):
    results = []
    
    for i in range(n):
        x1 = x0 - function(x0)
        err = error(x1, x0)
        results.append((i + 1, x0, x1, err))
        x0 = x1
    
    df = pd.DataFrame(results, columns=["Iterasi", "x0", "x1", "Error (%)"])
    df["Iterasi"] = df["Iterasi"].astype(int)
    
    df.iloc[:, 1:] = df.iloc[:, 1:].map(lambda x: f"{x:.5f}")

    print(df.to_string(index=False))

n = int(input("Masukkan jumlah iterasi: "))
x0 = float(input("Masukkan nilai x0: "))

newtonraphson(x0, n)

