#include <stdio.h>
#include <string.h>
#include <stdlib.h>

typedef struct
{
    int code;
    char name[100];
    int price;
    int stock;
} MenuItem;

void addMenuItem(MenuItem menu[], int *menuCount, int code, char *name, int price, int stock);
void removeMenuItem(MenuItem menu[], int *menuCount, int code);
void displayInfo(MenuItem menu[], int menuCount, int code);
void placeOrder(MenuItem menu[], int *menuCount, int code, int quantity, int *earnings);

int main()
{
    MenuItem menu[100];
    int menuCount = 0;
    int earnings = 0;

    char command[100];
    while (1)
    {
        scanf("%s", command);

        if (strcmp(command, "ADD") == 0)
        {
            int code, price, stock;
            char name[100];
            scanf("%d", &code);
            getchar();
            fgets(name, sizeof(name), stdin);
            name[strcspn(name, "\n")] = 0;
            scanf("%d %d", &price, &stock);

            addMenuItem(menu, &menuCount, code, name, price, stock);
        }
        else if (strcmp(command, "REMOVE") == 0)
        {
            int code;
            scanf("%d", &code);

            removeMenuItem(menu, &menuCount, code);
        }
        else if (strcmp(command, "INFO") == 0)
        {
            int code;
            scanf("%d", &code);

            displayInfo(menu, menuCount, code);
        }
        else if (strcmp(command, "ORDER") == 0)
        {
            int code, quantity;
            scanf("%d %d", &code, &quantity);

            placeOrder(menu, &menuCount, code, quantity, &earnings);
        }
        else if (strcmp(command, "CLOSE") == 0)
        {
            printf("Earnings: Rp%d\n", earnings);
            printf("Informatics canteen is closing... thanks for the visit!\n");
            break;
        }
    }

    return 0;
}

// Add a menu item
void addMenuItem(MenuItem menu[], int *menuCount, int code, char *name, int price, int stock)
{
    for (int i = 0; i < *menuCount; i++)
    {
        if (menu[i].code == code)
        {
            printf("Menu is already exists\n");
            return;
        }
    }
    menu[*menuCount].code = code;
    strcpy(menu[*menuCount].name, name);
    menu[*menuCount].price = price;
    menu[*menuCount].stock = stock;
    (*menuCount)++;
    printf("Menu added\n");
}

// Remove a menu item
void removeMenuItem(MenuItem menu[], int *menuCount, int code)
{
    for (int i = 0; i < *menuCount; i++)
    {
        if (menu[i].code == code)
        {
            for (int j = i; j < *menuCount - 1; j++)
            {
                menu[j] = menu[j + 1];
            }
            (*menuCount)--;
            printf("Menu removed\n");
            return;
        }
    }
    printf("Menu does not exists\n");
}

// Display information about a menu item
void displayInfo(MenuItem menu[], int menuCount, int code)
{
    for (int i = 0; i < menuCount; i++)
    {
        if (menu[i].code == code)
        {
            printf("#%d %s\n", menu[i].code, menu[i].name);
            printf("Price : Rp%d\n", menu[i].price);
            printf("Stock : %dx\n", menu[i].stock);
            return;
        }
    }
    printf("Menu does not exists\n");
}

// Place an order
void placeOrder(MenuItem menu[], int *menuCount, int code, int quantity, int *earnings)
{
    if (quantity == 0)
    {
        printf("So you want to order or what\n");
        return;
    }
    for (int i = 0; i < *menuCount; i++)
    {
        if (menu[i].code == code)
        {
            if (menu[i].stock < quantity)
            {
                printf("Apologize, the stock is not enough\n");
            }
            else
            {
                menu[i].stock -= quantity;
                int totalPrice = quantity * menu[i].price;
                *earnings += totalPrice;
                printf("Ordered %dx %s for Rp%d\n", quantity, menu[i].name, totalPrice);
            }
            return;
        }
    }
    printf("Menu does not exists\n");
}
