using System.Windows.Media;

namespace LostFound.App.Services;

/// <summary>Memuat gambar untuk ditampilkan tanpa memblokir UI dan tanpa mengunci berkasnya.</summary>
public interface IImageLoader
{
    /// <summary>Mencoba path utama, lalu path cadangan. Null jika keduanya gagal.</summary>
    Task<ImageSource?> LoadAsync(string? path, string? fallbackPath, int maxDimension);
}

public sealed class ImageLoader : IImageLoader
{
    public Task<ImageSource?> LoadAsync(string? path, string? fallbackPath, int maxDimension) =>
        Task.Run(() => TryLoad(path, maxDimension) ?? TryLoad(fallbackPath, maxDimension));

    private static ImageSource? TryLoad(string? path, int maxDimension)
    {
        if (string.IsNullOrWhiteSpace(path)) return null;
        try
        {
            using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
            return BitmapHelper.Load(stream, maxDimension);
        }
        catch
        {
            return null;
        }
    }
}
