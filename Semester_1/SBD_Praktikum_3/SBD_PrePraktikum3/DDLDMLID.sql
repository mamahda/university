-- Active: 1731060400242@@127.0.0.1@3306
DROP DATABASE IF EXISTS alumni;

CREATE DATABASE IF NOT EXISTS alumni;

USE alumni;

CREATE TABLE Admin (
    P_NIK char(16) NOT NULL,
    P_Nama varchar(100) NOT NULL,
    P_JenisKelamin char(1) NOT NULL,
    P_TglLahir DATE NOT NULL,
    P_Email varchar(50) NOT NULL,
    P_NoTelp varchar(13) NOT NULL,
    P_Alamat varchar(100) NOT NULL,
    PRIMARY KEY (P_NIK)
);

CREATE TABLE Alumni (
    A_NRP char(10) NOT NULL,
    A_Nama varchar(100) NOT NULL,
    A_JenisKelamin char(1) NOT NULL,
    A_TglLahir DATE NOT NULL,
    A_Email varchar(50) NOT NULL,
    A_NoTelp varchar(13) NOT NULL,
    A_Alamat varchar(100) NOT NULL,
    A_ThnLulus char(4) NOT NULL,
    A_Pekerjaan varchar(30) NULL,
    PRIMARY KEY (A_NRP)
);

CREATE TABLE Kegiatan (
    ID_Kg char(6) NOT NULL,
    Nama_Kg varchar(150) NOT NULL,
    Wkt_kg TIMESTAMP NOT NULL,
    Tempat_Kg varchar(50) NOT NULL,
    Deskripsi_Kg varchar(150) NOT NULL,
    PRIMARY KEY (ID_Kg)
);

CREATE TABLE Shift (
    ID_Shift char(6) NOT NULL,
    Hari_Shift varchar(7) NOT NULL,
    Waktu_Mulai TIME NOT NULL,
    Waktu_Selesai TIME NOT NULL,
    PRIMARY KEY (ID_Shift)
);

CREATE TABLE Pendataan (
    PD_ID char(6) NOT NULL,
    PD_TglWaktu TIMESTAMP NOT NULL,
    Admin_P_NIK char(16) NOT NULL,
    Alumni_A_NRP char(10) NOT NULL,
    PRIMARY KEY (PD_ID),
    CONSTRAINT Pendataan_Petugas FOREIGN KEY (Admin_P_NIK) REFERENCES Admin (P_NIK),
    CONSTRAINT Alumni_Pendataan FOREIGN KEY (Alumni_A_NRP) REFERENCES Alumni (A_NRP)
);

CREATE TABLE Pendataan_Kegiatan (
    Pendataan_PD_ID char(6) NOT NULL,
    Kegiatan_ID_Kg char(6) NOT NULL,
    PRIMARY KEY (
        Pendataan_PD_ID,
        Kegiatan_ID_Kg
    ),
    CONSTRAINT Pendataan_Kegiatan_Pendataan FOREIGN KEY (Pendataan_PD_ID) REFERENCES Pendataan (PD_ID),
    CONSTRAINT Pendataan_Kegiatan_Kegiatan FOREIGN KEY (Kegiatan_ID_Kg) REFERENCES Kegiatan (ID_Kg)
);

CREATE TABLE Admin_Shift (
    Admin_P_NIK char(16) NOT NULL,
    Shift_ID_Shift char(6) NOT NULL,
    PRIMARY KEY (Admin_P_NIK, Shift_ID_Shift),
    CONSTRAINT Admin_Shift_Admin FOREIGN KEY (Admin_P_NIK) REFERENCES Admin (P_NIK),
    CONSTRAINT Admin_Shift_Shift FOREIGN KEY (Shift_ID_Shift) REFERENCES Shift (ID_Shift)
);

INSERT INTO
    admin (
        P_NIK,
        P_Nama,
        P_JenisKelamin,
        P_TglLahir,
        P_Email,
        P_NoTelp,
        P_Alamat
    )
