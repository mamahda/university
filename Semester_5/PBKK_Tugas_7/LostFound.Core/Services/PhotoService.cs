using LostFound.Core.Abstractions;

namespace LostFound.Core.Services;

/// <summary>
/// Validasi, kompresi, dan penyimpanan foto. Foto disimpan sebagai {GUID}.jpg di folder Photos,
/// thumbnail-nya di Photos/thumbs dengan nama yang sama. Database hanya menyimpan nama berkasnya.
/// </summary>
public sealed class PhotoService
{
    public const long MaxFileSizeBytes = 5L * 1024 * 1024;
    public const int MaxPhotoDimension = 1600;
    public const int ThumbnailDimension = 480;
    private const string ThumbnailFolder = "thumbs";

    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png"];

    private readonly IImageProcessor _processor;

    public PhotoService(string photosDirectory, IImageProcessor processor)
    {
        if (string.IsNullOrWhiteSpace(photosDirectory))
            throw new ArgumentException("Folder foto wajib diisi.", nameof(photosDirectory));

        PhotosDirectory = Path.GetFullPath(photosDirectory);
        ThumbnailsDirectory = Path.Combine(PhotosDirectory, ThumbnailFolder);
        _processor = processor;
    }

    public string PhotosDirectory { get; }
    public string ThumbnailsDirectory { get; }

    public void EnsureDirectories()
    {
        Directory.CreateDirectory(PhotosDirectory);
        Directory.CreateDirectory(ThumbnailsDirectory);
    }

    /// <summary>Pemeriksaan cepat berkas sumber (ada, ekstensi JPG/PNG, ukuran maksimal 5 MB). Null jika valid.</summary>
    public static string? ValidateSourceFile(string? sourcePath)
    {
        if (string.IsNullOrWhiteSpace(sourcePath) || !File.Exists(sourcePath))
            return "Berkas foto tidak ditemukan.";

        string extension = Path.GetExtension(sourcePath);
        if (!AllowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase))
            return "Foto harus berformat JPG atau PNG.";

        long length = new FileInfo(sourcePath).Length;
        if (length == 0)
            return "Berkas foto kosong.";
        if (length > MaxFileSizeBytes)
            return "Ukuran foto maksimal 5 MB.";

        return null;
    }

    /// <summary>Memvalidasi, mengompres, dan menyimpan foto. Mengembalikan nama berkas yang disimpan.</summary>
    public Task<ServiceResult<string>> SaveAsync(string sourcePath, CancellationToken ct = default) =>
        Task.Run(() => Save(sourcePath, ct), ct);

    private ServiceResult<string> Save(string sourcePath, CancellationToken ct)
    {
        string? error = ValidateSourceFile(sourcePath);
        if (error is not null)
            return ServiceResult<string>.Fail(error);

        byte[] data = File.ReadAllBytes(sourcePath);
        if (data.LongLength > MaxFileSizeBytes)
            return ServiceResult<string>.Fail("Ukuran foto maksimal 5 MB.");
        if (!IsJpeg(data) && !IsPng(data))
            return ServiceResult<string>.Fail("Isi berkas bukan gambar JPG atau PNG yang valid.");

        ProcessedImage processed;
        try
        {
            processed = _processor.Process(data, MaxPhotoDimension, ThumbnailDimension);
        }
        catch (InvalidImageException ex)
        {
            return ServiceResult<string>.Fail(ex.Message);
        }

        ct.ThrowIfCancellationRequested();
        EnsureDirectories();

        string fileName = $"{Guid.NewGuid():N}.jpg";
        string photoPath = Path.Combine(PhotosDirectory, fileName);
        string thumbnailPath = Path.Combine(ThumbnailsDirectory, fileName);
        try
        {
            File.WriteAllBytes(photoPath, processed.Photo);
            File.WriteAllBytes(thumbnailPath, processed.Thumbnail);
        }
        catch
        {
            Delete(fileName);
            throw;
        }

        return ServiceResult<string>.Ok(fileName);
    }

    /// <summary>Path lengkap foto, atau null jika nama berkas kosong/tidak valid.</summary>
    public string? GetPhotoPath(string? fileName) =>
        IsSafeFileName(fileName) ? Path.Combine(PhotosDirectory, fileName!) : null;

    /// <summary>Path lengkap thumbnail, atau null jika nama berkas kosong/tidak valid.</summary>
    public string? GetThumbnailPath(string? fileName) =>
        IsSafeFileName(fileName) ? Path.Combine(ThumbnailsDirectory, fileName!) : null;

    /// <summary>Menghapus foto dan thumbnail-nya. Kegagalan diabaikan (misalnya berkas sudah tidak ada).</summary>
    public void Delete(string? fileName)
    {
        foreach (string? path in new[] { GetPhotoPath(fileName), GetThumbnailPath(fileName) })
        {
            if (path is null) continue;
            try
            {
                File.Delete(path);
            }
            catch (IOException) { }
            catch (UnauthorizedAccessException) { }
        }
    }

    private static bool IsSafeFileName(string? fileName) =>
        !string.IsNullOrWhiteSpace(fileName)
        && fileName == Path.GetFileName(fileName)
        && fileName.IndexOfAny(Path.GetInvalidFileNameChars()) < 0;

    private static bool IsJpeg(byte[] d) => d.Length > 3 && d[0] == 0xFF && d[1] == 0xD8 && d[2] == 0xFF;

    private static bool IsPng(byte[] d) =>
        d.Length > 8 && d[0] == 0x89 && d[1] == 0x50 && d[2] == 0x4E && d[3] == 0x47
        && d[4] == 0x0D && d[5] == 0x0A && d[6] == 0x1A && d[7] == 0x0A;
}
