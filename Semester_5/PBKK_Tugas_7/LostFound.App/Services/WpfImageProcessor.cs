using System.Windows.Media;
using System.Windows.Media.Imaging;
using LostFound.Core.Abstractions;

namespace LostFound.App.Services;

/// <summary>Kompresi foto ke JPEG dan pembuatan thumbnail memakai WPF imaging (WIC).</summary>
public sealed class WpfImageProcessor : IImageProcessor
{
    private const int PhotoQuality = 85;
    private const int ThumbnailQuality = 80;

    public ProcessedImage Process(byte[] source, int maxDimension, int thumbnailMaxDimension)
    {
        try
        {
            BitmapSource photo;
            using (var stream = new MemoryStream(source, writable: false))
            {
                photo = FlattenToBgr24(BitmapHelper.Load(stream, maxDimension));
            }

            int longest = Math.Max(photo.PixelWidth, photo.PixelHeight);
            BitmapSource thumbnail = photo;
            if (longest > thumbnailMaxDimension)
            {
                double scale = (double)thumbnailMaxDimension / longest;
                thumbnail = new TransformedBitmap(photo, new ScaleTransform(scale, scale));
            }

            return new ProcessedImage(EncodeJpeg(photo, PhotoQuality), EncodeJpeg(thumbnail, ThumbnailQuality));
        }
        catch (OutOfMemoryException ex)
        {
            throw new InvalidImageException("Gambar terlalu besar untuk diproses.", ex);
        }
        catch (Exception ex) when (ex is not InvalidImageException)
        {
            throw new InvalidImageException("Berkas tidak dapat dibaca sebagai gambar JPG/PNG.", ex);
        }
    }

    /// <summary>Menggabungkan piksel transparan dengan latar putih agar tidak menjadi hitam saat disimpan sebagai JPEG.</summary>
    private static BitmapSource FlattenToBgr24(BitmapSource source)
    {
        var bgra = new FormatConvertedBitmap(source, PixelFormats.Bgra32, null, 0);
        int width = bgra.PixelWidth;
        int height = bgra.PixelHeight;
        int sourceStride = width * 4;
        var pixels = new byte[sourceStride * height];
        bgra.CopyPixels(pixels, sourceStride, 0);

        int targetStride = (width * 3 + 3) & ~3;
        var target = new byte[targetStride * height];
        for (int y = 0; y < height; y++)
        {
            int s = y * sourceStride;
            int t = y * targetStride;
            for (int x = 0; x < width; x++, s += 4, t += 3)
            {
                int alpha = pixels[s + 3];
                int white = 255 * (255 - alpha);
                target[t] = (byte)((pixels[s] * alpha + white + 127) / 255);
                target[t + 1] = (byte)((pixels[s + 1] * alpha + white + 127) / 255);
                target[t + 2] = (byte)((pixels[s + 2] * alpha + white + 127) / 255);
            }
        }

        BitmapSource result = BitmapSource.Create(width, height, 96, 96, PixelFormats.Bgr24, null, target, targetStride);
        result.Freeze();
        return result;
    }

    private static byte[] EncodeJpeg(BitmapSource source, int quality)
    {
        var encoder = new JpegBitmapEncoder { QualityLevel = quality };
        encoder.Frames.Add(BitmapFrame.Create(source));
        using var output = new MemoryStream();
        encoder.Save(output);
        return output.ToArray();
    }
}
