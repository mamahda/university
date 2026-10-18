using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using StudentRegistration.Models;

namespace StudentRegistration.Repositories;

public class StudentRepository
{
    private string _connectionString =
        @"Server=.\SQLEXPRESS;Database=StudentRegistrationDB;Trusted_Connection=True;TrustServerCertificate=True;";

    public StudentRepository()
    {
        TryLoadConnectionStringFromFile();
    }

    public StudentRepository(string connectionString)
    {
        if (!string.IsNullOrWhiteSpace(connectionString))
        {
            _connectionString = connectionString;
        }
    }

    private void TryLoadConnectionStringFromFile()
    {
        try
        {
            string configPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "appsettings.json");
            if (File.Exists(configPath))
            {
                using var doc = JsonDocument.Parse(File.ReadAllText(configPath));
                if (doc.RootElement.TryGetProperty("ConnectionStrings", out var csSection) &&
                    csSection.TryGetProperty("DefaultConnection", out var csElement))
                {
                    string? connStr = csElement.GetString();
                    if (!string.IsNullOrWhiteSpace(connStr))
                    {
                        _connectionString = connStr;
                    }
                }
            }
        }
        catch
        {
            // Default to .\SQLEXPRESS
        }
    }

    public List<Student> GetAll()
    {
        var students = new List<Student>();

        const string sql = """
            SELECT
                s.StudentId,
                s.NIM,
                s.Name,
                s.ProgramId,
                p.ProgramName,
                s.BirthDate,
                s.Address,
                s.PhoneNumber,
                s.CreatedAt,
                s.UpdatedAt
            FROM Students s
            INNER JOIN Programs p
                ON s.ProgramId = p.ProgramId
            ORDER BY s.StudentId;
            """;

        using var connection =
            new SqlConnection(_connectionString);

        using var command =
            new SqlCommand(sql, connection);

        connection.Open();

        using var reader = command.ExecuteReader();

        while (reader.Read())
        {
            students.Add(new Student
            {
                StudentId = reader.GetInt32(
                    reader.GetOrdinal("StudentId")),

                NIM = reader.GetString(
                    reader.GetOrdinal("NIM")),

                Name = reader.GetString(
                    reader.GetOrdinal("Name")),

                ProgramId = reader.GetInt32(
                    reader.GetOrdinal("ProgramId")),

                ProgramName = reader.GetString(
                    reader.GetOrdinal("ProgramName")),

                BirthDate = reader.IsDBNull(
                    reader.GetOrdinal("BirthDate"))
                    ? null
                    : reader.GetDateTime(
                        reader.GetOrdinal("BirthDate")),

                Address = reader.IsDBNull(
                    reader.GetOrdinal("Address"))
                    ? string.Empty
                    : reader.GetString(
                        reader.GetOrdinal("Address")),

                PhoneNumber = reader.IsDBNull(
                    reader.GetOrdinal("PhoneNumber"))
                    ? string.Empty
                    : reader.GetString(
                        reader.GetOrdinal("PhoneNumber")),

                CreatedAt = reader.GetDateTime(
                    reader.GetOrdinal("CreatedAt")),

                UpdatedAt = reader.IsDBNull(
                    reader.GetOrdinal("UpdatedAt"))
                    ? null
                    : reader.GetDateTime(
                        reader.GetOrdinal("UpdatedAt"))
            });
        }

        return students;
    }

    public int GetTotalStudents()
    {
        const string sql = "SELECT COUNT(*) FROM Students;";

        using var connection = new SqlConnection(_connectionString);
        using var command = new SqlCommand(sql, connection);

        connection.Open();
        var result = command.ExecuteScalar();
        return Convert.ToInt32(result);
    }

    public List<Program> GetAllPrograms()
    {
        var programs = new List<Program>();
        const string sql = """
            SELECT
                ProgramId,
                ProgramCode,
                ProgramName,
                IsActive
            FROM Programs
            WHERE IsActive = 1
            ORDER BY ProgramId;
            """;

        using var connection = new SqlConnection(_connectionString);
        using var command = new SqlCommand(sql, connection);

        connection.Open();
        using var reader = command.ExecuteReader();
        while (reader.Read())
        {
            programs.Add(new Program
            {
                ProgramId = reader.GetInt32(reader.GetOrdinal("ProgramId")),
                ProgramCode = reader.GetString(reader.GetOrdinal("ProgramCode")),
                ProgramName = reader.GetString(reader.GetOrdinal("ProgramName")),
                IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive"))
            });
        }

        return programs;
    }

    public bool Add(Student student)
    {
        const string sql = """
            INSERT INTO Students (
                NIM,
                Name,
                ProgramId,
                BirthDate,
                Address,
                PhoneNumber,
                CreatedAt
            )
            VALUES (
                @NIM,
                @Name,
                @ProgramId,
                @BirthDate,
                @Address,
                @PhoneNumber,
                SYSDATETIME()
            );
            """;

        using var connection = new SqlConnection(_connectionString);
        using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@NIM", student.NIM);
        command.Parameters.AddWithValue("@Name", student.Name);
        command.Parameters.AddWithValue("@ProgramId", student.ProgramId);
        command.Parameters.AddWithValue("@BirthDate", (object?)student.BirthDate ?? DBNull.Value);
        command.Parameters.AddWithValue("@Address", string.IsNullOrWhiteSpace(student.Address) ? (object)DBNull.Value : student.Address);
        command.Parameters.AddWithValue("@PhoneNumber", string.IsNullOrWhiteSpace(student.PhoneNumber) ? (object)DBNull.Value : student.PhoneNumber);

        connection.Open();
        int rowsAffected = command.ExecuteNonQuery();
        return rowsAffected > 0;
    }

    public bool Delete(int studentId)
    {
        const string sql = "DELETE FROM Students WHERE StudentId = @StudentId;";

        using var connection = new SqlConnection(_connectionString);
        using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@StudentId", studentId);

        connection.Open();
        int rowsAffected = command.ExecuteNonQuery();
        return rowsAffected > 0;
    }
}
