using Microsoft.Data.Sqlite;

namespace LostFound.Data;

/// <summary>Membuka koneksi SQLite ke berkas database bersama.</summary>
public sealed class SqliteConnectionFactory
{
    private const int BusyTimeoutMilliseconds = 10_000;
    private readonly string _connectionString;

    public SqliteConnectionFactory(string databasePath)
    {
        if (string.IsNullOrWhiteSpace(databasePath))
            throw new ArgumentException("Path database wajib diisi.", nameof(databasePath));

        DatabasePath = Path.GetFullPath(databasePath);
        _connectionString = new SqliteConnectionStringBuilder
        {
            DataSource = DatabasePath,
            Mode = SqliteOpenMode.ReadWriteCreate,
            ForeignKeys = true,
            DefaultTimeout = 30
        }.ToString();
    }

    public string DatabasePath { get; }

    /// <summary>
    /// Membuka koneksi baru dengan foreign key aktif dan busy_timeout, agar penulisan bersamaan
    /// dari PC lain menunggu sebentar alih-alih langsung gagal. Mode jurnal dibiarkan default (bukan WAL)
    /// karena WAL tidak didukung di folder jaringan.
    /// </summary>
    public SqliteConnection Open()
    {
        var connection = new SqliteConnection(_connectionString);
        try
        {
            connection.Open();
            using var command = connection.CreateCommand();
            command.CommandText = $"PRAGMA foreign_keys = ON; PRAGMA busy_timeout = {BusyTimeoutMilliseconds};";
            command.ExecuteNonQuery();
            return connection;
        }
        catch
        {
            connection.Dispose();
            throw;
        }
    }

    /// <summary>
    /// Menjalankan pekerjaan database di thread pool. Microsoft.Data.Sqlite bersifat sinkron di dalamnya,
    /// jadi cara ini menjaga UI tetap responsif.
    /// </summary>
    public Task<T> RunAsync<T>(Func<SqliteConnection, T> work, CancellationToken ct = default) =>
        Task.Run(() =>
        {
            ct.ThrowIfCancellationRequested();
            using SqliteConnection connection = Open();
            return work(connection);
        }, ct);
}
