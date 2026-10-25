using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace LostFound.App.Services;

/// <summary>Membaca gambar dengan orientasi EXIF diterapkan dan ukuran diperkecil. Aman dipakai di thread latar.</summary>
internal static class BitmapHelper
{
    private const long MaxPixels = 100_000_000;
    private const string OrientationQuery = "/app1/ifd/{ushort=274}";

    /// <summary>
    /// Mendekode gambar, menerapkan orientasi EXIF, dan memperkecil sisi terpanjang menjadi maxDimension.
    /// Hasilnya sudah di-cache di memori dan dibekukan (Freeze), sehingga stream boleh ditutup setelahnya.
    /// </summary>
    public static BitmapSource Load(Stream stream, int maxDimension)
    {
        BitmapDecoder decoder = BitmapDecoder.Create(
            stream,
            BitmapCreateOptions.PreservePixelFormat | BitmapCreateOptions.IgnoreColorProfile,
            BitmapCacheOption.None);

        BitmapFrame frame = decoder.Frames[0];
        int width = frame.PixelWidth;
        int height = frame.PixelHeight;
        if (width <= 0 || height <= 0)
            throw new NotSupportedException("Ukuran gambar tidak valid.");
        if ((long)width * height > MaxPixels)
            throw new NotSupportedException("Resolusi gambar terlalu besar.");

        var transform = new TransformGroup();
        int longest = Math.Max(width, height);
        if (longest > maxDimension)
        {
            double scale = (double)maxDimension / longest;
            transform.Children.Add(new ScaleTransform(scale, scale));
        }
        AddOrientation(transform, ReadOrientation(frame));

        BitmapSource source = transform.Children.Count > 0 ? new TransformedBitmap(frame, transform) : frame;
        var cached = new CachedBitmap(source, BitmapCreateOptions.None, BitmapCacheOption.OnLoad);
        cached.Freeze();
        return cached;
    }

    private static int ReadOrientation(BitmapFrame frame)
    {
        try
        {
            if (frame.Metadata is BitmapMetadata metadata && metadata.ContainsQuery(OrientationQuery))
                return Convert.ToInt32(metadata.GetQuery(OrientationQuery));
        }
        catch
        {
            // Format tanpa EXIF (mis. PNG) atau metadata rusak: anggap orientasi normal.
        }
        return 1;
    }

    private static void AddOrientation(TransformGroup group, int orientation)
    {
        switch (orientation)
        {
            case 2: group.Children.Add(new ScaleTransform(-1, 1)); break;
            case 3: group.Children.Add(new RotateTransform(180)); break;
            case 4: group.Children.Add(new ScaleTransform(1, -1)); break;
            case 5:
                group.Children.Add(new ScaleTransform(-1, 1));
                group.Children.Add(new RotateTransform(270));
                break;
            case 6: group.Children.Add(new RotateTransform(90)); break;
            case 7:
                group.Children.Add(new ScaleTransform(-1, 1));
                group.Children.Add(new RotateTransform(90));
                break;
            case 8: group.Children.Add(new RotateTransform(270)); break;
        }
    }
}
