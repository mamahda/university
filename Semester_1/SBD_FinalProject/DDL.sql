-- DDL: Create tables and define relationships

-- Create the 'Cashier' table to store cashier information
CREATE TABLE Cashier (
    ID CHAR(5) NOT NULL,           -- Cashier's unique ID
    Name VARCHAR(100) NOT NULL,    -- Cashier's name
    Address VARCHAR(100) NOT NULL, -- Cashier's address
    Email VARCHAR(100) NOT NULL,   -- Cashier's email
    PhoneNumber VARCHAR(100) NOT NULL, -- Cashier's phone number
    BirthDate DATE NOT NULL,       -- Cashier's birthdate
    Gender CHAR(1) NOT NULL,       -- Cashier's gender ('M' or 'F')
    PRIMARY KEY (ID)               -- ID is the primary key
);

-- Create the 'Categories' table to store product categories
CREATE TABLE Categories (
    ID CHAR(5) NOT NULL,            -- Category's unique ID
    Name VARCHAR(100) NOT NULL,     -- Category's name
    Description VARCHAR(255) NOT NULL, -- Description of the category
    PRIMARY KEY (ID)                -- ID is the primary key
);

-- Create the 'Customers' table to store customer information
CREATE TABLE Customers (
    ID CHAR(10) NOT NULL,           -- Customer's unique ID
    Name VARCHAR(255) NOT NULL,     -- Customer's name
    Email VARCHAR(255),             -- Customer's email (nullable)
    Phone VARCHAR(13),              -- Customer's phone number (nullable)
    Address VARCHAR(255),           -- Customer's address (nullable)
    Gender CHAR(1),                 -- Customer's gender ('M' or 'F', nullable)
    PRIMARY KEY (ID)                -- ID is the primary key
);

-- Create the 'Products' table to store product information
CREATE TABLE Products (
    ID CHAR(5) NOT NULL,            -- Product's unique ID
    Name VARCHAR(100) NOT NULL,     -- Product's name
    Stock INT NOT NULL,             -- Product stock quantity
    Price DECIMAL(8, 2) NOT NULL,   -- Product's price (up to 999999.99)
    Categories_ID CHAR(5) NOT NULL, -- Reference to the category ID
    PRIMARY KEY (ID),               -- ID is the primary key
    FOREIGN KEY (Categories_ID) REFERENCES Categories (ID) 
        ON UPDATE CASCADE ON DELETE CASCADE -- Foreign key constraint with cascade updates and deletes
);

-- Create the 'Voucher' table to store voucher information
CREATE TABLE Voucher (
    ID CHAR(10),                   -- Voucher's unique ID
    PRIMARY KEY (ID)               -- ID is the primary key
);

-- Create the 'Transaction' table to store transaction details
CREATE TABLE Transaction (
    ID CHAR(10) NOT NULL,           -- Transaction's unique ID
    DATE DATE NOT NULL,             -- Date of the transaction
    Payment_Option VARCHAR(50) NOT NULL, -- Payment method (e.g., 'Credit', 'Cash')
    Type VARCHAR(10) NOT NULL,      -- Type of transaction (e.g., 'Sale', 'Return')
    Total_Price DECIMAL(9, 2),      -- Total price for the transaction (nullable)
    Customers_ID CHAR(10) NOT NULL, -- Reference to the customer ID
    Cashier_ID CHAR(5) NOT NULL,    -- Reference to the cashier ID
    Voucher_ID CHAR(5) NULL,        -- Reference to the voucher ID (nullable)
    PRIMARY KEY (ID),               -- ID is the primary key
    FOREIGN KEY (Customers_ID) REFERENCES Customers (ID) 
        ON DELETE CASCADE ON UPDATE CASCADE, -- Foreign key constraint with cascade updates and deletes
    FOREIGN KEY (Cashier_ID) REFERENCES Cashier (ID) 
        ON DELETE CASCADE ON UPDATE CASCADE, -- Foreign key constraint with cascade updates and deletes
    FOREIGN KEY (Voucher_ID) REFERENCES Voucher (ID) 
        ON DELETE CASCADE ON UPDATE CASCADE -- Foreign key constraint with cascade updates and deletes
);

-- Create the 'Products_Transaction' table to manage product quantities in transactions
CREATE TABLE Products_Transaction (
    Products_ID CHAR(5) NOT NULL,   -- Reference to the product ID
    Transaction_ID CHAR(10) NOT NULL, -- Reference to the transaction ID
    Quantity INT NOT NULL,          -- Quantity of the product in this transaction
    Subtotal_Price DECIMAL(10, 2) NOT NULL, -- Subtotal price for this product (quantity * price)
    PRIMARY KEY (Products_ID, Transaction_ID), -- Composite primary key
    FOREIGN KEY (Products_ID) REFERENCES Products (ID) 
        ON UPDATE CASCADE ON DELETE CASCADE, -- Foreign key constraint with cascade updates and deletes
    FOREIGN KEY (Transaction_ID) REFERENCES Transaction (ID) 
        ON UPDATE CASCADE ON DELETE CASCADE -- Foreign key constraint with cascade updates and deletes
);

-- Create the 'Members' table to store membership details
CREATE TABLE Members (
    ID CHAR(10),                   -- Member's unique ID
    NIK VARCHAR(20),               -- National Identification Number (NIK)
    FullName VARCHAR(255),         -- Member's full name
    Email VARCHAR(255),            -- Member's email
    PhoneNumber VARCHAR(20),       -- Member's phone number
    Address VARCHAR(255),          -- Member's address
    Gender CHAR(1),                -- Member's gender ('M' or 'F')
    MemberSince DATE,              -- Date when the member joined
    PRIMARY KEY (ID)               -- ID is the primary key
);

-- ALTER TABLE statements to modify existing tables

-- Add 'Discount' and 'ExpirationDate' columns to the 'Voucher' table
ALTER TABLE voucher
ADD Discount DECIMAL(8, 2) NOT NULL,  -- Voucher discount value
ADD ExpirationDate DATE NOT NULL;     -- Voucher expiration date

-- Drop the 'Email' column from the 'Customers' table
ALTER TABLE customers DROP COLUMN Email;

-- Drop the 'Members' table as it is no longer needed
DROP TABLE Members;
