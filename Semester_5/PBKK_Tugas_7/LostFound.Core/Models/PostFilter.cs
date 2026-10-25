namespace LostFound.Core.Models;

/// <summary>Kriteria pencarian dashboard. Semua kriteria bisa digabung; null berarti tidak difilter.</summary>
public sealed record PostFilter
{
    public string? Keyword { get; init; }
    public string? Category { get; init; }
    public string? Location { get; init; }
    public DateOnly? DateFrom { get; init; }
    public DateOnly? DateTo { get; init; }

    /// <summary>True = terbaru dulu, false = terlama dulu (berdasarkan tanggal ditemukan/kehilangan).</summary>
    public bool NewestFirst { get; init; } = true;
}

/// <summary>Posisi item terakhir yang sudah dimuat, untuk memuat halaman berikutnya (keyset pagination).</summary>
public sealed record PostCursor(DateOnly Date, long Id);

public sealed record PostPage(IReadOnlyList<Post> Items, bool HasMore);
