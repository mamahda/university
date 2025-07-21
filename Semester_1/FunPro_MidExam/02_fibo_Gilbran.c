#include <stdio.h>
#include <stdlib.h>
#include <time.h>

long long RecurFibo(unsigned long long n)
{
    if (n == 0)
    {
        return 0;
    }
    else if (n == 1)
    {
        return 1;
    }
    else
    {
        return (RecurFibo(n - 1) + RecurFibo(n - 2));
    }
}

long long sumfibo(unsigned long long n)
{
    if (n == 0)
    {
        return 0;
    }
    else if (n == 1)
    {
        return 1;
    }
    else
    {
        return RecurFibo(n) + sumfibo(n - 1);
    }
}

int main()
{
    unsigned long long n;
    long long sum;
    printf("Enter a number: ");
    scanf("%llu", &n);

    struct timespec start, end;
    long long sec, nanosec;
    long long timeiter, timerecur;

    printf("\nIterative\n");
    clock_gettime(CLOCK_MONOTONIC, &start);

    long long iterfibo[n + 1];
    iterfibo[0] = 0;
    iterfibo[1] = 1;
    sum = 1;

    for (unsigned long long i = 2; i <= n; i++)
    {
        iterfibo[i] = iterfibo[i - 1] + iterfibo[i - 2];
        sum += iterfibo[i];
    }

    clock_gettime(CLOCK_MONOTONIC, &end);
    sec = end.tv_sec - start.tv_sec;
    nanosec = end.tv_nsec - start.tv_nsec;
    timeiter = (sec * 1000000000) + nanosec;

    if (n > 3)
    {
        printf("%lluth Fibonacci = %lld\n", n, iterfibo[n]);
        printf("Sum of Fibonacci until %lluth term = %lld\n", n, sum);
    }
    else if (n == 1)
    {
        printf("%llust Fibonacci = %lld\n", n, iterfibo[n]);
        printf("Sum of Fibonacci until %llust term = %lld\n", n, sum);
    }
    else if (n == 2)
    {
        printf("%llund Fibonacci = %lld\n", n, iterfibo[n]);
        printf("Sum of Fibonacci until %llund term = %lld\n", n, sum);
    }
    else if (n == 3)
    {
        printf("%llurd Fibonacci = %lld\n", n, iterfibo[n]);
        printf("Sum of Fibonacci until %llurd term = %lld\n", n, sum);
    }
    printf("Iterative time: %lld nanoseconds\n", timeiter);

    printf("\nRecursive\n");
    clock_gettime(CLOCK_MONOTONIC, &start);
    long long recurfib = RecurFibo(n);
    long long sumfib = sumfibo(n);
    clock_gettime(CLOCK_MONOTONIC, &end);
    sec = end.tv_sec - start.tv_sec;
    nanosec = end.tv_nsec - start.tv_nsec;
    timerecur = (sec * 1000000000) + nanosec;

    if (n > 3)
    {
        printf("%lluth Fibonacci = %lld\n", n, recurfib);
        printf("Sum of Fibonacci until %lluth term = %lld\n", n, sumfib);
    }
    else if (n == 1)
    {
        printf("%llust Fibonacci = %lld\n", n, recurfib);
        printf("Sum of Fibonacci until %llust term = %lld\n", n, sumfib);
    }
    else if (n == 2)
    {
        printf("%llund Fibonacci = %lld\n", n, recurfib);
        printf("Sum of Fibonacci until %llund term = %lld\n", n, sumfib);
    }
    else if (n == 3)
    {
        printf("%llurd Fibonacci = %lld\n", n, recurfib);
        printf("Sum of Fibonacci until %llurd term = %lld\n", n, sumfib);
    }
    printf("Recursive time: %lld nanoseconds\n", timerecur);

    if (timeiter > timerecur)
        printf("\nIterative method is faster than recursive method by %lld nanoseconds\n", timeiter - timerecur);
    else if (timerecur > timeiter)
        printf("\nRecursive method is faster than iterative method by %lld nanoseconds\n", timerecur - timeiter);

    return 0;
}
