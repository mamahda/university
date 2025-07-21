-- Active: 1731060400242@@127.0.0.1@3306
DROP DATABASE IF EXISTS wendy_librarian;

CREATE DATABASE IF NOT EXISTS wendy_librarian;

USE wendy_librarian;

CREATE TABLE members (
    id char(5) NOT NULL,
    name varchar(50) NOT NULL,
    email varchar(50) NOT NULL,
    gender char(1) NOT NULL,
    address varchar(100) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE genres (
    id char(5) NOT NULL,
    genre_name varchar(50) NOT NULL,
    description varchar(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE books (
    id char(5) NOT NULL,
    isbn char(13) NOT NULL,
    title varchar(100) NOT NULL,
    author_name varchar(50) NOT NULL,
    year_published YEAR NOT NULL,
    synopsis varchar(255) NOT NULL,
    stock int NOT NULL,
    genre_id char(5) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (genre_id) REFERENCES genres (id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE positions (
    id char(5) NOT NULL,
    position_name varchar(50) NOT NULL,
    admin_access BOOLEAN NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE employees (
    id char(5) NOT NULL,
    name varchar(50) NOT NULL,
    email varchar(50) NOT NULL,
    gender char(1) NOT NULL,
    address varchar(100) NOT NULL,
    position_id varchar(50) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (position_id) REFERENCES positions (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE phone_numbers (
    phone_number varchar(13) NOT NULL,
    member_id char(5) NOT NULL,
    employee_id char(5) NOT NULL,
    PRIMARY KEY (phone_number),
    CONSTRAINT fk_1 FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE borrows (
    id char(5) NOT NULL,
    borrow_date DATE NOT NULL,
    return_date DATE,
    due_date DATE NOT NULL,
    fine decimal(10, 2),
    member_id char(5) NOT NULL,
    employee_id char(5) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_2 FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE books_borrows (
    book_id char(5) NOT NULL,
    borrow_id char(5) NOT NULL,
    PRIMARY KEY (book_id, borrow_id),
    FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT borrow_fk FOREIGN KEY (borrow_id) REFERENCES borrows (id) ON DELETE CASCADE ON UPDATE CASCADE
);

--2
CREATE TABLE authors (
    id char(5) NOT NULL,
    author_name varchar(50) NOT NULL,
    nationality varchar(30) NOT NULL,
    birthdate DATE NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE publishers (
    id char(5) NOT NULL,
    name varchar(50) NOT NULL,
    address varchar(100) NOT NULL,
    country varchar(30) NOT NULL,
    email varchar(50) NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE books
DROP author_name,
ADD author_id char(5) NOT NULL,
ADD FOREIGN KEY (author_id) REFERENCES authors (id) ON DELETE CASCADE ON UPDATE CASCADE,
ADD publishers_id char(5) NOT NULL,
ADD FOREIGN KEY (publishers_id) REFERENCES publishers (id) ON DELETE CASCADE ON UPDATE CASCADE;

--3
ALTER TABLE borrows DROP CONSTRAINT fk_2;

ALTER TABLE phone_numbers DROP CONSTRAINT fk_1;

ALTER TABLE members
DROP PRIMARY KEY,
DROP COLUMN id,
ADD NIK varchar(20) NOT NULL,
ADD PRIMARY KEY (NIK);

ALTER TABLE phone_numbers
DROP member_id,
ADD member_NIK VARCHAR(20),
ADD FOREIGN KEY (member_NIK) REFERENCES members (NIK) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE borrows
DROP member_id,
ADD member_NIK varchar(20),
ADD FOREIGN KEY (member_NIK) REFERENCES members (NIK) ON UPDATE CASCADE ON DELETE CASCADE;

--4
DROP TABLE phone_numbers;

ALTER TABLE members ADD phone_number varchar(13) NOT NULL;

ALTER TABLE employees ADD phone_number varchar(13) NOT NULL;

--5
INSERT INTO
    genres
VALUES (
        'GR001',
        'History',
        'Books that examine specific events or eras, providing insight into the past and its impact on the present. Usually accompanied by in-depth historical data, analysis and narrative.'
    ),
    (
        'GR002',
        'Fiction',
        'Imaginative stories created by writers, not based on real facts. This genre includes subgenres such as romance, fantasy, and adventure, with a focus on characters and storyline.'
    ),
    (
        'GR003',
        'Self-Development',
        'Books that provide guidance to improve the quality of life or skills of the reader. Presents practical advice on topics such as motivation, time management, and personal problem solving.'
    ),
    (
        'GR004',
        'Biography',
        'Tells a persons life in detail from birth to the end of his life or now. Compiled based on facts, this story describes the characters experiences, struggles and achievements.'
    ),
    (
        'GR005',
        'Reference',
        'Books that function as complete reference sources, such as dictionaries, encyclopedias, or handbooks. Contains data, definitions or concepts that can be accessed as needed, without having to be read sequentially.'
    );

INSERT INTO
    authors
VALUES (
        'AU001',
        'Michael Brown',
        'American',
        '1990-03-30'
    ),
    (
        'AU002',
        'Andi Saputra',
        'Indonesian',
        '1988-10-02'
    ),
    (
        'AU003',
        'Yuki Nakamura',
        'Japanese',
        '1973-01-22'
    ),
    (
        'AU004',
        'Kim Min Joon',
        'South Korean ',
        '1982-04-18'
    ),
    (
        'AU005',
        'James Williams ',
        'British',
        '1962-12-04'
    );

INSERT INTO
    publishers
VALUES (
        'PB001',
        'Silver Oak Publishing',
        '1234 Elm Street',
        'United States',
        'silveroak1234@gmail.com'
    ),
    (
        'PB002',
        'Blue Sky Books',
        '9012 Pine Road',
        'Jepang',
        'bluesky9012@gmail.com'
    ),
    (
        'PB003',
        'Green Leaf Press',
        '5678 Maple Avenue',
        'Indonesia',
        'greenleaf5678@gmail.com'
    ),
    (
        'PB004',
        'Golden Dragon Publishing',
        '3456 Bamboo Lane',
        'China',
        'goldendragon3456@gmail.com'
    ),
    (
        'PB005',
        'Red River Press',
        '7890 Cherry Blossom Drive',
        'France',
        'redriver7890@gmail.com'
    );

INSERT INTO
    books
VALUES (
        'BK001',
        '9780123456789',
        'Jejak Peradaban: Kisah Perjalanan Sejarah Indonesia',
        '2010',
        'Delving into Indonesian history, this book presents important events and influential figures who shaped the nations civilization, bringing readers to understand the roots of Indonesian culture and identity.',
        5,
        'GR001',
        'AU002',
        'PB003'
    ),
    (
        'BK002',
        '9781234567890',
        'Small Steps, Big Changes: Building Positive Habits',
        '2005',
        'Discover the power of small habits that have a big impact. This book provides practical strategies for building positive habits that can change lives and improve overall well-being.',
        3,
        'GR003',
        'AU003',
        'PB002'
    ),
    (
        'BK003',
        '9782345678901',
        'Complete Dictionary of Information Technology Terms',
        '2020',
        'A complete guide to information technology terms, this book explains basic concepts to complex technical terms, making it a useful reference resource for students and professionals.',
        7,
        'GR005',
        'AU001',
        'PB001'
    ),
    (
        'BK004',
        '9783456789012',
        'Breaking Barriers: The Inspiring Story of Nelson Mandela',
        '2018',
        'The extraordinary story of Nelson Mandela, a freedom fighter who overcame obstacles to fight for equality and justice. An inspiring journey of courage, sacrifice, and hope.',
        2,
        'GR004',
        'AU005',
        'PB001'
    ),
    (
        'BK005',
        '9784567890123',
        'Light at the End of the Road: A Story of Hope',
        '2024',
        'In a journey full of challenges, a character finds the strength of hope and friendship. This novel invites readers to reflect on the meaning of life and the importance of believing in a better future.',
        4,
        'GR002',
        'AU004',
        'PB004'
    );

INSERT INTO
    positions
VALUES ('PS001', 'Librarian', TRUE),
    ('PS002', 'Cleaning', FALSE),
    ('PS003', 'Security', FALSE);

ALTER TABLE employees
MODIFY phone_number varchar(13) NOT NULL after gender;

INSERT INTO
    employees
VALUES (
        'EM001',
        'Andi Gading',
        'andi@gmail.com',
        'P',
        '081628492610',
        'Jl. Merdeka No.10',
        'PS001'
    ),
    (
        'EM002',
        'Budi Sitombing',
        'budi@gmail.com',
        'L',
        '085864927581',
        'Jl. Sukun Raya No.25',
        'PS003'
    ),
    (
        'EM003',
        'Jenni Fertina',
        'tina@gmail.com',
        'P',
        '089603471812',
        'Jl. Pahlawan No.5',
        'PS001'
    ),
    (
        'EM004',
        'Lili Sari',
        'lili@gmail.com',
        'L',
        '088273659814',
        'Jl. Cendana No.8',
        'PS002'
    ),
    (
        'EM005',
        'Alexander Agus',
        'agus@gmail.com',
        'L',
        '088273659814',
        'Jl. Bunga No.12',
        'PS001'
    );

ALTER TABLE members MODIFY NIK varchar(20) NOT NULL after name;

ALTER TABLE members MODIFY name varchar(50) NOT NULL after NIK;

INSERT INTO
    members
VALUES (
        '3326162409040002',
        'Citra Kirana',
        'citra@gmail.com',
        'P',
        'Jl. Cinta No.45',
        '088374628921'
    ),
    (
        '3525017006950028',
        'Jasmine Neroli',
        'jasmine@gmail.com',
        'P',
        'Jl. Melati No.9',
        '083285716164'
    ),
    (
        '3525017006520020',
        'Nico Parto',
        'nico@gmail.com',
        'L',
        'Jl. Kenanga No.33',
        '089675329117'
    ),
    (
        '3305040901072053',
        'Teddy Widodo',
        'teddy@gmail.com',
        'L',
        'Jl. Anggrek No.17',
        '085782306818'
    ),
    (
        '3326161509700004',
        'Beni Soeharti',
        'beni@gmail.com',
        'L',
        'Jl. Raya No.56',
        '0812345678919'
    );

ALTER TABLE borrows
MODIFY employee_id char(5) NOT NULL after member_NIK;

INSERT INTO
    borrows
VALUES (
        'BR001',
        '2024-05-06',
        '2024-05-06',
        '2024-05-20',
        NULL,
        '3326162409040002',
        'EM004'
    ),
    (
        'BR002',
        '2024-07-14',
        '2024-07-29',
        '2024-07-28',
        5000.00,
        '3525017006950028',
        'EM001'
    ),
    (
        'BR003',
        '2024-09-22',
        '2024-10-08',
        '2024-10-6',
        10000.00,
        '3525017006520020',
        'EM003'
    ),
    (
        'BR004',
        '2024-10-03',
        '2024-10-20',
        '2024-10-17',
        15000.00,
        '3305040901072053',
        'EM002'
    ),
    (
        'BR005',
        '2024-11-02',
        NULL,
        '2024-11-16',
        NULL,
        '3326161509700004',
        'EM005'
    );

INSERT INTO
    books_borrows
VALUES ('BK001', 'BR001'),
    ('BK003', 'BR002'),
    ('BK001', 'BR002'),
    ('BK004', 'BR003'),
    ('BK005', 'BR004'),
    ('BK002', 'BR005');

--6
DELETE FROM books_borrows WHERE 1 = 1;

ALTER TABLE books_borrows DROP CONSTRAINT borrow_fk;

DELETE FROM borrows WHERE 1 = 1;

ALTER TABLE borrows
DROP PRIMARY KEY,
MODIFY id int AUTO_INCREMENT,
ADD PRIMARY KEY (id);

ALTER TABLE books_borrows
MODIFY borrow_id int AUTO_INCREMENT NOT NULL,
ADD FOREIGN KEY (borrow_id) REFERENCES borrows (id) ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO
    borrows (
        borrow_date,
        return_date,
        due_date,
        fine,
        member_NIK,
        employee_id
    )
VALUES (
        '2024-05-06',
        '2024-05-06',
        '2024-05-20',
        NULL,
        '3326162409040002',
        'EM004'
    ),
    (
        '2024-07-14',
        '2024-07-29',
        '2024-07-28',
        5000.00,
        '3525017006950028',
        'EM001'
    ),
    (
        '2024-09-22',
        '2024-10-08',
        '2024-10-6',
        10000.00,
        '3525017006520020',
        'EM003'
    ),
    (
        '2024-10-03',
        '2024-10-20',
        '2024-10-17',
        15000.00,
        '3305040901072053',
        'EM002'
    ),
    (
        '2024-11-02',
        NULL,
        '2024-11-16',
        NULL,
        '3326161509700004',
        'EM005'
    );

INSERT INTO
    books_borrows
VALUES ('BK001', 1),
    ('BK003', 2),
    ('BK001', 2),
    ('BK004', 3),
    ('BK005', 4),
    ('BK002', 5);

--7
UPDATE borrows
SET
    return_date = CURRENT_DATE
WHERE
    member_NIK = '3326161509700004';

--8
UPDATE borrows
SET
    fine = NULL
WHERE
    member_NIK IN (
        '3525017006520020',
        '3305040901072053'
    );

--9
INSERT INTO
    borrows
VALUES (
        6,
        '2024-11-03',
        NULL,
        '2024-11-17',
        NULL,
        '3326161509700004',
        'EM005'
    );

UPDATE books SET stock = stock - 1 WHERE id = 'BK003';

--10
INSERT INTO
    employees
VALUES (
        'EM006',
        'Aspas Gata',
        'aspasgata@gmail.com',
        'L',
        '0895323390308',
        'Jl. Badut No.62.',
        'PS001'
    );

--11
UPDATE employees
SET
    name = 'Andi Haki',
    gender = 'L',
    phone_number = '081628492611'
WHERE
    name = 'Andi Gading';

--12
DELETE FROM members WHERE name = 'Jasmine Neroli';

DELETE FROM employees WHERE name = 'Aspas Gata';