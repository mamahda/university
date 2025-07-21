#include <stdio.h>
#include <stdbool.h>
#include <string.h>

typedef struct {
  char name[101];
  float distance;
} Athlete;

void bubbleSort(Athlete jumper[], int n) {
  bool swap;
  do {
    swap = false;
    for (int i = 1; i < n; i++) {
      if (jumper[i].distance > jumper[i - 1].distance) {
        Athlete temp = jumper[i];
        jumper[i] = jumper[i - 1];
        jumper[i - 1] = temp;
        swap = true;
      }
    }
  } while(swap);
}

int main() {
  Athlete jumper[1001];
  FILE *fptr = fopen("./data.txt", "r");

  if (fptr == NULL) {
    perror("Error opening file");
    return 1;   
  }

  int count = 0;
  char tempName[101];
  float tempDistance;

  while (fscanf(fptr, "%s %f", tempName, &tempDistance) != EOF) {
    bool found = false;
    for(int i = 0; i < count; i++) {
      if(strcmp(jumper[i].name, tempName) == 0) { 
        if (fptr == NULL) {
          perror("Error opening file");
          return 1;  
        }
        if(jumper[i].distance < tempDistance) jumper[i].distance = tempDistance;
        found = true;
        break;
      }
    }
    if(!found) {
      strcpy(jumper[count].name, tempName);
      jumper[count].distance = tempDistance;
      count++;
    }
  }

  fclose(fptr);
  bubbleSort(jumper, count);

  int rank = 1;
  printf("+------+-----------+--------------+\n");
  printf("| %-4s | %-9s | %4s %5s\n", "Rank", "Name", "Distance", "|");
  printf("+------+-----------+--------------+\n");
  for (int i = 0; i < count; i++) {
    if(i >= 1 && (jumper[i].distance != jumper[i - 1].distance)) {
      rank = i + 1;
    }
    printf("| %-4d | %-9s | %4.2f meter %3s\n", rank, jumper[i].name, jumper[i].distance, "|");
  }
  printf("+------+-----------+--------------+\n");

  return 0;
}
