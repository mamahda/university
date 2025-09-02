import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

def f(x):
    return np.log(x/1+x**2) - 4

def regula_falsi_method(a, b, n):
    results = []
    for i in range(n):
        c = (a * f(b) - b * f(a)) / (f(b) - f(a))
        results.append((i + 1, a, b, c, f(a), f(b), f(c)))
        
        if abs(f(c)) < 1e-6:
            break
        elif f(a) * f(c) < 0:
            b = c
        else:
            a = c
    
    return results

def plot_regula_falsi(a, b, n):
    results = regula_falsi_method(a, b, n)
    if not results:
        return
   
    
    df = pd.DataFrame(results, columns=["Iterasi", "a", "b", "c", "f(a)", "f(b)", "f(c)"])
    print(df.to_string(index=False))
    df.to_csv("regula_falsi_output.csv", index=False, sep="\t")
    print("\nHasil telah disimpan dalam file 'regula_falsi_output.csv'")

try:
    x1 = float(input("Masukkan nilai x1 (titik pertama): "))
    x2 = float(input("Masukkan nilai x2 (titik kedua): "))
    iterasi = int(input("Masukkan jumlah iterasi: "))
    plot_regula_falsi(x1, x2, iterasi)
except ValueError:
    print("Error: Masukkan harus berupa angka.")
