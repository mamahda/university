-- Active: 1731060400242@@127.0.0.1@3306@neonest
-- 1
SELECT cst_id, cst_name, mbr_points
FROM membership
    JOIN customer ON (
        membership.customer_cst_id = customer.cst_id
    )
WHERE
    mbr_points > 100
    AND mbr_points < 115
ORDER BY mbr_points ASC;

-- 2
SELECT * FROM transaction WHERE `tr_paymentMethod` = 'cash';

-- 3
SELECT cst_id, AVG(tr_totalBill) AS avg_totalBill
FROM customer
    JOIN transaction ON (
        transaction.customer_cst_id = customer.cst_id
    )
GROUP BY
    cst_id
HAVING
    AVG(tr_totalBill) > 5000000;

-- 4
SELECT
    COUNT(tr_totalBill) AS total_transaction,
    tr_paymentMethod
FROM transaction
GROUP BY
    `tr_paymentMethod`
HAVING
    `tr_paymentMethod` = 'cash';

-- 5
SELECT
    cst_name,
    cst_phoneNumber,
    mbr_email,
    COUNT(tr_id) AS number_transaction
FROM
    customer
    JOIN transaction ON (
        cst_id = transaction.customer_cst_id
    )
    JOIN membership ON (
        cst_id = membership.customer_cst_id
    )
GROUP BY
    cst_name,
    cst_phoneNumber,
    mbr_email
ORDER BY number_transaction DESC
LIMIT 3;

-- 6
SELECT AVG(tr_totalBill) AS avg_totalBill, cst_id
FROM customer
    JOIN transaction ON (customer_cst_id = cst_id)
GROUP BY
    cst_id
HAVING
    avg_totalBill > (
        SELECT avg(`tr_totalBill`)
        FROM transaction
    )
ORDER BY avg_totalBill DESC;

-- 7
-- SELECT
--     emp_id,
--     emp_name,
--     COUNT(tr_id) as number_of_transactions
-- FROM employee
--     JOIN transaction ON (employee_emp_id = emp_id)
-- GROUP BY
--     emp_id,
--     emp_name
-- ORDER BY number_of_transactions DESC
-- LIMIT 1;

SELECT
    emp_name,
    emp_id,
    count(tr_id) AS number_of_transaction
FROM employee
    JOIN transaction ON (emp_id = employee_emp_id)
GROUP BY
    emp_id
HAVING
    number_of_transaction = (
        SELECT max(number_of_transaction)
        FROM (
                SELECT count(tr_id) AS number_of_transaction
                FROM transaction
                GROUP BY
                    employee_emp_id
            ) AS subQuery
    );

-- 8
SELECT
    cst_id,
    cst_name,
    SUM(tr_totalBill) AS total_transaction_bill
FROM
    customer
    JOIN transaction ON cst_id = customer_cst_id
GROUP BY
    cst_id,
    cst_name
HAVING
    SUM(tr_totalBill) > (
        SELECT AVG(tr_totalBill)
        FROM transaction
    )
ORDER BY total_transaction_bill DESC;

SELECT cst_id, cst_name, tr_totalBill
FROM
    customer
    JOIN transaction ON customer_cst_id = cst_id
WHERE
    cst_id IN (
        SELECT customer_cst_id
        FROM transaction
        GROUP BY
            customer_cst_id
        HAVING
            SUM(tr_totalBill) > (
                SELECT AVG(tr_totalBill)
                FROM transaction
            )
    );

-- 9
SELECT
    cst_id,
    cst_name,
    COUNT(tr_id) AS number_of_transactions
FROM customer
    JOIN transaction ON (cst_id = customer_cst_id)
GROUP BY
    cst_id
HAVING
    COUNT(tr_id) > 1;

-- 10
SELECT item_id, item_name
FROM item
WHERE
    item_id NOT IN(
        SELECT item_item_id
        FROM transaction_item
    );