-- NO 1 Display STUDENT_NAME, MAJOR, COURSE_NAME, and FINAL_GRADE for all students taught by lecturers holding a doctoral degree!
SELECT
    student_name,
    major,
    course_name,
    final_grade
FROM
    students s
    JOIN enrollments e ON s.student_id = e.student_id
    JOIN courses c ON e.course_id = c.course_id
WHERE
    lecturer_name LIKE 'Dr%'

-- NO 2 Show STUDENT_ID and STUDENT_NAME who join different courses on the same day!
SELECT s.student_id, s.student_name
FROM students s
    JOIN enrollments e ON s.student_id = e.student_id
GROUP BY
    s.student_id,
    s.student_name,
    e.enrollment_date
HAVING
    COUNT(DISTINCT e.course_id) > 1

-- NO 3 Find LECTURER_NAME, COURSE_NAME, and the number of students enrolled in their courses!
SELECT
    lecturer_name,
    course_name,
    COUNT(*) AS studentcount
FROM courses c
    JOIN enrollments e ON c.course_id = e.course_id
GROUP BY
    c.lecturer_name,
    c.course_name

-- NO 4 Display STUDENT_NAME whose payment amount is greater than the average payment amount of all male students! Note: the payment amount per student can be found in the AMOUNT column
SELECT student_name
FROM students s
    JOIN payments p ON s.student_id = p.student_id
WHERE
    p.amount > (
        SELECT AVG(amount)
        FROM payments
    )

-- NO 5 Show COURSE_NAME offered in even semesters (the query must not explicitly specify semester numbers such as 2,4, or 6)!
SELECT course_name FROM courses c WHERE c.semester % 2 = 0;

-- NO 6 Find STUDENT_ID and STUDENT_NAME who enrolled in more courses than the average number of courses taken by all students!
SELECT s.student_id, s.student_name
FROM students s
    JOIN enrollments e ON s.student_id = e.student_id
GROUP BY
    s.student_id,
    s.student_name
HAVING
    COUNT(e.course_id) > (
        SELECT AVG(course_count)
        FROM (
                SELECT COUNT(course_id) AS course_count
                FROM enrollments
                GROUP BY
                    student_id
            )
    );

-- NO 7 Display STUDENT_NAME, MAJOR and PAYMENT_DATE who made the earliest payment!
SELECT s.student_name, s.major, p.payment_date
FROM students s
    JOIN payments p ON s.student_id = p.student_id
WHERE
    p.payment_date = (
        SELECT MIN(payment_date)
        FROM payments
    );

-- NO 8 Show STUDENT_NAME and MAJOR who have received FINAL_GRADE of A more than once!
SELECT s.student_name, s.major
FROM students s
    JOIN enrollments e ON s.student_id = e.student_id
WHERE
    e.final_grade = 'A'
GROUP BY
    s.student_name,
    s.major
HAVING
    COUNT(e.final_grade) > 1

-- NO 9 Find MAJOR whose students count is greater than the minimum student count among all majors!
SELECT major
FROM students
GROUP BY
    major
HAVING
    COUNT(*) > (
        SELECT MIN(student_count)
        FROM (
                SELECT COUNT(*) AS student_count
                FROM students
                GROUP BY
                    major
            )
    );

-- NO 10 Display the percentage of total payments whose PAYMENT_STATUS is PENDING and the percentage of total payments whose PAYMENT_STATUS is PAID, relative to overall total payment (rounded to three decimal places)! Note: the payment amount can be found in AMOUNT column.
SELECT
    ROUND(
        SUM(
            CASE
                WHEN payment_status = 'Pending' THEN amount
                ELSE 0
            END
        ) / SUM(amount),
        3
    ) AS percent_pending,
    ROUND(
        SUM(
            CASE
                WHEN payment_status = 'Paid' THEN amount
                ELSE 0
            END
        ) / SUM(amount),
        3
    ) AS percent_paid
FROM payments;