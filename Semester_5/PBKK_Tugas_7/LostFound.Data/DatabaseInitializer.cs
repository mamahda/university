using System.Reflection;
using LostFound.Core.Models;
using LostFound.Core.Services;
using Microsoft.Data.Sqlite;

namespace LostFound.Data;

/// <summary>Membuat skema database dan akun Admin awal (seed).</summary>
public static class DatabaseInitializer
{
    private const string SchemaResourceName = "LostFound.Data.Schema.schema.sql";

    public static void Initialize(SqliteConnectionFactory factory, AdminSeed adminSeed)
    {
        ArgumentNullException.ThrowIfNull(factory);
        ArgumentNullException.ThrowIfNull(adminSeed);

        string? directory = Path.GetDirectoryName(factory.DatabasePath);
        if (!string.IsNullOrEmpty(directory))
            Directory.CreateDirectory(directory);

        using SqliteConnection connection = factory.Open();
        using SqliteTransaction transaction = connection.BeginTransaction();

        using (var schema = connection.CreateCommand())
        {
            schema.Transaction = transaction;
            schema.CommandText = ReadSchema();
            schema.ExecuteNonQuery();
        }

        using (var check = connection.CreateCommand())
        {
            check.Transaction = transaction;
            check.CommandText = "SELECT COUNT(*) FROM Users WHERE Role = 'Admin';";
            long admins = (long)check.ExecuteScalar()!;
            if (admins == 0)
                SeedAdmin(connection, transaction, adminSeed);
        }

        transaction.Commit();
    }

    private static void SeedAdmin(SqliteConnection connection, SqliteTransaction transaction, AdminSeed seed)
    {
        var (hash, salt) = PasswordHasher.Hash(seed.Password);
        using var insert = connection.CreateCommand();
        insert.Transaction = transaction;
        // Jika NIM/NIP admin sudah dipakai user biasa, akun tersebut tidak diubah.
        insert.CommandText = """
            INSERT INTO Users (IdentityNumber, FullName, PasswordHash, PasswordSalt, Role)
            VALUES (@identity, @name, @hash, @salt, @role)
            ON CONFLICT (IdentityNumber) DO NOTHING;
            """;
        insert.Parameters.AddWithValue("@identity", seed.IdentityNumber);
        insert.Parameters.AddWithValue("@name", seed.FullName);
        insert.Parameters.AddWithValue("@hash", hash);
        insert.Parameters.AddWithValue("@salt", salt);
        insert.Parameters.AddWithValue("@role", nameof(UserRole.Admin));
        insert.ExecuteNonQuery();
    }

    private static string ReadSchema()
    {
        using Stream stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(SchemaResourceName)
            ?? throw new InvalidOperationException($"Resource skema '{SchemaResourceName}' tidak ditemukan.");
        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }
}

/// <summary>Data akun Admin yang dibuat saat database belum memiliki Admin.</summary>
public sealed record AdminSeed(string IdentityNumber, string FullName, string Password);