VALUES (
        '1084384451729560',
        'Indra Nugraha',
        'L',
        '1971-08-23',
        'indra.nugraha@admin.its.ac.id',
        '082245635778',
        'Jalan Bubutan 5 no 19, Surabaya'
    ),
    (
        '1096072566374509',
        'Friska Ramadhany',
        'P',
        '1978-02-11',
        'friska.ramadhany@admin.its.ac.id',
        '081356858199',
        'Jl. Mirah delima 22 no.13, Gresik'
    ),
    (
        '1354383246696990',
        'Ahmad Mahfuddin',
        'L',
        '1987-12-19',
        'ahmad.mahfuddin@admin.its.ac.id',
        '081237138535',
        'Jalan Doho 20, Surabaya'
    ),
    (
        '1594724245844472',
        'Tania Herawati',
        'P',
        '1972-01-18',
        'tania.herawati@admin.its.ac.id',
        '085771703304',
        'Jl. Raya Gantang Baru, Gresik'
    ),
    (
        '1709102421487440',
        'Maya indriyani',
        'P',
        '1980-02-11',
        'maya.indriyani@admin.its.ac.id',
        '085201618782',
        'Jalan Embong Sawo 10, Surabaya'
    ),
    (
        '1897380868294314',
        'Prasetyo Saputra',
        'L',
        '1977-08-30',
        'prasetyo.saputra@admin.its.ac.id',
        '082306185023',
        'Jalan Mayjen HR. Mohammad 167, Surabaya'
    ),
    (
        '2212685292489926',
        'Riska Endah Cahyani',
        'P',
        '1986-08-02',
        'riska.ecahyani@admin.its.ac.id',
        '082260990827',
        'Jl. Jendral Sudirman no 30, Sidoarjo'
    ),
    (
        '2521675650671187',
        'Achmad Maulana',
        'L',
        '1977-09-28',
        'achmad.maulana@admin.its.ac.id',
        '082367304230',
        'Jalan Demak Selatan 5 no 2, Surabaya'
    ),
    (
        '2914634209430127',
        'Dwi Pangestika',
        'P',
        '1970-07-08',
        'dwi.pangestika@admin.its.ac.id',
        '087866211440',
        'Jl. Bluru Kidul no 34, Sidoarjo'
    ),
    (
        '3105167085293616',
        'Nurul Amanda',
        'P',
        '1981-09-01',
        'nurul.amanda@admin.its.ac.id',
        '081343163640',
        'Jl. Tanjung Wira, Gresik'
    ),
    (
        '3220661488840316',
        'Adi Saputra',
        'L',
        '1975-01-28',
        'adi.saputra@admin.its.ac.id',
        '088921796872',
        'Jl. Sisingamangaraja 56, Sidoarjo'
    ),
    (
        '4158089038211358',
        'Fitri Nur Rohmi',
        'P',
        '1981-04-24',
        'fitri.nrohmi@admin.its.ac.id',
        '081150453787',
        'Jln. Rantau no 15, Gresik'
    ),
    (
        '4340641188711421',
        'Agung Wicaksono',
        'L',
        '1971-06-10',
        'agung.wicaksono@admin.its.ac.id',
        '089563531583',
        'Jl. Serenity 5/33, Gresik'
    ),
    (
        '4513341910850926',
        'Wildan Hamdani',
        'L',
        '1973-02-13',
        'wildan.hamdani@admin.its.ac.id',
        '089611862497',
        'Jalan Ikan Dorang 17-19'
    ),
    (
        '4542043569153565',
        'Gita Pratiwi',
        'P',
        '1983-10-25',
        'gita.pratiwi@admin.its.ac.id',
        '082130246826',
        'Jalan Nambangan 1, Surabaya'
    );

INSERT INTO
    alumni (
        A_NRP,
        A_Nama,
        A_JenisKelamin,
        A_TglLahir,
        A_Email,
        A_NoTelp,
        A_Alamat,
        A_ThnLulus,
        A_Pekerjaan
    )
