from collections import Counter

str = input()

counter = Counter(str)
for char, count in counter.items():
    print(f"{char}={count}")
