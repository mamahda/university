using System.Globalization;
using LostFound.Core.Models;

namespace LostFound.App.ViewModels;

/// <summary>Format teks tampilan berbahasa Indonesia.</summary>
internal static class Formatting
{
    private static readonly CultureInfo Indonesian = CultureInfo.GetCultureInfo("id-ID");

    public static string ShortDate(DateOnly date) => date.ToString("d MMM yyyy", Indonesian);

    public static string LongDate(DateOnly date) => date.ToString("dddd, d MMMM yyyy", Indonesian);

    public static string DateTimeLocal(DateTime utc) =>
        utc.ToLocalTime().ToString("d MMM yyyy, HH.mm", Indonesian);

    public static string KindLabel(PostKind kind) => kind == PostKind.Found ? "Barang Temuan" : "Kehilangan";

    public static string LocationOrDefault(Post post) =>
        string.IsNullOrWhiteSpace(post.Location) ? "Lokasi tidak diketahui" : post.Location;
}
