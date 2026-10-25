using System.Text;
using LostFound.Core.Abstractions;
using LostFound.Core.Models;
using Microsoft.Data.Sqlite;

namespace LostFound.Data.Repositories;

/// <summary>
/// Query bersama untuk FoundItems dan LostItems. Nama tabel/kolom berasal dari konstanta di subclass,
/// sedangkan semua nilai dari pengguna dikirim sebagai parameter ADO.NET.
/// </summary>
public abstract class PostRepositoryBase(SqliteConnectionFactory db) : IPostRepository
{
    public abstract PostKind Kind { get; }
    protected abstract string Table { get; }
    protected abstract string DateColumn { get; }

    /// <summary>Kolom yang dicari oleh kata kunci.</summary>
    protected abstract IReadOnlyList<string> KeywordColumns { get; }

    private string SelectColumns =>
        $"p.Id, p.UserId, u.FullName, p.ItemName, p.PhotoPath, p.Category, p.Location, p.{DateColumn}, " +
        "p.Description, p.Contact, p.Status, p.CreatedAt, p.UpdatedAt";

    private string ActiveStatus => PostStatus.ToDbValue(Kind, resolved: false);

    public Task<IReadOnlyList<Post>> SearchActiveAsync(PostFilter filter, PostCursor? after, int limit, CancellationToken ct = default) =>
        db.RunAsync<IReadOnlyList<Post>>(connection =>
        {
            using var command = connection.CreateCommand();
            var sql = new StringBuilder($"SELECT {SelectColumns} FROM {Table} p JOIN Users u ON u.Id = p.UserId WHERE ");
            sql.Append(BuildFilterClause(command, filter));

            if (after is not null)
            {
                string op = filter.NewestFirst ? "<" : ">";
                sql.Append($" AND (p.{DateColumn} {op} @cursorDate OR (p.{DateColumn} = @cursorDate AND p.Id {op} @cursorId))");
                command.Parameters.AddWithValue("@cursorDate", DbFormat.ToDb(after.Date));
                command.Parameters.AddWithValue("@cursorId", after.Id);
            }

            string direction = filter.NewestFirst ? "DESC" : "ASC";
            sql.Append($" ORDER BY p.{DateColumn} {direction}, p.Id {direction} LIMIT @limit;");
            command.Parameters.AddWithValue("@limit", limit);

            command.CommandText = sql.ToString();
            return ReadPosts(command);
        }, ct);

    public Task<int> CountActiveAsync(PostFilter filter, CancellationToken ct = default) =>
        db.RunAsync(connection =>
        {
            using var command = connection.CreateCommand();
            command.CommandText = $"SELECT COUNT(*) FROM {Table} p WHERE {BuildFilterClause(command, filter)};";
            return Convert.ToInt32(command.ExecuteScalar());
        }, ct);

    public Task<IReadOnlyList<Post>> GetByOwnerAsync(long userId, bool resolved, CancellationToken ct = default) =>
        db.RunAsync<IReadOnlyList<Post>>(connection =>
        {
            using var command = connection.CreateCommand();
            command.CommandText = $"""
                SELECT {SelectColumns}
                FROM {Table} p JOIN Users u ON u.Id = p.UserId
                WHERE p.UserId = @userId AND p.Status = @status
                ORDER BY p.UpdatedAt DESC, p.Id DESC;
                """;
            command.Parameters.AddWithValue("@userId", userId);
            command.Parameters.AddWithValue("@status", PostStatus.ToDbValue(Kind, resolved));
            return ReadPosts(command);
        }, ct);

    public Task<Post?> GetByIdAsync(long id, CancellationToken ct = default) =>
        db.RunAsync(connection =>
        {
            using var command = connection.CreateCommand();
            command.CommandText = $"SELECT {SelectColumns} FROM {Table} p JOIN Users u ON u.Id = p.UserId WHERE p.Id = @id;";
            command.Parameters.AddWithValue("@id", id);
            return ReadPosts(command).FirstOrDefault();
        }, ct);

    public Task<long> InsertAsync(Post post, CancellationToken ct = default) =>
        db.RunAsync(connection =>
        {
            using var command = connection.CreateCommand();
            command.CommandText = $"""
                INSERT INTO {Table}
                    (UserId, ItemName, PhotoPath, Category, Location, {DateColumn}, Description, Contact, Status, CreatedAt, UpdatedAt)
                VALUES
                    (@userId, @itemName, @photoPath, @category, @location, @date, @description, @contact, @status, @createdAt, @updatedAt)
                RETURNING Id;
                """;
            AddContentParameters(command, post);
            command.Parameters.AddWithValue("@userId", post.UserId);
            command.Parameters.AddWithValue("@status", PostStatus.ToDbValue(Kind, post.IsResolved));
            command.Parameters.AddWithValue("@createdAt", DbFormat.ToDb(post.CreatedAt));
            command.Parameters.AddWithValue("@updatedAt", DbFormat.ToDb(post.UpdatedAt));
            return (long)command.ExecuteScalar()!;
        }, ct);

