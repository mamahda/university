import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

def f(x):
    return np.log(x/1+x**2) - 4

def bisection_method(a, b, n):
    results = []
    for i in range(n):
        c = (a + b) / 2
        results.append((i + 1, a, b, c, f(a), f(b), f(c)))
        
        if abs(f(c)) < 1e-6:
            break
        elif f(a) * f(c) < 0:
            b = c
        else:
            a = c
    
    return results

def plot_bisection(a, b, n):
    results = bisection_method(a, b, n)
    if not results:
        return
    
    x = np.linspace(a - 1, b + 1, 400)
    y = f(x)
    
    plt.figure(figsize=(8, 5))
    plt.plot(x, y, label='f(x)')
    plt.axhline(0, color='black', linewidth=1)
    
    for i, (iter_num, a, b, c, fa, fb, fc) in enumerate(results):
        plt.scatter(c, f(c), color='red', label=f'Iterasi {iter_num}' if i == 0 else "")
        plt.annotate(f'{c:.4f}', (c, f(c)), textcoords="offset points", xytext=(0,10), ha='center')
    
    plt.xlabel('x')
    plt.ylabel('f(x)')
    plt.title('Visualisasi Metode Bolzano dengan f(x) = e^x - 3')
    plt.legend()
    plt.show()
    
    df = pd.DataFrame(results, columns=["Iterasi", "a", "b", "c", "f(a)", "f(b)", "f(c)"])
    print(df.to_string(index=False))

    df.to_csv("bisection_output.csv", index=False, sep="\t")
    print("\nHasil telah disimpan dalam file 'bisection_output.csv'")


x1 = input("Masukkan nilai x1(titik pertama): ")
x2 = input("Masukkan nilai x2(titik kedua): ")
iterasi = input("Masukkan jumlah iterasi: ")
plot_bisection(float(x1), float(x2), int(iterasi))
