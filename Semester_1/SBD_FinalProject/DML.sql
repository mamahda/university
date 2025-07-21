-- DML (Data Manipulation Language) Section
-- Inserting data into the tables

-- Insert data into the Cashier table
INSERT INTO Cashier (
    ID,
    Name,
    Address,
    Email,
    PhoneNumber,
    BirthDate,
    Gender
)
VALUES
    ('CSH01', 'Farel Febryan', 'Jl. Merdeka No. 1', 'farelfebryan@email.com', '081234567890', '1990-05-01', 'M'), -- Inserting cashier details for Farel Febryan
    ('CSH02', 'Risa Saraswati', 'Jl. Raya No. 2', 'risa@email.com', '081234567891', '1985-08-15', 'F'), -- Inserting cashier details for Risa Saraswati
    ('CSH03', 'Gilbran Mahda', 'Jl. Sudirman No. 3', 'gilbranmahda@email.com', '081234567892', '1982-02-20', 'M'), -- Inserting cashier details for Gilbran Mahda
    ('CSH04', 'Dian Sastro', 'Jl. Diponegoro No. 4', 'diansastro@email.com', '081234567893', '1992-07-25', 'F'), -- Inserting cashier details for Dian Sastro
    ('CSH05', 'Irfan Sandy', 'Jl. Gajah Mada No. 5', 'irfansandy@email.com', '081234567894', '1987-12-10', 'M'); -- Inserting cashier details for Irfan Sandy

-- Insert data into the Categories table
INSERT INTO Categories (ID, Name, Description)
VALUES
    ('CAT01', 'Beverages', 'Cafe Latte, Milkshake, Hazelnut Latte, Americano, Caramel Latte, Lychee Tea, Apple Tea, Mango Tea, Hot Chocolate'), -- Inserting categories of beverages
    ('CAT02', 'Snacks', 'Batagor, Siomay, Dimsum, Meatball, Karage, Gyoza, Nachos'), -- Inserting categories of snacks
    ('CAT03', 'Main Course', 'Fried Rice, Chicken Satay, Soto Betawi, Rawon, Spaghetti, Sirloin Steak, Wagyu Steak, Pizza, Chicken Hainan'), -- Inserting categories of main course
    ('CAT04', 'Desserts', 'Pudding, Chocholate ice cream, Strawberry ice cream, Cheese cake'), -- Inserting categories of desserts
    ('CAT05', 'Salads', 'Fruit salad, vegetable salad, Protein salad'), -- Inserting categories of salads
    ('CAT06', 'Pastries', 'Croissant, Cinnamon roll, Sausage roll, Garlic bread, Glazed donut, Brownies'); -- Inserting categories of pastries

-- Insert data into the Customers table
INSERT INTO Customers (
    ID,
    Name,
    Phone,
    Address,
    Gender
)
VALUES
    ('CST001', 'Rudi Santoso', '081234567890', 'Jl. Panglima Sudirman No. 1', 'M'), -- Inserting customer details for Rudi Santoso
    ('CST002', 'Siska Utami', '089534567891', 'Jl. Diponegoro No. 2', 'F'), -- Inserting customer details for Siska Utami
    ('CST003', 'Budi Prasetyo', '081234567892', 'Jl. A. Yani No. 3', 'M'), -- Inserting customer details for Budi Prasetyo
    ('CST004', 'Dewi Wulandari', '089734567893', 'Jl. Veteran No. 4', 'F'), -- Inserting customer details for Dewi Wulandari
    ('CST005', 'Farhan Ramadhan', '081234567894', 'Jl. Gajah Mada No. 5', 'M'), -- Inserting customer details for Farhan Ramadhan
    ('CST006', 'Sari Indah', '081234567895', 'Jl. Pahlawan No. 6', 'F'), -- Inserting customer details for Sari Indah
    ('CST007', 'Arief Hidayat', '089034567896', 'Jl. Basuki Rahmat No. 7', 'M'), -- Inserting customer details for Arief Hidayat
    ('CST008', 'Fitri Rahayu', '081234567897', 'Jl. Kartini No. 8', 'F'), -- Inserting customer details for Fitri Rahayu
    ('CST009', 'Andi Setiawan', '081234567898', 'Jl. Trunojoyo No. 9', 'M'), -- Inserting customer details for Andi Setiawan
    ('CST010', 'Lina Fitriana', '089334567899', 'Jl. Raya No. 10', 'F'), -- Inserting customer details for Lina Fitriana
    ('CST011', 'Rafa Huga', '081234567896', 'Jl. Gatot Subroto No. 6', 'M'), -- Inserting customer details for Rafa Huga
    ('CST012', 'Rafi Ruly', '081234567896', 'Jl. Gatot Subroto No. 6', 'M'), -- Inserting customer details for Rafi Ruly
    ('CST013', 'Erika Karlina', '081234567897', 'Jl. Merdeka No. 8', 'F'), -- Inserting customer details for Erika Karlina
    ('CST014', 'Azhar Bashir', '081234567898', 'Jl. Kenari No. 9', 'M'), -- Inserting customer details for Azhar Bashir
    ('CST015', 'Ardiva Diandra', '081234567899', 'Jl. Basuki Rahmat No. 10', 'F'); -- Inserting customer details for Ardiva Diandra

