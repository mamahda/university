// Pada pengembangan aplikasi **myITS Ticketing**, digunakan beberapa **Design Pattern Gang of Four (GoF)** untuk membantu mengelola kompleksitas sistem, meningkatkan fleksibilitas pengembangan, serta memudahkan pemeliharaan aplikasi. Design pattern yang digunakan beserta alasan dan contoh implementasinya adalah sebagai berikut.

// ## 1. Singleton Pattern

// **Penggunaan:** Database Connection.

// **Alasan:**
// Singleton memastikan hanya terdapat satu instance koneksi database yang digunakan selama aplikasi berjalan sehingga penggunaan sumber daya menjadi lebih efisien.

// **Contoh Implementasi:**


class DatabaseConnection {
    constructor() {
        if (DatabaseConnection.instance) {
            return DatabaseConnection.instance;
        }

        this.connection = "Database Connected";
        DatabaseConnection.instance = this;
    }

    getConnection() {
        return this.connection;
    }
}

const db1 = new DatabaseConnection();
const db2 = new DatabaseConnection();

console.log(db1 === db2); // true


// ---

// ## 2. Factory Method Pattern

// **Penggunaan:** Pembuatan metode pembayaran.

// **Alasan:**
// Memungkinkan sistem membuat objek pembayaran sesuai metode yang dipilih tanpa bergantung pada implementasi konkret.

// **Contoh Implementasi:**


class QRISPayment {
    processPayment() {
        console.log("Processing QRIS Payment");
    }
}

class EWalletPayment {
    processPayment() {
        console.log("Processing E-Wallet Payment");
    }
}

class PaymentFactory {
    static createPayment(type) {
        switch (type) {
            case "QRIS":
                return new QRISPayment();
            case "EWALLET":
                return new EWalletPayment();
            default:
                throw new Error("Invalid Payment Method");
        }
    }
}

const payment =
    PaymentFactory.createPayment("QRIS");

payment.processPayment();


// ---

// ## 3. Strategy Pattern

// **Penggunaan:** Mekanisme pembayaran yang berbeda-beda.

// **Alasan:**
// Setiap metode pembayaran memiliki algoritma yang berbeda sehingga dapat dipilih secara dinamis saat runtime.

// **Contoh Implementasi:**


class QRISStrategy {
    pay(amount) {
        console.log(
            `Paying Rp${amount} using QRIS`
        );
    }
}

class EWalletStrategy {
    pay(amount) {
        console.log(
            `Paying Rp${amount} using E-Wallet`
        );
    }
}

class PaymentContext {
    setStrategy(strategy) {
        this.strategy = strategy;
    }

    executePayment(amount) {
        this.strategy.pay(amount);
    }
}

const context = new PaymentContext();

context.setStrategy(
    new QRISStrategy()
);

context.executePayment(25000);


// ---

// ## 4. Observer Pattern

// **Penggunaan:** Dashboard penjualan dan kuota tiket real-time.

// **Alasan:**
// Ketika tiket terjual, seluruh komponen yang membutuhkan data terbaru dapat diperbarui secara otomatis.

// **Contoh Implementasi:**


class DashboardObserver {
    update(ticketCount) {
        console.log(
            `Dashboard updated: ${ticketCount} tickets sold`
        );
    }
}

class TicketService {
    constructor() {
        this.observers = [];
        this.ticketCount = 0;
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    notifyObservers() {
        this.observers.forEach(observer =>
            observer.update(this.ticketCount)
        );
    }

    sellTicket() {
        this.ticketCount++;
        this.notifyObservers();
    }
}

const ticketService =
    new TicketService();

ticketService.addObserver(
    new DashboardObserver()
);

ticketService.sellTicket();


// ---

// ## 5. State Pattern

// **Penggunaan:** Status tiket (*Pending*, *Paid*, *Used*, dan *Expired*).

// **Alasan:**
// Perilaku tiket berubah sesuai status yang dimilikinya sehingga aturan bisnis dapat dikelola dengan lebih mudah.

// **Contoh Implementasi:**

class PendingState {
    handle() {
        console.log(
            "Waiting for payment"
        );
    }
}

class PaidState {
    handle() {
        console.log(
            "Ticket is valid"
        );
    }
}

class UsedState {
    handle() {
        console.log(
            "Ticket already used"
        );
    }
}

class Ticket {
    setState(state) {
        this.state = state;
    }

    process() {
        this.state.handle();
    }
}

const ticket = new Ticket();

ticket.setState(
    new PaidState()
);

ticket.process();

// ---

// ## 6. Command Pattern

// **Penggunaan:** Operasi pengelolaan event dan match oleh panitia.

// **Alasan:**
// Memisahkan permintaan aksi dari proses eksekusinya sehingga kode menjadi lebih modular dan mudah dikembangkan.

// **Contoh Implementasi:**


class CreateEventCommand {
    execute() {
        console.log(
            "Event Created"
        );
    }
}

class DeleteEventCommand {
    execute() {
        console.log(
            "Event Deleted"
        );
    }
}

class EventManager {
    runCommand(command) {
        command.execute();
    }
}

const manager =
    new EventManager();

manager.runCommand(
    new CreateEventCommand()
);