t = int(input())
avg = 0
count = 0

for i in range(t):
    n = int(input())
    if n > 0:
        avg += n
        count += 1

if count > 0:
    print(f"{avg / count:.2f}")
else:
    print("No positive numbers")
