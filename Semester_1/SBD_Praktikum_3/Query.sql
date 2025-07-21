-- Active: 1731060400242@@127.0.0.1@3306
USE zoo;

-- 1
SELECT animals.name, attractions.name
FROM
    animals_attractions
    JOIN animals ON (
        animals.id = animals_attractions.animals_id
    )
    JOIN attractions ON (
        attractions.id = animals_attractions.attractions_id
    )
WHERE
    attractions.schedule_start > '9:00:00'
    AND attractions.schedule_end < '15:00:00';

-- 2
SELECT types.id, types.species
FROM
    animals_attractions
    JOIN animals ON (
        animals.id = animals_attractions.animals_id
    )
    JOIN attractions ON (
        attractions.id = animals_attractions.attractions_id
    )
    JOIN types ON (types.id = animals.types_id)
WHERE
    attractions.name = "night spectacular"
ORDER BY types.id ASC;

-- 3
SELECT *
FROM animals
WHERE
    animals.id NOT IN(
        SELECT animals_attractions.animals_id
        FROM animals_attractions
    );

-- 4
SELECT
    count(employee.id) AS total_employee,
    (
        COUNT(employee.certification) * 100 / COUNT(*)
    ) AS certified_precentage
FROM employee;

-- 5
SELECT animals.id, animals.name, SUM(attractions.price) AS revenue
FROM
    animals_attractions
    JOIN animals ON (
        animals.id = animals_attractions.animals_id
    )
    JOIN attractions ON (
        attractions.id = animals_attractions.attractions_id
    )
GROUP BY
    animals_id
ORDER BY revenue DESC;

-- 6
SELECT attractions.id, attractions.name
FROM attractions
WHERE
    attractions.price = 0.00
    AND attractions.id NOT IN(
        SELECT attractions.id
        FROM
            attractions_employee
            JOIN attractions ON (
                attractions_employee.attractions_id = attractions.id
            )
            JOIN employee ON (
                attractions_employee.employee_id = employee.id
            )
        WHERE
            employee.type = 'healthcare'
    )
GROUP BY
    attractions.id;

-- 7
SELECT
    attractions.id,
    attractions.name,
    attractions.place,
    CASE
        WHEN COUNT(employee.certification) > 0 THEN 'Yes'
        ELSE 'No'
    END AS certified_employee
FROM
    attractions_employee
    JOIN attractions ON (
        attractions_employee.attractions_id = attractions.id
    )
    JOIN employee ON (
        attractions_employee.employee_id = employee.id
    )
GROUP BY
    attractions.id
ORDER BY attractions.id ASC;

-- 8
SELECT animals.id, animals.name, attractions.place, COUNT(
        animals_attractions.attractions_id
    ) * 100.0 / (
        SELECT COUNT(animals_id)
        FROM animals_attractions
        WHERE
            animals_id != 'A09'
    ) AS usage_percentage
FROM
    animals_attractions
    JOIN animals ON (
        animals.id = animals_attractions.animals_id
    )
    JOIN attractions ON (
        attractions.id = animals_attractions.attractions_id
    )
WHERE
    animals.id != 'A09'
GROUP BY
    animals.id,
    attractions.place
ORDER BY animals.id ASC;

-- 9
SELECT
    employee.id,
    employee.name,
    employee.type,
    COUNT(
        attractions_employee.attractions_id
    ) AS total_attractions,
    COUNT(
        attractions_employee.attractions_id
    ) * 30 * CASE
        WHEN employee.type = 'senior ranger' THEN 35
        WHEN employee.type = 'ranger' THEN 25
        WHEN employee.type = 'healthcare' THEN 19
        ELSE 0
    END AS monthly_revenue
FROM
    employee
    JOIN attractions_employee ON (
        employee.id = attractions_employee.employee_id
    )
GROUP BY
    employee.id,
    employee.type
ORDER BY employee.id;

-- 10
SELECT employee.id, employee.name
FROM
    attractions_employee
    JOIN attractions ON (
        attractions_employee.attractions_id = attractions.id
    )
    JOIN employee ON (
        attractions_employee.employee_id = employee.id
    )
    JOIN animals_attractions ON (
        animals_attractions.attractions_id = attractions.id
    )
    JOIN animals ON (
        animals.id = animals_attractions.animals_id
    )
    JOIN types ON (types.id = animals.types_id)
WHERE
    types.genus = "seal"
GROUP BY
    employee.id
ORDER BY employee.id ASC