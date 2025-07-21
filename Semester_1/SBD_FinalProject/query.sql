-- Query 1: Retrieve the IDs, names, and payment options of customers who paid by cash.
SELECT Customers.id, customers.name, Transaction.payment_option
FROM Customers
    JOIN Transaction ON Transaction.customers_id = customers.id
WHERE Transaction.payment_option = 'Cash';

-- Query 2: Get all products that have a price higher than the average price of all products.
SELECT *
FROM products
WHERE price > (
    SELECT avg(price)
    FROM products
);

-- Query 3: Get all products that have not been sold (i.e., they do not appear in Products_Transaction table).
SELECT *
FROM Products
WHERE Products.ID NOT IN(
    SELECT Products_ID
    FROM Products_Transaction
);

-- Query 4: Find customers whose phone number contains '089' (matches phone numbers starting with 089).
SELECT ID, Name, Phone
FROM Customers
WHERE Phone LIKE '089%';

-- Query 5: Find the cashier with the most transactions.
SELECT Cashier.ID, COUNT(Cashier_ID) AS Cashier_Count
FROM Cashier
    JOIN Transaction ON Cashier.ID = Transaction.Cashier_ID
GROUP BY Cashier.ID
HAVING Cashier_Count = (
    SELECT MAX(Cashier_Count)
    FROM (
            SELECT COUNT(Cashier_ID) AS Cashier_Count
            FROM Transaction
            GROUP BY Cashier_ID
        ) AS subquery
);

-- Query 6: Get the total revenue per product category (quantity sold * price).
SELECT c.Name AS CategoryName, SUM(pt.Quantity * p.Price) AS TotalRevenue
FROM Products_Transaction pt
    JOIN Products p ON pt.Products_ID = p.ID
    JOIN Categories c ON p.Categories_ID = c.ID
GROUP BY c.ID;

-- Query 7: Find total spending by each customer, ordered by highest spender.
SELECT c.Name AS CustomerName, SUM(t.Total_Price) AS TotalSpendings
FROM Transaction t
    JOIN Customers c ON t.Customers_ID = c.ID
GROUP BY c.ID
ORDER BY TotalSpendings DESC;

-- Query 8: Get the total quantity sold and total revenue per product.
-- Total revenue is calculated by multiplying the quantity sold with the product price.
SELECT Products.Name AS ProductsName, Products.ID AS ProductID, 
       SUM(Products_Transaction.Quantity) AS totalsell,
       SUM(Products_Transaction.Quantity * products.Price) AS totalrevenue
FROM Products_Transaction
    JOIN Products ON Products_Transaction.Products_ID = products.ID
GROUP BY Products.ID;
