using LostFound.Core.Models;

namespace LostFound.Core.Abstractions;

/// <summary>Akses data satu jenis posting (FoundItems atau LostItems).</summary>
public interface IPostRepository
{
    PostKind Kind { get; }

    /// <summary>Posting aktif (belum selesai) yang cocok dengan filter, diurutkan sesuai filter.</summary>
    Task<IReadOnlyList<Post>> SearchActiveAsync(PostFilter filter, PostCursor? after, int limit, CancellationToken ct = default);

    Task<int> CountActiveAsync(PostFilter filter, CancellationToken ct = default);

    /// <summary>Posting milik seorang user dengan status aktif (resolved=false) atau arsip (resolved=true).</summary>
    Task<IReadOnlyList<Post>> GetByOwnerAsync(long userId, bool resolved, CancellationToken ct = default);

    Task<Post?> GetByIdAsync(long id, CancellationToken ct = default);

    Task<long> InsertAsync(Post post, CancellationToken ct = default);

    /// <summary>Memperbarui isi posting aktif milik <see cref="Post.UserId"/>. False jika tidak ada baris yang cocok.</summary>
    Task<bool> UpdateActiveAsync(Post post, CancellationToken ct = default);

    Task<bool> SetResolvedAsync(long id, long ownerId, bool resolved, DateTime updatedAtUtc, CancellationToken ct = default);

    /// <summary>Menghapus posting. Jika ownerId diisi, hanya terhapus bila pemiliknya cocok.</summary>
    Task<bool> DeleteAsync(long id, long? ownerId, CancellationToken ct = default);
}
