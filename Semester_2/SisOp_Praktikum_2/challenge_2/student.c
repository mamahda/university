#include <stdio.h>
#include <mqueue.h>

int main() {
    mqd_t mq = mq_open("/queue", O_CREAT | O_WRONLY, 0666, NULL);
    int nrp;
    scanf("%d", &nrp);
    mq_send(mq, (char*)&nrp, sizeof(nrp), 0);
    mq_close(mq);
    return 0;
}