-- Insert data into Voucher table
INSERT INTO Voucher (ID, Discount, ExpirationDate)
VALUES
    ('VCR01', 10000.00, '2024-12-31'), -- Inserting voucher details with ID VCR01
    ('VCR02', 25000.50, '2024-11-30'); -- Inserting voucher details with ID VCR02

-- Insert data into Transaction table
INSERT INTO Transaction (
    ID,
    DATE,
    Payment_Option,
    Type,
    Total_Price,
    Customers_ID,
    Cashier_ID,
    Voucher_ID
)
VALUES
    ('TR001', '2023-05-01', 'Credit Card', 'Dine-in', 222000.00, 'CST001', 'CSH01', 'VCR01'), -- Inserting transaction details for TR001
    ('TR002', '2023-06-12', 'Cash', 'Takeout', 144000.00, 'CST002', 'CSH02', 'VCR02'), -- Inserting transaction details for TR002
    ('TR003', '2023-07-21', 'Debit Card', 'Take-away', 135000.00, 'CST003', 'CSH03', NULL), -- Inserting transaction details for TR003 (no voucher)
    ('TR004', '2023-08-05', 'Credit Card', 'Dine-in', 115000.00, 'CST004', 'CSH04', NULL), -- Inserting transaction details for TR004 (no voucher)
    ('TR005', '2023-09-17', 'Cash', 'Takeout', 255000.00, 'CST005', 'CSH04', NULL), -- Inserting transaction details for TR005 (no voucher)
    -- More transaction records are inserted similarly...
    
-- Insert data into Products table
INSERT INTO Products (
    ID,
    Name,
    Stock,
    Price,
    Categories_ID
)
VALUES
    ('PRD01', 'Cafe Latte', 50, 15000.00, 'CAT01'), -- Inserting product details for Cafe Latte
    ('PRD02', 'Mango Tea', 30, 12000.00, 'CAT01'), -- Inserting product details for Mango Tea
    ('PRD03', 'Wagyu steak', 20, 180000.00, 'CAT03'), -- Inserting product details for Wagyu steak
    ('PRD04', 'Pizza', 25, 120000.00, 'CAT03'), -- Inserting product details for Pizza
    -- More product records are inserted similarly...

-- Insert data into Products_Transaction table (mapping products with transactions)
INSERT INTO Products_Transaction (
    Products_ID,
    Transaction_ID,
    Quantity,
    Subtotal_Price
)
VALUES
    ('PRD01', 'TR001', 2, 30000.00), -- Inserting product quantity and subtotal for transaction TR001
    ('PRD02', 'TR001', 1, 12000.00), -- Inserting product quantity and subtotal for transaction TR001
    -- More product-transaction mappings are inserted similarly...

-- Update records in the Cashier table
UPDATE Cashier
SET PhoneNumber = '089506226688'
WHERE Name = 'Gilbran Mahda'; -- Updating phone number for Gilbran Mahda

-- Update records in the Products table
UPDATE Products
SET price = price * 0.50
WHERE Name = 'Soto Betawi'; -- Applying a discount of 50% to the product 'Soto Betawi'
