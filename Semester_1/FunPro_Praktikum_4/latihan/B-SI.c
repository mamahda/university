#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define TABLE_SIZE 10007

struct peti
{
    int id;
    char isi[100];
    struct peti *next;
};

struct HashTable
{
    struct peti *table[TABLE_SIZE];
};

int hash(int key)
{
    return key % TABLE_SIZE;
}

void insert(struct HashTable *ht, int id, char *isi)
{
    int index = hash(id);

    struct peti *newPeti = malloc(sizeof(struct peti));
    newPeti->id = id;
    strcpy(newPeti->isi, isi);
    newPeti->next = NULL;

    if (ht->table[index] == NULL)
    {
        ht->table[index] = newPeti;
    }
    else
    {
        newPeti->next = ht->table[index];
        ht->table[index] = newPeti;
    }
}

struct peti *search(struct HashTable *ht, int id)
{
    int index = hash(id);
    struct peti *current = ht->table[index];

    while (current != NULL)
    {
        if (current->id == id)
        {
            return current;
        }
        current = current->next;
    }
    return NULL;
}

int main()
{
    int n, q;
    scanf("%d %d", &n, &q);
    struct HashTable ht = {0};

    // masukin data
    for (int i = 0; i < n; i++)
    {
        int id;
        char isi[100];
        scanf("%d %99s", &id, isi);
        insert(&ht, id, isi);
    }

    // cari data
    while (q--)
    {
        int cari;
        scanf("%d", &cari);
        struct peti *result = search(&ht, cari);
        if (result != NULL)
        {
            printf("%s\n", result->isi);
        }
        else
        {
            printf("========= Emangnya ada isinya? ============\n");
        }
    }
    return 0;
}