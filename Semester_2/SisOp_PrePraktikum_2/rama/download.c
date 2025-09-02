#include <stdio.h>
#include <stdlib.h>

int main(){
  char *argv[] = {
    "curl",
    "-s",
    "-l",
    "https://drive.google.com/file/d/1U1-9v9pJeX5MoofwoBHCcD9nA7YWy_np/view",
    "-o", 
    "./weather/kecamata_forecast.zip",
    NULL
  }
}
