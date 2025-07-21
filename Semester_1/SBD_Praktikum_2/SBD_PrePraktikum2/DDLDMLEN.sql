-- Active: 1731060400242@@127.0.0.1@3306
DROP DATABASE IF EXISTS ITS_Library;

CREATE DATABASE ITS_Library;

USE ITS_Library;

CREATE TABLE author (
    author_id CHAR(5) NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    author_nationality VARCHAR(100) NOT NULL,
    author_birthdate DATE NOT NULL,
    PRIMARY KEY (author_id)
);

CREATE TABLE shelf (
    shelf_id CHAR(5) NOT NULL,
    shelf_capacity INT NOT NULL,
    shelf_floor INT NOT NULL,
    PRIMARY KEY (shelf_id)
);

CREATE TABLE book (
    book_id CHAR(5) NOT NULL,
    book_title VARCHAR(50) NOT NULL,
    book_author CHAR(5) NOT NULL,
    book_genre VARCHAR(20) NOT NULL,
    book_release DATE NOT NULL,
    shelf_id CHAR(5) NOT NULL,
    PRIMARY KEY (book_id),
    FOREIGN KEY (shelf_id) REFERENCES shelf (shelf_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (book_author) REFERENCES author (author_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE employee (
    employee_id CHAR(5) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    employee_email VARCHAR(100) NOT NULL,
    employee_phone INT NOT NULL,
    PRIMARY KEY (employee_id)
);

CREATE TABLE member (
    member_id CHAR(4) NOT NULL,
    member_name VARCHAR(100) NOT NULL,
    member_address VARCHAR(100) NOT NULL,
    member_phone INT NOT NULL,
    member_email VARCHAR(100) NOT NULL,
    member_creation_date DATE NOT NULL,
    member_expired_date DATE NOT NULL,
    PRIMARY KEY (member_id)
);

CREATE TABLE loan (
    loan_id CHAR(4) NOT NULL,
    loan_date DATE NOT NULL,
    loan_return_date DATE,
    loan_due_date DATE NOT NULL,
    loan_fine INT,
    book_id CHAR(7) NOT NULL,
    member_id CHAR(4) NOT NULL,
    employee_id CHAR(5) NOT NULL,
    PRIMARY KEY (loan_id),
    FOREIGN KEY (book_id) REFERENCES book (book_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (member_id) REFERENCES member (member_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employee (employee_id) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO
    book
VALUES (
        'BK001',
        'The Great Adventure',
        'AU001',
        'Fiction',
        '2019-04-10',
        'SH001'
    ) (
        'BK002',
        'The World of Science',
        'AU002',
        'Science',
        '2020-006-15',
        'SH002'
    ) (
        'BK003',
        'American History Explained',
        'AU003',
        'History',
        '2018-02-20',
        'SH003'
    ) (
        'BK004',
        'Understanding the Cosmos',
        'AU004',
        'Science',
        '2021-09-11',
        'SH004'
    ) (
        'BK005',
        'Mystery of the old Castle',
        'AU005',
        'Fiction',
        '2022-01-05',
        'SH005'
    );

INSERT INTO
    author
VALUES (
        'AU001',
        'John Doe',
        'American',
        '1970-05-12'
    ) (
        'AU002',
        'Jane Smith',
        'British',
        '1985-07-24'
    ) (
        'AU003',
        'Robert Johnson',
        'American',
        '1962-10-02'
    ) (
        'AU004',
        'Emily Zhang',
        'Chinese',
        '1980-03-017'
    ) (
        'AU005',
        'Alice Nguyen',
        'Vietnamese',
        '1992-11-29'
    );

INSERT INTO
    employee
VALUES (
        'FT001',
        'Sarah Connor',
        'sarah@library.org',
        1234567890
    ) (
        'FT002',
        'Tom Watson',
        'tom@library.org',
        9876543210
    ) (
        'PT003',
        'Nancy Drew',
        'nancy@library.org',
        5678901234
    ) (
        'PT004',
        'James Bond',
        'james@library.org',
        4561237890
    ) (
        'FT005',
        'Laura Croft',
        'laura@library.org',
        6789012345
    );

INSERT INTO
    loan
VALUES (
        'L001',
        '2023-01-10',
        '2023-01-20',
        '2022-01-15',
        5000,
        'BK001',
        'MB001',
        'FT001'
    ) (
        'L002',
        '2023-05-12',
        '2023-05-22',
        '2023-05-15',
        20000,
        'BK002',
        'MB002',
        'FT002'
    ) (
        'L003',
        '2023-08-15',
        '2023-08-25',
        '2023-08-18',
        10000,
        'BK003',
        'MB003',
        'FT002'
    ) (
        'L004',
        '2023-11-01',
        '2023-11-05',
        '2023-11-03',
        15000,
        'BK004',
        'MB004',
        'PT003'
    ) (
        'L005',
        '2023-12-10',
        NULL,
        '2023-12-17',
        NULL,
        'BK005',
        'MB005',
        'PT003'
    );

INSERT INTO member VALUES ('M001', 'John Doe', '1234 Elm Street', 1234567890, '