VALUES (
        '5025061001',
        ' Muhammad Ali ',
        'L',
        '1988-11-07',
        'ali23@gmail.com',
        '085276489321',
        'Jl. Diponegoro No.60, Surabaya',
        '2010',
        'Dosen'
    ),
    (
        '5025061014',
        'Candra Gusti',
        'L',
        '1988-06-06',
        'gusti78candra@gmail.com',
        '085243434387',
        'Jl. Pierre Tendean No.24, Manado',
        '2010',
        NULL
    ),
    (
        '5025061018',
        'Dhiantara Nugroho',
        'L',
        '1988-11-09',
        'nugrohotar4@gmail.com',
        '081298765678',
        'Jl. Mega Mas No.30, Manado',
        '2010',
        'CEO'
    ),
    (
        '5025061020',
        'Nur Aini',
        'P',
        '1988-11-01',
        'ain12@gmail.com',
        '081300998877',
        'Jl. Pahlawan No.60, Malang',
        '2010',
        'Wiraswasta'
    ),
    (
        '5025061047',
        'Ryan Reynaldi',
        'L',
        '1988-04-12',
        'ryan.reynaldi@gmail.com',
        '085211578690',
        ' Jl. Cipete Raya 16, Malang',
        '2010',
        'Dosen'
    ),
    (
        '5025061055',
        'Restri Amalia',
        'P',
        '1988-03-25',
        'restri.amalia@gmail.com',
        '082292802897',
        'Jl. Asia Afrika 90, Bandung',
        '2010',
        'Manager'
    ),
    (
        '5025061063',
        'Surya Darmawan',
        'L',
        '1988-09-26',
        'surya.darmawan@gmail.com',
        '085330941287',
        'Jl. Veteran 53, Banjarmasin',
        '2010',
        'Dosen'
    ),
    (
        '5025071003',
        'Sulastri',
        'P',
        '1989-04-09',
        'lastri476@gmail.com',
        '085788886546',
        'Jl. 1D No.10, Surabaya',
        '2011',
        'Manager'
    ),
    (
        '5025071008',
        'Ayu Ningsih',
        'P',
        '1989-03-02',
        'ningsih37ayu@gmail.com',
        '081352525252',
        'Jl. Sudirman No.60, Flores',
        '2011',
        'Pengusaha'
    ),
    (
        '5025071015',
        'Afrizal',
        'L',
        '1989-09-11',
        '4&frizal@gmail.com',
        '085624314323',
        'Jl. Diponegoro No.60, Medan',
        '2011',
        'Manager'
    ),
    (
        '5025071022',
        ' Nur Rahman',
        'L',
        '1989-03-11',
        'rahman99@gmail.com',
        '081288767898',
        'Jl. Kaligawe No.25, Semarang',
        '2011',
        'Direktur'
    ),
    (
        '5025071043',
        'Adam Syahputra',
        'L',
        '1989-04-09',
        'adam.syahputra@gmail.com',
        '085719981134',
        'Jl. Nyi Mas Wanawati, Cirebon',
        '2011',
        'Tech Support'
    ),
    (
        '5025071051',
        'Indah Nurhidayah',
        'P',
        '1989-06-09',
        'indah.nurhidayah@gmail.com',
        '085367269569',
        'Jl. Jend A Yani 73, Yogyakarta',
        '2011',
        'CEO'
    ),
    (
        '5025071062',
        'Mutia Aprliany',
        'P',
        '1988-07-14',
        'mutia.aprliany@gmail.com',
        '081243885378',
        'Jl. Jend Sudirman 21, Balikpapan',
        '2011',
        'Direktur'
    ),
    (
        '5025081006',
        'Vina',
        'P',
        '1990-10-08',
        'vin46@gmail.com',
        '082265434434',
        'Jl. Pahlawan No.34, Malang',
        '2012',
        NULL
    );

INSERT INTO
    pendataan (
        PD_ID,
        PD_TglWaktu,
        Admin_P_NIK,
        Alumni_A_NRP
    )
VALUES (
        'PD0001',
        '2023-05-08 01:00:00',
        '3105167085293616',
        '5025061001'
    ),
    (
        'PD0002',
        '2023-05-08 01:25:00',
        '1897380868294314',
        '5025061014'
    ),
    (
        'PD0003',
        '2023-05-08 03:00:00',
        '2521675650671187',
        '5025061018'
    ),
    (
        'PD0004',
        '2023-05-08 03:45:00',
        '2212685292489926',
        '5025061020'
    ),
    (
        'PD0005',
        '2023-05-08 04:00:00',
        '2914634209430127',
        '5025061047'
    ),
    (
        'PD0006',
        '2023-05-08 07:20:00',
        '1709102421487440',
        '5025061055'
    ),
    (
        'PD0007',
        '2023-05-08 08:00:00',
        '1084384451729560',
        '5025061063'
    ),
    (
        'PD0008',
        '2023-05-08 08:10:00',
        '1096072566374509',
        '5025071003'
    ),
    (
        'PD0009',
        '2023-05-08 09:37:00',
        '1594724245844472',
        '5025071008'
    ),
    (
        'PD0010',
        '2023-05-08 09:51:00',
        '1354383246696990',
        '5025071015'
    ),
    (
        'PD0011',
        '2023-05-09 00:11:00',
        '4513341910850926',
        '5025071022'
    ),
    (
        'PD0012',
        '2023-05-09 02:28:00',
        '4542043569153565',
        '5025071043'
    ),
    (
        'PD0013',
        '2023-05-09 02:34:00',
        '3220661488840316',
        '5025071051'
    ),
    (
        'PD0014',
        '2023-05-09 04:09:00',
        '4158089038211358',
        '5025071062'
    ),
    (
        'PD0015',
        '2023-05-09 04:44:00',
        '4340641188711421',
        '5025081006'
    );

