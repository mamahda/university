-- Active: 1728576886105@@127.0.0.1@3306@northwind
-- 1
SELECT orders.OrderDate, shippers.ShipperName
FROM Orders
    JOIN customers ON (
        customers.CustomerID = orders.CustomerID
    )
    JOIN Shippers ON (
        shippers.ShipperID = orders.ShipperID
    )
WHERE
    customers.ContactName = 'Thomas Hardy';

-- 2
SELECT *
FROM employees
WHERE
    MONTH(BirthDate) = 1
ORDER BY FirstName ASC;

-- 3
SELECT categories.CategoryName AS Categories, COUNT(*) AS categoryCount
FROM categories
    JOIN products ON (
        categories.CategoryID = products.CategoryID
    )
GROUP BY
    categories.CategoryName;

-- 4
SELECT *
FROM products
WHERE
    price = (
        SELECT MAX(price)
        FROM products
    );

-- 5
SELECT categories.CategoryName AS Categories, AVG(price) AS categoryCount
FROM categories
    JOIN products ON (
        categories.CategoryID = products.CategoryID
    )
GROUP BY
    categories.CategoryName;