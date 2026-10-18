using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;
using Microsoft.Data.SqlClient;
using StudentRegistration.Models;
using StudentRegistration.Repositories;

namespace StudentRegistration;

public partial class MainWindow : Window
{
    private readonly StudentRepository _studentRepository;

    public MainWindow()
    {
        InitializeComponent();

        _studentRepository = new StudentRepository();

        LoadPrograms();
        LoadStudents();
    }

    private void LoadPrograms()
    {
        try
        {
            var programs = _studentRepository.GetAllPrograms();
            if (programs.Count > 0)
            {
                cmbProdi.ItemsSource = programs;
            }
            else
            {
                cmbProdi.ItemsSource = GetFallbackPrograms();
            }
        }
        catch
        {
            cmbProdi.ItemsSource = GetFallbackPrograms();
        }
    }

    private static List<Program> GetFallbackPrograms()
    {
        return new List<Program>
        {
            new Program { ProgramId = 1, ProgramCode = "TI", ProgramName = "Teknik Informatika" },
            new Program { ProgramId = 2, ProgramCode = "SI", ProgramName = "Sistem Informasi" },
            new Program { ProgramId = 3, ProgramCode = "MNJ", ProgramName = "Manajemen" },
            new Program { ProgramId = 4, ProgramCode = "TE", ProgramName = "Teknik Elektro" },
            new Program { ProgramId = 5, ProgramCode = "DKV", ProgramName = "Desain Komunikasi Visual" }
        };
    }

    private void LoadStudents()
    {
        try
        {
            var students = _studentRepository.GetAll();
            StudentDataGrid.ItemsSource = students;

            int total = _studentRepository.GetTotalStudents();
            txtTotalMahasiswa.Text = $"Total Mahasiswa: {total}";

            txtStatus.Text = $"Berhasil memuat {students.Count} mahasiswa dari SQL Server pada {DateTime.Now:HH:mm:ss}";
        }
        catch (Exception ex)
        {
            txtStatus.Text = "Koneksi ke database gagal. Pastikan service SQL Server aktif.";
            MessageBox.Show(
                ex.Message + "\n\nPastikan service SQL Server (SQLEXPRESS) berjalan dan database StudentRegistrationDB telah dibuat via script SQL.",
                "Database Error",
                MessageBoxButton.OK,
                MessageBoxImage.Error);
        }
    }

    private void BtnSimpan_Click(object sender, RoutedEventArgs e)
    {
        string nim = txtNim.Text.Trim();
        string nama = txtNama.Text.Trim();

        if (string.IsNullOrWhiteSpace(nim))
        {
            MessageBox.Show("NIM harus diisi!", "Validasi Form", MessageBoxButton.OK, MessageBoxImage.Warning);
            txtNim.Focus();
            return;
        }

        if (string.IsNullOrWhiteSpace(nama))
        {
            MessageBox.Show("Nama Mahasiswa harus diisi!", "Validasi Form", MessageBoxButton.OK, MessageBoxImage.Warning);
            txtNama.Focus();
            return;
        }

        if (cmbProdi.SelectedValue == null)
        {
            MessageBox.Show("Pilih Program Studi!", "Validasi Form", MessageBoxButton.OK, MessageBoxImage.Warning);
            cmbProdi.Focus();
            return;
        }

        var student = new Student
        {
            NIM = nim,
            Name = nama,
            ProgramId = Convert.ToInt32(cmbProdi.SelectedValue),
            BirthDate = dpBirthDate.SelectedDate,
            PhoneNumber = txtTelepon.Text.Trim(),
            Address = txtAlamat.Text.Trim()
        };

        try
        {
            bool success = _studentRepository.Add(student);
            if (success)
            {
                MessageBox.Show(
                    "Data mahasiswa berhasil disimpan ke database SQL Server!",
                    "Informasi",
                    MessageBoxButton.OK,
                    MessageBoxImage.Information);

                ResetForm();
                LoadStudents();
            }
        }
        catch (SqlException sqlEx) when (sqlEx.Number == 2627 || sqlEx.Number == 2601)
        {
            MessageBox.Show(
                $"NIM '{nim}' sudah terdaftar dalam database! Gunakan NIM lain.",
                "Duplikasi NIM",
                MessageBoxButton.OK,
                MessageBoxImage.Warning);
            txtNim.Focus();
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                ex.Message,
                "Database Error",
                MessageBoxButton.OK,
                MessageBoxImage.Error);
        }
    }

    private void BtnHapus_Click(object sender, RoutedEventArgs e)
    {
        if (StudentDataGrid.SelectedItem is not Student selectedStudent)
        {
            MessageBox.Show(
                "Pilih data mahasiswa pada tabel yang ingin dihapus!",
                "Peringatan",
                MessageBoxButton.OK,
                MessageBoxImage.Warning);
            return;
        }

        var confirm = MessageBox.Show(
            $"Apakah Anda yakin ingin menghapus mahasiswa berikut dari database SQL Server?\n\nNIM: {selectedStudent.NIM}\nNama: {selectedStudent.Name}\nProgram: {selectedStudent.ProgramName}",
            "Konfirmasi Hapus",
            MessageBoxButton.YesNo,
            MessageBoxImage.Question);

        if (confirm != MessageBoxResult.Yes)
        {
            return;
        }

        try
        {
            bool success = _studentRepository.Delete(selectedStudent.StudentId);
            if (success)
            {
                MessageBox.Show(
                    "Data mahasiswa berhasil dihapus dari database SQL Server!",
                    "Informasi",
                    MessageBoxButton.OK,
                    MessageBoxImage.Information);

                ResetForm();
                LoadStudents();
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                ex.Message,
                "Database Error",
                MessageBoxButton.OK,
                MessageBoxImage.Error);
        }
    }

    private void BtnReset_Click(object sender, RoutedEventArgs e)
    {
        ResetForm();
    }

    private void ResetForm()
    {
        txtNim.Clear();
        txtNama.Clear();
        cmbProdi.SelectedIndex = -1;
        dpBirthDate.SelectedDate = null;
        txtTelepon.Clear();
        txtAlamat.Clear();
        StudentDataGrid.SelectedItem = null;
        txtNim.Focus();
    }

    private void StudentDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        if (StudentDataGrid.SelectedItem is Student student)
        {
            txtNim.Text = student.NIM;
            txtNama.Text = student.Name;
            cmbProdi.SelectedValue = student.ProgramId;
            dpBirthDate.SelectedDate = student.BirthDate;
            txtTelepon.Text = student.PhoneNumber;
            txtAlamat.Text = student.Address;

            txtStatus.Text = $"Memilih: {student.Name} ({student.NIM}) - ID: {student.StudentId}";
        }
    }

    private void RefreshButton_Click(object sender, RoutedEventArgs e)
    {
        LoadPrograms();
        LoadStudents();
    }
}