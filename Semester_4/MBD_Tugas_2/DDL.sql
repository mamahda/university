DROP DATABASE IF EXISTS tugas_2;

CREATE DATABASE tugas_2;

CREATE TABLE singer (
    singerid VARCHAR(3) PRIMARY KEY,
    singername VARCHAR(50) NOT NULL
);

CREATE TABLE album (
    albumno VARCHAR(3) PRIMARY KEY,
    singerid VARCHAR(3) NOT NULL,
    albumname VARCHAR(100) NOT NULL,
    releaseyear INT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    FOREIGN KEY (singerid) REFERENCES singer (singerid) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE receipt (
    receiptno VARCHAR(5) PRIMARY KEY,
    customername VARCHAR(100) NOT NULL,
    receiptdate DATE NOT NULL
);

CREATE TABLE detailitem (
    detailid VARCHAR(5) PRIMARY KEY,
    albumno VARCHAR(3) NOT NULL,
    receiptno VARCHAR(5) NOT NULL,
    amount INT NOT NULL,
    totalprice NUMERIC(12, 2) NOT NULL,
    FOREIGN KEY (albumno) REFERENCES album (albumno) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (receiptno) REFERENCES receipt (receiptno) ON UPDATE CASCADE ON DELETE CASCADE
);