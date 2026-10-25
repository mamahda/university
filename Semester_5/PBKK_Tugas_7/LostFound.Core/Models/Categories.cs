namespace LostFound.Core.Models;

/// <summary>Daftar kategori tetap.</summary>
public static class Categories
{
    public static IReadOnlyList<string> All { get; } =
    [
        "Dompet & Kartu",
        "Elektronik",
        "Kunci",
        "Tas",
        "Pakaian",
        "Alat Tulis & Buku",
        "Dokumen",
        "Lainnya"
    ];

    public static bool IsValid(string? category) =>
        category is not null && All.Contains(category, StringComparer.Ordinal);
}
