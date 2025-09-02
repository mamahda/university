# Pipip's Load Balancer

Pipip, seorang pengembang perangkat lunak yang tengah mengerjakan proyek distribusi pesan dengan sistem load balancing, memutuskan untuk merancang sebuah sistem yang memungkinkan pesan dari client bisa disalurkan secara efisien ke beberapa worker. Dengan menggunakan komunikasi antar-proses (IPC), Pipip ingin memastikan bahwa proses pengiriman pesan berjalan mulus dan terorganisir dengan baik, melalui sistem log yang tercatat dengan rapi.

### **a. Client Mengirimkan Pesan ke Load Balancer**

Pipip ingin agar proses `client.c` dapat mengirimkan pesan ke `loadbalancer.c` menggunakan IPC dengan metode **shared memory**. Proses pengiriman pesan dilakukan dengan format input dari pengguna sebagai berikut:

```
Halo A;10
```

**Penjelasan:**

- `"Halo A"` adalah isi pesan yang akan dikirim.
- `10` adalah jumlah pesan yang ingin dikirim, dalam hal ini sebanyak 10 kali pesan yang sama.

Selain itu, setiap kali pesan dikirim, proses `client.c` harus menuliskan aktivitasnya ke dalam **`sistem.log`** dengan format:

```
Message from client: <isi pesan>
Message count: <jumlah pesan>
```

Semua pesan yang dikirimkan dari client akan diteruskan ke `loadbalancer.c` untuk diproses lebih lanjut.

### **b. Load Balancer Mendistribusikan Pesan ke Worker Secara Round-Robin**

Setelah menerima pesan dari client, tugas `loadbalancer.c` adalah mendistribusikan pesan-pesan tersebut ke beberapa **worker** menggunakan metode **round-robin**. Sebelum mendistribusikan pesan, `loadbalancer.c` terlebih dahulu mencatat informasi ke dalam **`sistem.log`** dengan format:

```
Received at lb: <isi pesan> (#message <indeks pesan>)
```

Contoh jika ada 10 pesan yang dikirimkan, maka output log yang dihasilkan adalah:

```
Received at lb: Halo A (#message 1)
Received at lb: Halo A (#message 2)
...
Received at lb: Halo A (#message 10)
```

Setelah itu, `loadbalancer.c` akan meneruskan pesan-pesan tersebut ke **n worker** secara bergiliran (round-robin), menggunakan **IPC message queue**. Berikut adalah contoh distribusi jika jumlah worker adalah 3:

- Pesan 1 → worker1
- Pesan 2 → worker2
- Pesan 3 → worker3
- Pesan 4 → worker1 (diulang dari awal)

Dan seterusnya.

Proses `worker.c` bertugas untuk mengeksekusi pesan yang diterima dan mencatat log ke dalam file yang sama, yakni **`sistem.log`**.

### **c. Worker Mencatat Pesan yang Diterima**

Setiap worker yang menerima pesan dari `loadbalancer.c` harus mencatat pesan yang diterima ke dalam **`sistem.log`** dengan format log sebagai berikut:

```
WorkerX: message received
```

### **d. Catat Total Pesan yang Diterima Setiap Worker di Akhir Eksekusi**

Setelah proses selesai (semua pesan sudah diproses), setiap worker akan mencatat jumlah total pesan yang mereka terima ke bagian akhir file **`sistem.log`**.

```
Worker 1: 3 messages
Worker 2: 4 messages
Worker 3: 3 messages
```

**Penjelasan:**
3 + 4 + 3 = 10, sesuai dengan jumlah pesan yang dikirim pada soal a

---

# Pipip's Load Balancer

Pipip, a software developer working on a message distribution project with a load balancing system, decided to design a system that allows messages from clients to be efficiently routed to multiple workers. By using inter-process communication (IPC), Pipip wants to ensure that the message sending process runs smoothly and is well-organized, through a neatly recorded log system.

### **a. Client Sends Message to Load Balancer**

Pipip wants the `client.c` process to send messages to `loadbalancer.c` using IPC with the **shared memory** method. The message sending process is done with the following user input format:

```
Halo A;10
```

**Explanation:**

- `"Halo A"` is the content of the message to be sent.
- `10` is the number of messages to be sent, in this case, 10 times the same message.

Each time a message is sent, the `client.c` process must write its activity to **`sistem.log`** with the format:

```
Message from client: <message content>
Message count: <number of messages>
```

All messages sent from the client will be forwarded to `loadbalancer.c` for further processing.

### **b. Load Balancer Distributes Messages to Workers in Round-Robin**

After receiving messages from the client, the task of `loadbalancer.c` is to distribute those messages to several **workers** using the **round-robin** method. Before distributing the messages, `loadbalancer.c` first records the information in **`sistem.log`** with the format:

```
Received at lb: <message content> (#message <message index>)
```

Example if there are 10 messages sent, the log output generated would be:

```
Received at lb: Halo A (#message 1)
Received at lb: Halo A (#message 2)
...
Received at lb: Halo A (#message 10)
```

After that, `loadbalancer.c` will forward the messages to **n workers** in a round-robin manner, using **IPC message queue**. Here is an example of distribution if the number of workers is 3:

- Message 1 → worker1
- Message 2 → worker2
- Message 3 → worker3
- Message 4 → worker1 (repeat from the beginning)

And so on.

`worker.c` process is responsible for executing the received messages and logging them into the same file, namely **`sistem.log`**.

### **c. Worker Logs Received Messages**

Each worker that receives messages from `loadbalancer.c` must log the received message into **`sistem.log`** with the log format as follows:

```
WorkerX: message received
```

### **d. Log Total Messages Received by Each Worker at the End of Execution**

When all processes are completed (all messages have been processed), each worker will log the total number of messages they received at the end of the **`sistem.log`** file.

```
Worker 1: 3 messages
Worker 2: 4 messages
Worker 3: 3 messages
```

Explanation:
3 + 4 + 3 = 10, matching the number of messages sent in task a.
