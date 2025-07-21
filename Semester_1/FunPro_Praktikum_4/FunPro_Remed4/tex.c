#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Person
{
    char name[101];
    struct Person *relation;
    struct Person *next;
} Person;

Person *head = NULL;

Person *find_contact(char *name)
{
    Person *current = head;
    while (current != NULL)
    {
        if (strcmp(current->name, name) == 0)
        {
            return current;
        }
        current = current->next;
    }
    return NULL;
}

void add_person(char *name, char *relation_name)
{
    Person *new_person = (Person *)malloc(sizeof(Person));
    strcpy(new_person->name, name);
    new_person->next = head;
    head = new_person;

    if (strcmp(relation_name, "-") == 0)
    {
        new_person->relation = NULL;
    }
    else
    {
        new_person->relation = find_contact(relation_name);
    }
}

void print_relations()
{
    int relation_count = 1;
    Person *current = head;

    while (current != NULL)
    {
        printf("---Relation %d---\n", relation_count++);
        Person *relation = current;

        while (relation != NULL)
        {
            printf("%s", relation->name);
            relation = relation->relation;

            if (relation != NULL)
            {
                printf(" -> ");
            }
        }
        printf("\n");
        current = current->next;
    }
}

int main()
{
    int n;
    scanf("%d", &n);

    for (int i = 0; i < n; i++)
    {
        char name[101], relation_name[101];
        scanf("%s %s", name, relation_name);
        add_person(name, relation_name);
    }

    print_relations();

    return 0;
}