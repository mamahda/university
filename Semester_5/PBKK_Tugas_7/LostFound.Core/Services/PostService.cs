using LostFound.Core.Abstractions;
using LostFound.Core.Models;
using LostFound.Core.Validation;

namespace LostFound.Core.Services;

/// <summary>
/// Aturan bisnis posting: buat, edit, hapus, ubah status (arsip otomatis), takedown, dan pencarian.
/// Kepemilikan dan peran selalu diperiksa di sini, tidak hanya disembunyikan di tampilan.
/// </summary>
public sealed class PostService
{
    private const string NotFoundMessage = "Posting tidak ditemukan. Mungkin sudah dihapus.";
    private const string NotOwnerMessage = "Anda hanya dapat mengubah posting milik Anda sendiri.";

    private readonly IReadOnlyDictionary<PostKind, IPostRepository> _repositories;
    private readonly PhotoService _photos;
    private readonly IUserSession _session;
    private readonly TimeProvider _time;
    private long _version;

    public PostService(IEnumerable<IPostRepository> repositories, PhotoService photos, IUserSession session, TimeProvider? time = null)
    {
        _repositories = repositories.ToDictionary(r => r.Kind);
        if (!_repositories.ContainsKey(PostKind.Found) || !_repositories.ContainsKey(PostKind.Lost))
            throw new ArgumentException("Repository untuk posting temuan dan kehilangan wajib tersedia.", nameof(repositories));

        _photos = photos;
        _session = session;
        _time = time ?? TimeProvider.System;
    }

    /// <summary>Bertambah setiap kali aplikasi ini mengubah data posting; dipakai halaman untuk tahu kapan perlu memuat ulang.</summary>
    public long Version => Interlocked.Read(ref _version);

    public DateOnly Today => DateOnly.FromDateTime(_time.GetLocalNow().DateTime);

    private User CurrentUser =>
        _session.CurrentUser ?? throw new UnauthorizedAccessException("Silakan login terlebih dahulu.");

    public bool IsOwner(Post post) => _session.CurrentUser?.Id == post.UserId;

    public bool CanTakedown => _session.CurrentUser?.IsAdmin == true;

    // ---------- Baca ----------

    public async Task<PostPage> SearchActiveAsync(PostKind kind, PostFilter filter, PostCursor? after, int pageSize, CancellationToken ct = default)
    {
        _ = CurrentUser;
        if (pageSize <= 0) throw new ArgumentOutOfRangeException(nameof(pageSize));

        IReadOnlyList<Post> rows = await Repo(kind).SearchActiveAsync(Normalize(filter), after, pageSize + 1, ct);
        bool hasMore = rows.Count > pageSize;
        return new PostPage(hasMore ? rows.Take(pageSize).ToList() : rows, hasMore);
    }

    public Task<int> CountActiveAsync(PostKind kind, PostFilter filter, CancellationToken ct = default)
    {
        _ = CurrentUser;
        return Repo(kind).CountActiveAsync(Normalize(filter), ct);
    }

    public Task<IReadOnlyList<Post>> GetMyPostsAsync(PostKind kind, bool archived, CancellationToken ct = default) =>
        Repo(kind).GetByOwnerAsync(CurrentUser.Id, archived, ct);

    /// <summary>Detail posting. Posting di arsip hanya bisa dilihat pemiliknya; selain itu dianggap tidak ada.</summary>
    public async Task<Post?> GetDetailAsync(PostKind kind, long id, CancellationToken ct = default)
    {
        User user = CurrentUser;
        Post? post = await Repo(kind).GetByIdAsync(id, ct);
        if (post is null) return null;
        if (post.IsResolved && post.UserId != user.Id) return null;
        return post;
    }

    // ---------- Tulis ----------

    public async Task<ServiceResult<long>> CreateAsync(PostInput input, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(input);
        User user = CurrentUser;

        bool hasPhoto = !string.IsNullOrWhiteSpace(input.NewPhotoFile);
        ValidationResult validation = PostValidator.Validate(input, hasPhoto, Today);
        if (!validation.IsValid)
            return ServiceResult<long>.Invalid(validation);

        string? photoFile = null;
        if (hasPhoto)
        {
            ServiceResult<string> saved = await _photos.SaveAsync(input.NewPhotoFile!, ct);
            if (!saved.Succeeded)
                return ServiceResult<long>.Invalid(PhotoError(saved.Error!));
            photoFile = saved.Value;
        }

        DateTime now = _time.GetUtcNow().UtcDateTime;
        Post post = Post.Create(input.Kind);
        post.UserId = user.Id;
        post.OwnerName = user.FullName;
        post.PhotoPath = photoFile;
        post.CreatedAt = now;
        post.UpdatedAt = now;
        post.IsResolved = false;
        ApplyInput(post, input);

        try
        {
            post.Id = await Repo(input.Kind).InsertAsync(post, CancellationToken.None);
        }
        catch
        {
            _photos.Delete(photoFile);
            throw;
        }

        BumpVersion();
        return ServiceResult<long>.Ok(post.Id);
    }

