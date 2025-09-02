#include <stdio.h>
#include <mqueue.h>
#include <unistd.h>

int main() {
  struct mq_attr attr;
  mqd_t mq = mq_open("/queue", O_RDONLY);
  mq_getattr(mq, &attr);
  int nrp;
  mq_receive(mq, (char*)&nrp, attr.mq_msgsize, NULL);

  if(nrp > 0){
    if (nrp < 10) printf("00");
    else if (nrp < 100) printf("0");

    printf("%d\n", nrp);

    sleep(5);
    if(nrp > 0 && nrp <= 80) printf("SNBP/IUP\n");
    else if(nrp > 80 && nrp <= 160) printf("SNBT\n");
    else printf("Mandiri\n");
  }

  mq_close(mq);
  mq_unlink("/queue");
  return 0;
}