INSERT INTO
    kegiatan (
        ID_Kg,
        Nama_Kg,
        Wkt_kg,
        Tempat_Kg,
        Deskripsi_Kg
    )
VALUES (
        'KGT001',
        'Seminar Kewirausahaan',
        '2016-01-10 06:00:00',
        'Aula Andayani',
        'Seminar tentang strategi memulai bisnis bagi Mahasiswa'
    ),
    (
        'KGT002',
        'Lomba Debat Bahasa Inggris',
        '2016-03-21 02:00:00',
        'TIF 204',
        'Kompetisi debat untuk meningkatkan kemampuan berbicara dalam bahasa Inggris'
    ),
    (
        'KGT003',
        'Festival Budaya Nasional',
        '2016-03-29 06:45:00',
        'Plaza Supeno',
        'Merayakan keberagaman budaya dengan pertunjukan makanan dan pameran budaya'
    ),
    (
        'KGT004',
        'Pelatihan Keterampilan Desain Grafis',
        '2016-04-20 08:30:00',
        'Aula Handayani',
        'Workshop untuk mahasiswa yang ingin mempelajari desain grafis'
    ),
    (
        'KGT005',
        'Workshop Pengembangan Soft Skills',
        '2016-06-15 01:30:00',
        'Aula Handayani',
        'Pelatihan tentang pengembangan kemampuan interpersonal'
    ),
    (
        'KGT006',
        'Kompetisi Seni Musik Mahasiswa',
        '2016-08-23 07:00:00',
        'Plaza Supeno',
        'Kompetisi musik antar mahasiswa dalam berbagai genre'
    ),
    (
        'KGT007',
        'Konser Amal Untuk Kebencanaan',
        '2016-09-19 12:00:00',
        'Plaza Supeno',
        'Konser amal untuk mengumpulkan dana bagi korban bencana'
    ),
    (
        'KGT008',
        'Diskusi Literasi Digital',
        '2017-03-27 06:00:00',
        'Lab. Arsitektur dan Jaringan Komputer',
        'Diskusi tentang pentingnya literasi digital di era modern'
    ),
    (
        'KGT009',
        'Workshop Keterampilan Public Speaking',
        '2017-05-18 00:30:00',
        'Aula Handayani',
        'Pelatihan untuk meningkatkan keterampilan berbicara di depan umum'
    ),
    (
        'KGT010',
        'Festival Teater Mahasiswa',
        '2017-06-12 13:00:00',
        'Aula Handayani',
        'Pertunjukan drama dan teater oleh grup teater mahasiswa'
    ),
    (
        'KGT011',
        'Diskusi Kesehatan Masyarakat',
        '2017-07-21 03:00:00',
        'Aula Handayani',
        'Diskusi tentang isu-isu kesehatan masyarakat'
    ),
    (
        'KGT012',
        'Lomba Debat Mahasiswa',
        '2017-08-03 10:00:00',
        'TIF 105',
        'Kompetisi debat antar tim mahasiswa.'
    ),
    (
        'KGT013',
        'Diskusi Panel Etika Profesional',
        '2017-10-18 07:30:00',
        'Aula Handayani',
        'Diskusi mengenai etika profesional dalam dunia kerja'
    ),
    (
        'KGT014',
        'Konser Charity Untuk Pendidikan',
        '2017-04-23 10:30:00',
        'Plaza Supeno',
        'Konser amal untuk mengumpulkan dana bagi pendidikan'
    ),
    (
        'KGT015',
        'Diskusi Etika dalam Penggunaan Teknologi',
        '2017-07-27 02:30:00',
        'Aula Handayani',
        'Diskusi mengenai etika dalam pengembangan dan penggunaan teknologi'
    ),
    (
        'KGT016',
        'Seminar Pengembangan Karir di Bidang Teknologi',
        '2017-11-20 06:00:00',
        'Aula Handayani',
        'Diskusi tentang langkah-langkah membangun karir di industri teknologi'
    ),
    (
        'KGT017',
        'Workshop Pengenalan Pemrograman Python untuk Pemula',
        '2018-02-05 02:00:00',
        'Aula Handayani',
        'Workshop untuk mahasiswa yang ingin mempelajari dasar-dasar pemrograman menggunakan bahasa Python'
    ),
    (
        'KGT018',
        'Diskusi Penggunaan Teknologi dalam Industri Kreatif',
        '2018-09-21 05:30:00',
        'Aula Handayani',
        'Diskusi mengenai pemanfaatan teknologi dalam industri kreatif'
    ),
    (
        'KGT019',
        'Seminar Peran Teknologi dalam Transformasi Bisnis',
        '2019-03-07 08:00:00',
        'Aula Handayani',
        'Diskusi mengenai peran teknologi dalam perubahan dan transformasi bisnis'
    ),
    (
        'KGT020',
        'Kompetisi Pengembangan Solusi Teknologi untuk Masalah Sosial',
        '2019-05-21 03:30:00',
        'Lab. Komputasi Cerdas dan Visi',
        'Kompetisi ide pengembangan solusi teknologi untuk menangani masalah sosial'
    );