    public async Task<ServiceResult> UpdateAsync(PostKind kind, long id, PostInput input, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(input);
        if (input.Kind != kind)
            return ServiceResult.Fail("Jenis posting tidak dapat diubah.");

        User user = CurrentUser;
        Post? post = await Repo(kind).GetByIdAsync(id, ct);
        if (post is null) return ServiceResult.Fail(NotFoundMessage);
        if (post.UserId != user.Id) return ServiceResult.Fail(NotOwnerMessage);
        if (post.IsResolved) return ServiceResult.Fail("Posting di arsip tidak dapat diedit. Aktifkan kembali terlebih dahulu.");

        bool hasNewPhoto = !string.IsNullOrWhiteSpace(input.NewPhotoFile);
        bool removePhoto = !hasNewPhoto && input.RemovePhoto;
        bool hasPhoto = hasNewPhoto || (post.PhotoPath is not null && !removePhoto);

        ValidationResult validation = PostValidator.Validate(input, hasPhoto, Today);
        if (!validation.IsValid)
            return ServiceResult.Invalid(validation);

        string? newPhotoFile = null;
        if (hasNewPhoto)
        {
            ServiceResult<string> saved = await _photos.SaveAsync(input.NewPhotoFile!, ct);
            if (!saved.Succeeded)
                return ServiceResult.Invalid(PhotoError(saved.Error!));
            newPhotoFile = saved.Value;
        }

        string? oldPhotoFile = post.PhotoPath;
        if (hasNewPhoto) post.PhotoPath = newPhotoFile;
        else if (removePhoto) post.PhotoPath = null;
        ApplyInput(post, input);
        post.UpdatedAt = _time.GetUtcNow().UtcDateTime;

        bool updated;
        try
        {
            updated = await Repo(kind).UpdateActiveAsync(post, CancellationToken.None);
        }
        catch
        {
            _photos.Delete(newPhotoFile);
            throw;
        }

        if (!updated)
        {
            _photos.Delete(newPhotoFile);
            return ServiceResult.Fail("Posting tidak dapat diperbarui karena sudah diarsipkan atau dihapus.");
        }

        if (oldPhotoFile is not null && oldPhotoFile != post.PhotoPath)
            _photos.Delete(oldPhotoFile);

        BumpVersion();
        return ServiceResult.Ok();
    }

    /// <summary>Mengubah status. resolved=true memindahkan posting ke arsip; false mengaktifkannya kembali.</summary>
    public async Task<ServiceResult> SetResolvedAsync(PostKind kind, long id, bool resolved, CancellationToken ct = default)
    {
        User user = CurrentUser;
        Post? post = await Repo(kind).GetByIdAsync(id, ct);
        if (post is null) return ServiceResult.Fail(NotFoundMessage);
        if (post.UserId != user.Id) return ServiceResult.Fail(NotOwnerMessage);
        if (post.IsResolved == resolved) return ServiceResult.Ok();

        bool changed = await Repo(kind).SetResolvedAsync(id, user.Id, resolved, _time.GetUtcNow().UtcDateTime, CancellationToken.None);
        if (!changed) return ServiceResult.Fail(NotFoundMessage);

        BumpVersion();
        return ServiceResult.Ok();
    }

    /// <summary>Pemilik menghapus posting miliknya beserta fotonya.</summary>
    public async Task<ServiceResult> DeleteAsync(PostKind kind, long id, CancellationToken ct = default)
    {
        User user = CurrentUser;
        Post? post = await Repo(kind).GetByIdAsync(id, ct);
        if (post is null) return ServiceResult.Fail(NotFoundMessage);
        if (post.UserId != user.Id) return ServiceResult.Fail("Anda hanya dapat menghapus posting milik Anda sendiri.");

        bool deleted = await Repo(kind).DeleteAsync(id, user.Id, CancellationToken.None);
        if (!deleted) return ServiceResult.Fail(NotFoundMessage);

        _photos.Delete(post.PhotoPath);
        BumpVersion();
        return ServiceResult.Ok();
    }

    /// <summary>Admin menghapus posting siapa pun yang melanggar ketentuan, beserta fotonya.</summary>
    public async Task<ServiceResult> TakedownAsync(PostKind kind, long id, CancellationToken ct = default)
    {
        User user = CurrentUser;
        if (!user.IsAdmin) return ServiceResult.Fail("Hanya Admin yang dapat melakukan takedown.");

        Post? post = await Repo(kind).GetByIdAsync(id, ct);
        if (post is null) return ServiceResult.Fail(NotFoundMessage);

        bool deleted = await Repo(kind).DeleteAsync(id, ownerId: null, CancellationToken.None);
        if (!deleted) return ServiceResult.Fail(NotFoundMessage);

        _photos.Delete(post.PhotoPath);
        BumpVersion();
        return ServiceResult.Ok();
    }

    // ---------- Bantuan ----------

    private IPostRepository Repo(PostKind kind) => _repositories[kind];

    private void BumpVersion() => Interlocked.Increment(ref _version);

    private static void ApplyInput(Post post, PostInput input)
    {
        post.ItemName = input.ItemName!.Trim();
        post.Category = input.Category!;
        post.Location = string.IsNullOrWhiteSpace(input.Location) ? null : input.Location.Trim();
        post.Date = input.Date!.Value;
        post.Description = input.Description!.Trim();
        post.Contact = input.Contact!.Trim();
    }

    private static ValidationResult PhotoError(string message)
    {
        var validation = new ValidationResult();
        validation.Add(PostFields.Photo, message);
        return validation;
    }

    private static PostFilter Normalize(PostFilter filter) => filter with
    {
        Keyword = string.IsNullOrWhiteSpace(filter.Keyword) ? null : filter.Keyword.Trim(),
        Location = string.IsNullOrWhiteSpace(filter.Location) ? null : filter.Location.Trim(),
        Category = Categories.IsValid(filter.Category) ? filter.Category : null
    };
}
