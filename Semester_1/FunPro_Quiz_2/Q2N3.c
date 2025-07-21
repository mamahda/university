#include <stdio.h>
#include <stdlib.h>
#include <limits.h>
#define N 8
// Structure to represent a cell in the chessboard
typedef struct
{
    int x, y;
    int distance; // Stores the number of moves taken to reach this cell
} Cell;
// Valid moves for a horse/knight on the chessboard
int rowMoves[] = {2, 2, -2, -2, 1, 1, -1, -1};
int colMoves[] = {-1, 1, -1, 1, 2, -2, 2, -2};
// Check if a cell is within the bounds of the chessboard
int isValid(int x, int y)
{
    return (x >= 0 && y >= 0 && x < N && y < N);
}
// Queue node structure for BFS
typedef struct QueueNode
{
    Cell cell;
    struct QueueNode *next;
} QueueNode;
// Queue data structure with head and tail pointers
typedef struct
{
    QueueNode *head, *tail;
} Queue;
// Initialize an empty queue
void initQueue(Queue *queue)
{
    queue->head = queue->tail = NULL;
}
// Enqueue a cell with its distance to the queue
void enqueue(Queue *queue, int x, int y, int distance)
{
    QueueNode *newNode = (QueueNode
                              *)malloc(sizeof(QueueNode));
    newNode->cell.x = x;
    newNode->cell.y = y;
    newNode->cell.distance = distance;
    newNode->next = NULL;
    if (queue->tail)
    {
        queue->tail->next = newNode;
    }
    else
    {
        queue->head = newNode;
    }
    queue->tail = newNode;
}
// Dequeue a cell from the front of the queue
Cell dequeue(Queue *queue)
{
    QueueNode *temp = queue->head;
    Cell cell = temp->cell;
    queue->head = queue->head->next;
    if (!queue->head)
    {
        queue->tail = NULL;
    }
    free(temp);
    return cell;
}
// Check if the queue is empty
int isEmpty(Queue *queue)
{
    return queue->head == NULL;
}
// BFS function to find the minimum steps for horse/knight to reach the destination
int findMinSteps(int startX, int startY, int destX, int destY)
{
    // If starting position is the same as destination
    if (startX == destX && startY == destY)
        return 0;
    int visited[N][N] = {0}; // To keep track of visited cells
    Queue queue;
    initQueue(&queue);
    // Enqueue the starting position with 0 distance
    enqueue(&queue, startX, startY, 0);
    visited[startX][startY] = 1;
    while (!isEmpty(&queue))
    {
        // Get the front cell from the queue
        Cell cell = dequeue(&queue);
        // Check all possible moves for the knight
        for (int i = 0; i < 8; i++)
        {
            int newX = cell.x + rowMoves[i];
            int newY = cell.y + colMoves[i];
            // If the new position is valid and not visited yet
            if (isValid(newX, newY) && !visited[newX][newY])
            {
                // If the destination is reached, return the distance
                if (newX == destX && newY == destY)
                {
                    return cell.distance + 1;
                }
                // Otherwise, enqueue the new position and mark it as visited
                enqueue(&queue, newX, newY, cell.distance + 1);
                visited[newX][newY] = 1;
            }
        }
    }
    // Return a large value if destination is unreachable (shouldn’t happen on 8x8 board)
    return INT_MAX;
}
int main()
{
    int startX, startY, destX, destY;
    // Input: starting and destination positions
    printf("Enter starting position (row col): ");
    scanf("%d %d", &startX, &startY);
    printf("Enter destination position (row col): ");
    scanf("%d %d", &destX, &destY);
    int steps = findMinSteps(startX, startY, destX, destY);
    printf("Steps required: %d\n", steps);
    return 0;
}