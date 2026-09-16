#include <stdio.h>

int main(){
    long long a, b, c;
    int segitiga = 0;
    scanf("%lld %lld %lld", &a, &b, &c);

    if (a > b && a > c){
        if((a * a) == (b*b)+(c*c)) 
            segitiga = 1;
    }
    if (b > a && b > c){
        if((b * b) == (a*a)+(c*c)) 
            segitiga = 1;
    }
    if (c > b && c > a){
        if((c * c) == (b*b)+(a*a)) 
            segitiga = 1;
    }

    if(segitiga){
        printf("YEY GO GET ANOTHER ONE DHIKA!");
    }
    else{
        printf("OH NOOOO");
    }
}