INSERT INTO
    pendataan_kegiatan (
        Pendataan_PD_ID,
        Kegiatan_ID_Kg
    )
VALUES ('PD0001', 'KGT001'),
    ('PD0001', 'KGT003'),
    ('PD0002', 'KGT005'),
    ('PD0002', 'KGT007'),
    ('PD0002', 'KGT008'),
    ('PD0003', 'KGT020'),
    ('PD0004', 'KGT018'),
    ('PD0005', 'KGT017'),
    ('PD0006', 'KGT002'),
    ('PD0007', 'KGT010'),
    ('PD0010', 'KGT009'),
    ('PD0010', 'KGT011'),
    ('PD0010', 'KGT013'),
    ('PD0011', 'KGT006'),
    ('PD0012', 'KGT007'),
    ('PD0013', 'KGT014'),
    ('PD0014', 'KGT005');

INSERT INTO
    shift (
        ID_Shift,
        Hari_Shift,
        Waktu_Mulai,
        Waktu_Selesai
    )
VALUES (
        'SHF001',
        'Senin',
        '06:00:00',
        '12:00:00'
    ),
    (
        'SHF002',
        'Senin',
        '12:00:00',
        '17:00:00'
    ),
    (
        'SHF003',
        'Selasa',
        '06:00:00',
        '12:00:00'
    ),
    (
        'SHF004',
        'Selasa',
        '12:00:00',
        '17:00:00'
    ),
    (
        'SHF005',
        'Rabu',
        '06:00:00',
        '12:00:00'
    ),
    (
        'SHF006',
        'Rabu',
        '12:00:00',
        '17:00:00'
    ),
    (
        'SHF007',
        'Kamis',
        '06:00:00',
        '12:00:00'
    ),
    (
        'SHF008',
        'Kamis',
        '12:00:00',
        '17:00:00'
    ),
    (
        'SHF009',
        'Jumat',
        '06:00:00',
        '11:00:00'
    );

INSERT INTO
    admin_shift (Shift_ID_Shift, Admin_P_NIK)
VALUES ('SHF001', '1084384451729560'),
    ('SHF001', '1096072566374509'),
    ('SHF001', '1897380868294314'),
    ('SHF001', '2212685292489926'),
    ('SHF001', '3220661488840316'),
    ('SHF002', '1354383246696990'),
    ('SHF002', '1594724245844472'),
    ('SHF002', '2521675650671187'),
    ('SHF002', '2914634209430127'),
    ('SHF002', '4158089038211358'),
    ('SHF003', '1709102421487440'),
    ('SHF003', '3105167085293616'),
    ('SHF003', '4340641188711421'),
    ('SHF003', '4513341910850926'),
    ('SHF003', '4542043569153565'),
    ('SHF004', '4158089038211358'),
    ('SHF004', '1354383246696990'),
    ('SHF004', '1594724245844472'),
    ('SHF004', '3220661488840316'),
    ('SHF004', '2914634209430127'),
    ('SHF005', '1709102421487440'),
    ('SHF005', '1084384451729560'),
    ('SHF005', '2212685292489926'),
    ('SHF005', '1096072566374509'),
    ('SHF005', '4513341910850926'),
    ('SHF006', '4542043569153565'),
    ('SHF006', '3105167085293616'),
    ('SHF006', '1897380868294314'),
    ('SHF006', '2521675650671187'),
    ('SHF006', '4340641188711421'),
    ('SHF007', '2914634209430127'),
    ('SHF007', '2212685292489926'),
    ('SHF007', '1709102421487440'),
    ('SHF007', '1354383246696990'),
    ('SHF007', '1096072566374509'),
    ('SHF008', '3220661488840316'),
    ('SHF008', '4340641188711421'),
    ('SHF008', '4513341910850926'),
    ('SHF008', '4542043569153565'),
    ('SHF008', '1084384451729560'),
    ('SHF009', '1594724245844472'),
    ('SHF009', '3105167085293616'),
    ('SHF009', '2521675650671187'),
    ('SHF009', '1897380868294314'),
    ('SHF009', '4158089038211358');