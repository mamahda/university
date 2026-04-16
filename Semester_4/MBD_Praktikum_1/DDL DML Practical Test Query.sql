-- Delete tables if any
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

CREATE TABLE students (
    student_id CHAR(5) PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    birth_date DATE NOT NULL,
    major VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE courses (
    course_id CHAR(4) PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    credits INT NOT NULL CHECK (credits > 0),
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    lecturer_name VARCHAR(100) NOT NULL
);

CREATE TABLE enrollments (
    enrollment_id CHAR(8) PRIMARY KEY,
    student_id CHAR(5) NOT NULL,
    course_id CHAR(4) NOT NULL,
    enrollment_date DATE NOT NULL,
    final_grade VARCHAR(2),
    status VARCHAR(20) NOT NULL,
    CONSTRAINT fk_enrollment_student
        FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT uq_student_course UNIQUE (student_id, course_id)
);

CREATE TABLE payments (
    payment_id CHAR(6) PRIMARY KEY,
    student_id CHAR(5) NOT NULL,
    payment_date DATE NOT NULL,
    amount NUMERIC(12,0) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    CONSTRAINT fk_payment_student
        FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

INSERT INTO students (student_id, student_name, gender, birth_date, major, email) VALUES
('50001', 'Andi Saputra', 'Male', '2003-01-15', 'Informatics', 'andi.saputra@kampus.ac.id'),
('60001', 'Bunga Lestari', 'Female', '2002-07-21', 'Information Systems', 'bunga.lestari@kampus.ac.id'),
('50002', 'Citra Dewi', 'Female', '2003-03-10', 'Informatics', 'citra.dewi@kampus.ac.id'),
('70001', 'Dimas Prakoso', 'Male', '2001-11-05', 'Data Science', 'dimas.prakoso@kampus.ac.id'),
('60002', 'Eka Putri', 'Female', '2002-09-18', 'Information Systems', 'eka.putri@kampus.ac.id'),
('80001', 'Fajar Nugroho', 'Male', '2003-05-27', 'Cyber Security', 'fajar.nugroho@kampus.ac.id'),
('70002', 'Gita Permata', 'Female', '2002-12-01', 'Data Science', 'gita.permata@kampus.ac.id'),
('50003', 'Hendra Wijaya', 'Male', '2001-08-14', 'Informatics', 'hendra.wijaya@kampus.ac.id');

INSERT INTO courses (course_id, course_name, credits, semester, lecturer_name) VALUES
('C001', 'Database Systems', 3, 3, 'Dr. Ratna Sari'),
('C002', 'Data Structures', 3, 2, 'Ir. Budi Santoso'),
('C003', 'Operating Systems', 3, 4, 'Dr. Wahyu Hidayat'),
('C004', 'Web Programming', 3, 4, 'Maya Kusuma, M.Kom'),
('C005', 'Machine Learning', 3, 6, 'Dr. Rudi Hartono'),
('C006', 'Computer Networks', 3, 4, 'Ir. Taufik Akbar'),
('C007', 'Business Process Management', 2, 5, 'Dr. Lina Marlina');

INSERT INTO payments (payment_id, student_id, payment_date, amount, payment_method, payment_status) VALUES
('P00001', '50001', '2026-01-10', 3500000, 'Bank Transfer', 'Paid'),
('P00002', '60001',  '2026-01-10', 4200000, 'Virtual Account', 'Paid'),
('P00003', '50002', '2026-01-13', 3500000, 'Bank Transfer', 'Paid'),
('P00004', '70001', '2026-01-12', 5000000, 'Credit Card', 'Pending'),
('P00005', '60002', '2026-01-11', 4200000, 'Cash', 'Paid'),
('P00006', '80001', '2026-01-12', 3900000, 'Virtual Account', 'Paid'),
('P00007', '70002', '2026-01-10', 5000000, 'Bank Transfer', 'Pending'),
('P00008', '50003', '2026-01-13', 3500000, 'Credit Card', 'Paid');

INSERT INTO enrollments (enrollment_id, student_id, course_id, enrollment_date, final_grade, status) VALUES
('E0000001', '50001', 'C001', '2026-02-01', 'A', 'Completed'),
('E0000002', '50001', 'C002', '2026-02-01', 'B', 'Completed'),
('E0000003', '50001', 'C004', '2026-02-02', 'A', 'Completed'),

('E0000004', '60001', 'C001', '2026-02-01', 'A', 'Completed'),
('E0000005', '60001', 'C003', '2026-02-02', 'B', 'Completed'),
('E0000006', '60001', 'C007', '2026-02-03', 'A', 'Completed'),

('E0000007', '50002', 'C002', '2026-02-01', 'B', 'Completed'),
('E0000008', '50002', 'C004', '2026-02-02', 'A', 'Completed'),
('E0000009', '50002', 'C005', '2026-02-03', 'A', 'Completed'),

('E0000010', '70001', 'C001', '2026-02-01', 'C', 'Completed'),
('E0000011', '70001', 'C005', '2026-02-03', 'B', 'Completed'),

('E0000012', '60002', 'C003', '2026-02-02', 'B', 'Completed'),
('E0000013', '60002', 'C006', '2026-02-03', 'A', 'Completed'),
('E0000014', '60002', 'C007', '2026-02-04', 'B', 'Completed'),

('E0000015', '80001', 'C002', '2026-02-01', 'A', 'Completed'),
('E0000016', '80001', 'C006', '2026-02-03', 'B', 'Completed'),

('E0000017', '70002', 'C004', '2026-02-02', 'A', 'Completed'),
('E0000018', '70002', 'C005', '2026-02-03', 'A', 'Completed'),

('E0000019', '50003', 'C001', '2026-02-01', 'B', 'Completed'),
('E0000020', '50003', 'C007', '2026-02-04', 'A', 'Completed');

