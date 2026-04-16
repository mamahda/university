-- =========================
-- DDL: CREATE TABLE
-- =========================
CREATE TABLE customers (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    age INT,
    address VARCHAR(100),
    salary NUMERIC(10, 2)
);

-- =========================
-- DML: INSERT DATA
-- =========================
INSERT INTO
    customers (
        id,
        name,
        age,
        address,
        salary
    )
VALUES (
        1,
        'Ramesh',
        32,
        'Ahmedabad',
        2000.00
    ),
    (
        2,
        'Khilan',
        25,
        'Delhi',
        1500.00
    ),
    (
        3,
        'Kaushik',
        23,
        'Kota',
        2000.00
    ),
    (
        4,
        'Chaitali',
        25,
        'Mumbai',
        6500.00
    ),
    (
        5,
        'Hardik',
        27,
        'Bhopal',
        8500.00
    ),
    (6, 'Komal', 22, 'MP', 4500.00);

-- =========================
-- 1. VIEW: salary > 2000
-- =========================
CREATE VIEW view_customer_salary_above_2000 AS
SELECT name, salary, age
FROM customers
WHERE
    salary > 2000;

-- =========================
-- 2. VIEW: percentage salary
-- =========================
CREATE VIEW view_salary_percentage AS
SELECT name, (
        salary / (
            SELECT SUM(salary)
            FROM customers
        )
    ) * 100 AS percentage
FROM customers
ORDER BY percentage DESC;

-- =========================
-- 3. TABLE LOG
-- =========================
CREATE TABLE salary_log (
    IDLog SERIAL PRIMARY KEY,
    log_date TIMESTAMP,
    previous_salary NUMERIC(10, 2),
    next_salary NUMERIC(10, 2)
);

-- =========================
-- 3. FUNCTION + TRIGGER: log perubahan salary
-- =========================
CREATE OR REPLACE FUNCTION log_salary_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.salary <> NEW.salary THEN
        INSERT INTO salary_log (log_date, previous_salary, next_salary)
        VALUES (NOW(), OLD.salary, NEW.salary);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_salary_update
AFTER UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION log_salary_change();

-- =========================
-- 4. FUNCTION + TRIGGER: batas salary
-- =========================
CREATE OR REPLACE FUNCTION enforce_salary_range()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.salary > 8500 THEN
        NEW.salary := 8500;
    ELSIF NEW.salary < 1500 THEN
        NEW.salary := 1500;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trigger untuk INSERT
CREATE TRIGGER trg_salary_range_insert
BEFORE INSERT ON customers
FOR EACH ROW
EXECUTE FUNCTION enforce_salary_range();

-- trigger untuk UPDATE
CREATE TRIGGER trg_salary_range_update
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION enforce_salary_range();

-- =========================
-- TESTING (opsional)
-- =========================

-- Test view 1
SELECT * FROM view_customer_salary_above_2000;

-- Test view 2
SELECT * FROM view_salary_percentage;

-- Test trigger log
UPDATE customers SET salary = 3000 WHERE id = 1;

SELECT * FROM salary_log;

-- Test trigger range
INSERT INTO customers VALUES ( 7, 'Test', 30, 'Surabaya', 9000 );
-- jadi 8500
INSERT INTO customers VALUES ( 8, 'Test2', 28, 'Malang', 1000 );
-- jadi 1500
SELECT * FROM customers;

INSERT INTO customers VALUES ( 9, 'TestHigh', 30, 'Surabaya', 9000 );