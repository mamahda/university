namespace LostFound.Core.Abstractions;

/// <summary>Kompresi foto dan pembuatan thumbnail. Implementasinya ada di lapisan aplikasi (WPF imaging).</summary>
public interface IImageProcessor
{
    /// <summary>Mengubah gambar JPG/PNG menjadi JPEG terkompres dan thumbnail-nya.</summary>
    /// <exception cref="InvalidImageException">Data bukan gambar yang bisa dibaca.</exception>
    ProcessedImage Process(byte[] source, int maxDimension, int thumbnailMaxDimension);
}

public sealed record ProcessedImage(byte[] Photo, byte[] Thumbnail);

public sealed class InvalidImageException(string message, Exception? inner = null) : Exception(message, inner);
