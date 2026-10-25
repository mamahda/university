namespace LostFound.Core.Models;

/// <summary>Nilai kolom Status di database dan label tampilannya.</summary>
public static class PostStatus
{
    public const string BelumDikembalikan = "BelumDikembalikan";
    public const string Dikembalikan = "Dikembalikan";
    public const string BelumDitemukan = "BelumDitemukan";
    public const string Ditemukan = "Ditemukan";

    public static string ToDbValue(PostKind kind, bool resolved) => kind switch
    {
        PostKind.Found => resolved ? Dikembalikan : BelumDikembalikan,
        PostKind.Lost => resolved ? Ditemukan : BelumDitemukan,
        _ => throw new ArgumentOutOfRangeException(nameof(kind))
    };

    public static bool IsResolvedDbValue(PostKind kind, string value)
    {
        if (value == ToDbValue(kind, resolved: true)) return true;
        if (value == ToDbValue(kind, resolved: false)) return false;
        throw new InvalidDataException($"Status '{value}' tidak dikenal untuk posting {kind}.");
    }

    public static string GetLabel(PostKind kind, bool resolved) => kind switch
    {
        PostKind.Found => resolved ? "Dikembalikan" : "Belum Dikembalikan",
        PostKind.Lost => resolved ? "Ditemukan" : "Belum Ditemukan",
        _ => throw new ArgumentOutOfRangeException(nameof(kind))
    };

    /// <summary>Label tombol untuk mengubah status menjadi selesai.</summary>
    public static string GetResolveActionLabel(PostKind kind) =>
        kind == PostKind.Found ? "Tandai Dikembalikan" : "Tandai Ditemukan";
}
