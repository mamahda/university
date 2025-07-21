DROP DATABASE IF EXISTS wendy_librarian;

CREATE DATABASE IF NOT EXISTS wendy_librarian;

USE wendy_librarian;

-- 1
CREATE TABLE members (
    id CHAR(5) NOT NULL,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    gender CHAR(1) NOT NULL,
    address VARCHAR(100) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE genres (
    id char(5) NOT NULL,
    genre_name VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE positions (
    id char(5) NOT NULL,
    position_name VARCHAR(50) NOT NULL,
    admin_access BOOLEAN NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE books (
    id char(5) NOT NULL,
    isbn char(13) NOT NULL,
    title VARCHAR(100) NOT NULL,
    author_name VARCHAR(50) NOT NULL,
    year_publisher YEAR NOT NULL,
    synopsis VARCHAR(255) NOT NULL,
    stock int NOT NULL,
    genre_id char(5) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE employees (
    id char(5) NOT NULL,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    gender CHAR(1) NOT NULL,
    address VARCHAR(100) NOT NULL,
    position_id char(5) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (position_id) REFERENCES positions (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE phone_numbers (
    phone_number VARCHAR(13) NOT NULL,
    member_id char(5) NOT NULL,
    employee_id char(5) NOT NULL,
    PRIMARY KEY (phone_number),
    FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE borrows (
    id char(5) NOT NULL,
    borrow_date DATE NOT NULL,
    return_date DATE,
    due_date DATE NOT NULL,
    fine DECIMAL(10, 2),
    member_id char(5) NOT NULL,
    employee_id char(5) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE books_borrows (
    book_id char(5) NOT NULL,
    borrow_id char(5) NOT NULL,
    PRIMARY KEY (book_id, borrow_id),
    FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (borrow_id) REFERENCES borrows (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 2
CREATE TABLE authors (
    id char(5) NOT NULL,
    author_name VARCHAR(50) NOT NULL,
    nationality VARCHAR(40) NOT NULL,
    birthdate DATE NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE publishers (
    id char(5) NOT NULL,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(100) NOT NULL,
    country VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
);

-- 3
ALTER TABLE borrows DROP FOREIGN KEY (member_id);

ALTER TABLE phone_numbers DROP FOREIGN KEY (member_id);

ALTER TABLE members
DROP PRIMARY KEY
DROP COLUMN id
ADD NIK char(5) NOT NULL;

ALTER TABLE borrows
ADD FOREIGN KEY (member_id) REFERENCES members (NIK);

ALTER TABLE phone_numbers
ADD FOREIGN KEY (member_id) REFERENCES members (NIK);

-- 4
DROP TABLE phone_numbers;

ALTER TABLE members ADD phone_number VARCHAR(13) NOT NULL;

-- 5
INSERT INTO
    genres
VALUES (
        'GR001',
        'History',
        'Books that examine specific events or
eras, providing insight into the past
and its impact on the present. Usually
accompanied by in-depth historical
data, analysis and narrative.'
    ),
    (
        'GR002',
        'Fiction',
        'Imaginative stories created by
writers, not based on real facts. This
genre includes subgenres such as
romance, fantasy, and adventure, with
a focus on characters and storyline.'
    ),
    (
        'GR003',
        'Self-Development',
        'Books that provide guidance to improve
the quality of life or skills of the
reader. Presents practical advice on
topics such as motivation, time
management, and personal problem
solving.'
    ),
    (
        'GR004',
        'Biography',
        'Tells a person life IN detail
        FROM
            birth TO the END OF his life
            OR NOW.Compiled based ON facts,
            this story describes the characters experiences,
struggles and achievements.'
    ),
    (
        'GR005',
        'Reference',
        'Books that function as complete
reference sources, such as
dictionaries, encyclopedias, or
handbooks. Contains data, definitions
or concepts that can be accessed as
needed, without having to be read
sequentially.'
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
        'South Korean',
        '1982-04-18'
    ),
    (
        'AU005',
        'James Willians',
        'British',
        '1962-12-04'
    );

INSERT INTO
    publishers
VALUES (
        'PB001',
        'Silver Oak Publishing',
        '1234 Elm street',
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
        'Indonesian',
        'greenleaf5678@gmail.com'
    ),
    (
        'PB004',
        'Golden Dragon Publishing',
        '3456 bamboo Lane',
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
    positions
VALUES ('PS001', 'Librarian', TRUE),
    ('PS002', 'Cleaning', FALSE),
    ('PS003', 'Security', FALSE);