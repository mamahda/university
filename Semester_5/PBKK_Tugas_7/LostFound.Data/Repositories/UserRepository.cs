using LostFound.Core.Abstractions;
using LostFound.Core.Models;
using Microsoft.Data.Sqlite;

namespace LostFound.Data.Repositories;

public sealed class UserRepository(SqliteConnectionFactory db) : IUserRepository
{
    private const int SqliteConstraintError = 19;

    public Task<User?> GetByIdentityNumberAsync(string identityNumber, CancellationToken ct = default) =>
        db.RunAsync(connection =>
        {
            using var command = connection.CreateCommand();
            command.CommandText = """
                SELECT Id, IdentityNumber, FullName, PasswordHash, PasswordSalt, Role
                FROM Users
                WHERE IdentityNumber = @identity;
                """;
            command.Parameters.AddWithValue("@identity", identityNumber);

            using var reader = command.ExecuteReader();
            if (!reader.Read()) return null;

            return new User
            {
                Id = reader.GetInt64(0),
                IdentityNumber = reader.GetString(1),
                FullName = reader.GetString(2),
                PasswordHash = reader.GetString(3),
                PasswordSalt = reader.GetString(4),
                Role = Enum.Parse<UserRole>(reader.GetString(5))
            };
        }, ct);

    public Task<long> InsertAsync(User user, CancellationToken ct = default) =>
        db.RunAsync(connection =>
        {
            using var command = connection.CreateCommand();
            command.CommandText = """
                INSERT INTO Users (IdentityNumber, FullName, PasswordHash, PasswordSalt, Role)
                VALUES (@identity, @name, @hash, @salt, @role)
                RETURNING Id;
                """;
            command.Parameters.AddWithValue("@identity", user.IdentityNumber);
            command.Parameters.AddWithValue("@name", user.FullName);
            command.Parameters.AddWithValue("@hash", user.PasswordHash);
            command.Parameters.AddWithValue("@salt", user.PasswordSalt);
            command.Parameters.AddWithValue("@role", user.Role.ToString());

            try
            {
                return (long)command.ExecuteScalar()!;
            }
            catch (SqliteException ex) when (ex.SqliteErrorCode == SqliteConstraintError)
            {
                throw new DuplicateIdentityNumberException(user.IdentityNumber);
            }
        }, ct);
}
