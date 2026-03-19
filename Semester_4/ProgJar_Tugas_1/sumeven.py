t = int(input())
sum_even = 0

for i in range(t):
    n = int(input())

    if n % 2 == 0:
        sum_even += n

print(sum_even)
