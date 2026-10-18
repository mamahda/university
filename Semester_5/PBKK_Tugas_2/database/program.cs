using System;
using System.Collections.Generic;

namespace DataMahasiswa
{
    // Class untuk merepresentasikan data mahasiswa
    class Mahasiswa
    {
        public string NRP { get; set; }
        public string Nama { get; set; }
        public string Prodi { get; set; }
        public double IPK { get; set; }

        // Constructor
        public Mahasiswa(string nrp, string nama, string prodi, double ipk)
        {
            NRP = nrp;
            Nama = nama;
            Prodi = prodi;
            IPK = ipk;
        }
    }

    class Program
    {
        // List untuk menyimpan data mahasiswa
        static List<Mahasiswa> daftarMahasiswa =
        new List<Mahasiswa>();



        static void Main(string[] args)
        {
            int pilihan;

            do
            {
                TampilkanMenu();

                Console.Write("Pilihan: ");
                string input = Console.ReadLine();

                if (!int.TryParse(input, out pilihan))
                {
                    pilihan = 0;
                }

                Console.WriteLine();

                switch (pilihan)
                {
                    case 1:
                        TambahMahasiswa();
                        break;

                    case 2:
                        TampilkanMahasiswa();
                        break;

                    case 3:



                        CariMahasiswa();
                        break;

                    case 4:
                        HapusMahasiswa();
                        break;

                    case 5:
                        Console.WriteLine(
                        "Terima kasih telah menggunakan program."
                        );
                        break;

                    default:
                        Console.WriteLine(
                        "Pilihan tidak tersedia!"
                        );
                        break;
                }

                if (pilihan != 5)
                {
                    Console.WriteLine();
                    Console.WriteLine(
                    "Tekan ENTER untuk melanjutkan..."
                    );
                    Console.ReadLine();
                }



            } while (pilihan != 5);
        }

        // ==========================================
        // METHOD MENAMPILKAN MENU
        // ==========================================

        static void TampilkanMenu()
        {
            Console.Clear();

            Console.WriteLine("========================================");
            Console.WriteLine(" SISTEM DATA MAHASISWA");
            Console.WriteLine("========================================");
            Console.WriteLine("1. Tambah Mahasiswa");
            Console.WriteLine("2. Tampilkan Mahasiswa");
            Console.WriteLine("3. Cari Mahasiswa");
            Console.WriteLine("4. Hapus Mahasiswa");
            Console.WriteLine("5. Keluar");
            Console.WriteLine("========================================");
        }

        // ==========================================
        // METHOD TAMBAH MAHASISWA
        // ==========================================

        static void TambahMahasiswa()



        {
            Console.Clear();

            Console.WriteLine("========================================");
            Console.WriteLine(" TAMBAH MAHASISWA");
            Console.WriteLine("========================================");

            Console.Write("NRP : ");
            string nrp = Console.ReadLine();

            Console.Write("Nama : ");
            string nama = Console.ReadLine();

            Console.Write("Program Studi : ");
            string prodi = Console.ReadLine();

            double ipk;

            while (true)
            {
                Console.Write("IPK : ");

                if (double.TryParse(
                Console.ReadLine(),
                out ipk))
                {
                    if (ipk >= 0 && ipk <= 4)
                    {
                        break;



                    }
                }

                Console.WriteLine(
                "IPK harus berupa angka 0 - 4."
                );
            }

            Mahasiswa mahasiswa =
            new Mahasiswa(
            nrp,
            nama,
            prodi,
            ipk
            );

            daftarMahasiswa.Add(mahasiswa);

            Console.WriteLine();
            Console.WriteLine(
            "Data mahasiswa berhasil ditambahkan."
            );
        }

        // ==========================================
        // METHOD MENAMPILKAN DATA
        // ==========================================



        static void TampilkanMahasiswa()
        {
            Console.Clear();

            Console.WriteLine("==========================================================");
            Console.WriteLine(" DAFTAR MAHASISWA");
            Console.WriteLine("==========================================================");

            if (daftarMahasiswa.Count == 0)
            {
                Console.WriteLine(
                "Belum ada data mahasiswa."
                );

                return;
            }

            Console.WriteLine(
            "{0,-12} {1,-20} {2,-20} {3,5}",
            "NRP",
            "Nama",
            "Prodi",
            "IPK"
            );

            Console.WriteLine(
            "----------------------------------------------------------"
            );



            foreach (Mahasiswa m in daftarMahasiswa)
            {
                Console.WriteLine(
                "{0,-12} {1,-20} {2,-20} {3,5:F2}",
                m.NRP,
                m.Nama,
                m.Prodi,
                m.IPK
                );
            }

            Console.WriteLine(
            "=========================================================="
            );
        }

        // ==========================================
        // METHOD MENCARI MAHASISWA
        // ==========================================

        static void CariMahasiswa()
        {
            Console.Clear();

            Console.WriteLine("========================================");
            Console.WriteLine(" CARI MAHASISWA");
            Console.WriteLine("========================================");



            Console.Write("Masukkan NRP: ");
            string nrpCari = Console.ReadLine();

            Mahasiswa mahasiswaDitemukan = null;

            foreach (Mahasiswa m in daftarMahasiswa)
            {
                if (m.NRP.Equals(
                nrpCari,
                StringComparison.OrdinalIgnoreCase))
                {
                    mahasiswaDitemukan = m;
                    break;
                }
            }

            Console.WriteLine();

            if (mahasiswaDitemukan != null)
            {
                Console.WriteLine("Data ditemukan!");
                Console.WriteLine(
                "NRP : " + mahasiswaDitemukan.NRP
                );
                Console.WriteLine(
                "Nama : " + mahasiswaDitemukan.Nama
                );
                Console.WriteLine(
                "Prodi : " + mahasiswaDitemukan.Prodi



                );
                Console.WriteLine(
                "IPK : " + mahasiswaDitemukan.IPK.ToString("F2")
                );
            }
            else
            {
                Console.WriteLine(
                "Mahasiswa dengan NRP tersebut tidak ditemukan."
                );
            }
        }

        // ==========================================
        // METHOD MENGHAPUS MAHASISWA
        // ==========================================

        static void HapusMahasiswa()
        {
            Console.Clear();

            Console.WriteLine("========================================");
            Console.WriteLine(" HAPUS MAHASISWA");
            Console.WriteLine("========================================");

            Console.Write("Masukkan NRP: ");
            string nrpHapus = Console.ReadLine();



            Mahasiswa mahasiswaDitemukan = null;

            foreach (Mahasiswa m in daftarMahasiswa)
            {
                if (m.NRP.Equals(
                nrpHapus,
                StringComparison.OrdinalIgnoreCase))
                {
                    mahasiswaDitemukan = m;
                    break;
                }
            }

            if (mahasiswaDitemukan != null)
            {
                daftarMahasiswa.Remove(
                mahasiswaDitemukan
                );

                Console.WriteLine();
                Console.WriteLine(
                "Data mahasiswa berhasil dihapus."
                );
            }
            else
            {
                Console.WriteLine();
                Console.WriteLine(
                "Data mahasiswa tidak ditemukan."



                );
            }
        }
    }
}
