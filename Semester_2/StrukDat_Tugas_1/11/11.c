#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include <stdlib.h>
#include <math.h>

typedef struct {
  char name[256];
  double income;
  double expense;
  double profit;
} toko;

void bubbleSort(toko bazaar[], int n){
  bool swap;
  do {
    swap = false;
    for(int i = 1; i < n; i++){
      if(bazaar[i].profit > bazaar[i-1].profit){
        toko temp = bazaar[i];
        bazaar[i] = bazaar[i-1];
        bazaar[i-1] = temp;
        swap = true;
      }
    }
  } while(swap);
}

int main(){
  toko bazaar[1001];
  FILE *fptr = fopen("./data.txt", "r");
  if (fptr == NULL) {
    perror("Error opening file");
    return 1;  
  }
  
  int i = 0;
  while(fscanf(fptr, "%s %lf %lf", bazaar[i].name, &bazaar[i].income, &bazaar[i].expense) != EOF) {
    bazaar[i].profit = bazaar[i].income - bazaar[i].expense;
    i++;
  };

  fclose(fptr);
  bubbleSort(bazaar, i);
  
  printf("+------+----------------------+----------------+----------------+----------------+\n");
  printf("| %-4s | %-20s | %-14s | %-14s | %-14s |\n", "Rank", "Nama Toko", "Income", "Expense", "Profit");
  printf("+------+----------------------+----------------+----------------+----------------+\n");
  
  int rank = 1;
  for(int j = 0; j < i; j++){
    if(j >= 1 && (bazaar[j].profit != bazaar[j-1].profit)) {
      rank = j + 1;
    }
    
    if (bazaar[j].profit >= 0) {
      printf("| %-4d | %-20s | %-14.2lf | %-14.2lf | +%-13.2lf |\n", rank, bazaar[j].name, 
             bazaar[j].income, bazaar[j].expense, bazaar[j].profit);
    } else {
      printf("| %-4d | %-20s | %-14.2lf | %-14.2lf | -%-13.2lf |\n", rank, bazaar[j].name, 
             bazaar[j].income, bazaar[j].expense, fabs(bazaar[j].profit));
    }
  }
  
  printf("+------+----------------------+----------------+----------------+----------------+\n");
 
  return 0;
}
