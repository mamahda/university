#include <stdio.h>
// 5025241134 Gilbran Mahdavikia Raja
int main()
{
    float base;
    float base1;
    float base2;
    float height;
    float side_length;
    float radius;

    printf("Input base: ");
    scanf("%f", &base);
    printf("Input base1: ");
    scanf("%f", &base1);
    printf("Input base2: ");
    scanf("%f", &base2);
    printf("Input height: ");
    scanf("%f", &height);
    printf("Input side length: ");
    scanf("%f", &side_length);
    printf("Input radius: ");
    scanf("%f", &radius);

    printf("Area of a Rectangle: ");
    printf("%f\n", base * height);
    printf("Area of a square: ");
    printf("%f\n", side_length * side_length);
    printf("Area of Triangle: ");
    printf("%f\n", base * height / 2);
    printf("Area of Parallelogram: ");
    printf("%f\n", base * height);
    printf("Area of Trapezoid: ");
    printf("%f\n", (base1 + base2) * height / 2);
    printf("Area of Cirle: ");
    printf("%f\n", radius * radius * 3.14159);
}