    public Task<bool> UpdateActiveAsync(Post post, CancellationToken ct = default) =>
        db.RunAsync(connection =>
        {
            using var command = connection.CreateCommand();
            command.CommandText = $"""
                UPDATE {Table}
                SET ItemName = @itemName, PhotoPath = @photoPath, Category = @category, Location = @location,
                    {DateColumn} = @date, Description = @description, Contact = @contact, UpdatedAt = @updatedAt
                WHERE Id = @id AND UserId = @userId AND Status = @activeStatus;
                """;
            AddContentParameters(command, post);
            command.Parameters.AddWithValue("@updatedAt", DbFormat.ToDb(post.UpdatedAt));
            command.Parameters.AddWithValue("@id", post.Id);
            command.Parameters.AddWithValue("@userId", post.UserId);
            command.Parameters.AddWithValue("@activeStatus", ActiveStatus);
            return command.ExecuteNonQuery() == 1;
        }, ct);

    public Task<bool> SetResolvedAsync(long id, long ownerId, bool resolved, DateTime updatedAtUtc, CancellationToken ct = default) =>
        db.RunAsync(connection =>
        {
            using var command = connection.CreateCommand();
            command.CommandText = $"""
                UPDATE {Table}
                SET Status = @status, UpdatedAt = @updatedAt
                WHERE Id = @id AND UserId = @userId;
                """;
            command.Parameters.AddWithValue("@status", PostStatus.ToDbValue(Kind, resolved));
            command.Parameters.AddWithValue("@updatedAt", DbFormat.ToDb(updatedAtUtc));
            command.Parameters.AddWithValue("@id", id);
            command.Parameters.AddWithValue("@userId", ownerId);
            return command.ExecuteNonQuery() == 1;
        }, ct);

    public Task<bool> DeleteAsync(long id, long? ownerId, CancellationToken ct = default) =>
        db.RunAsync(connection =>
        {
            using var command = connection.CreateCommand();
            command.CommandText = ownerId is null
                ? $"DELETE FROM {Table} WHERE Id = @id;"
                : $"DELETE FROM {Table} WHERE Id = @id AND UserId = @userId;";
            command.Parameters.AddWithValue("@id", id);
            if (ownerId is not null)
                command.Parameters.AddWithValue("@userId", ownerId.Value);
            return command.ExecuteNonQuery() == 1;
        }, ct);

    private string BuildFilterClause(SqliteCommand command, PostFilter filter)
    {
        var clauses = new List<string> { "p.Status = @activeStatus" };
        command.Parameters.AddWithValue("@activeStatus", ActiveStatus);

        if (!string.IsNullOrWhiteSpace(filter.Keyword))
        {
            clauses.Add("(" + string.Join(" OR ", KeywordColumns.Select(c => $"p.{c} LIKE @keyword ESCAPE '\\'")) + ")");
            command.Parameters.AddWithValue("@keyword", DbFormat.ToContainsPattern(filter.Keyword.Trim()));
        }

        if (!string.IsNullOrWhiteSpace(filter.Category))
        {
            clauses.Add("p.Category = @category");
            command.Parameters.AddWithValue("@category", filter.Category);
        }

        if (!string.IsNullOrWhiteSpace(filter.Location))
        {
            clauses.Add("p.Location LIKE @locationFilter ESCAPE '\\'");
            command.Parameters.AddWithValue("@locationFilter", DbFormat.ToContainsPattern(filter.Location.Trim()));
        }

        if (filter.DateFrom is not null)
        {
            clauses.Add($"p.{DateColumn} >= @dateFrom");
            command.Parameters.AddWithValue("@dateFrom", DbFormat.ToDb(filter.DateFrom.Value));
        }

        if (filter.DateTo is not null)
        {
            clauses.Add($"p.{DateColumn} <= @dateTo");
            command.Parameters.AddWithValue("@dateTo", DbFormat.ToDb(filter.DateTo.Value));
        }

        return string.Join(" AND ", clauses);
    }

    private static void AddContentParameters(SqliteCommand command, Post post)
    {
        command.Parameters.AddWithValue("@itemName", post.ItemName);
        command.Parameters.AddWithValue("@photoPath", (object?)post.PhotoPath ?? DBNull.Value);
        command.Parameters.AddWithValue("@category", post.Category);
        command.Parameters.AddWithValue("@location", (object?)post.Location ?? DBNull.Value);
        command.Parameters.AddWithValue("@date", DbFormat.ToDb(post.Date));
        command.Parameters.AddWithValue("@description", post.Description);
        command.Parameters.AddWithValue("@contact", post.Contact);
    }

    private List<Post> ReadPosts(SqliteCommand command)
    {
        var posts = new List<Post>();
        using var reader = command.ExecuteReader();
        while (reader.Read())
        {
            Post post = Post.Create(Kind);
            post.Id = reader.GetInt64(0);
            post.UserId = reader.GetInt64(1);
            post.OwnerName = reader.GetString(2);
            post.ItemName = reader.GetString(3);
            post.PhotoPath = reader.IsDBNull(4) ? null : reader.GetString(4);
            post.Category = reader.GetString(5);
            post.Location = reader.IsDBNull(6) ? null : reader.GetString(6);
            post.Date = DbFormat.ParseDate(reader.GetString(7));
            post.Description = reader.GetString(8);
            post.Contact = reader.GetString(9);
            post.IsResolved = PostStatus.IsResolvedDbValue(Kind, reader.GetString(10));
            post.CreatedAt = DbFormat.ParseDateTime(reader.GetString(11));
            post.UpdatedAt = DbFormat.ParseDateTime(reader.GetString(12));
            posts.Add(post);
        }
        return posts;
    }
}
