namespace LostFound.Core.Models;

/// <summary>Isi form posting (buat atau edit).</summary>
public sealed class PostInput
{
    public PostKind Kind { get; init; }
    public string? ItemName { get; init; }
    public string? Category { get; init; }
    public string? Location { get; init; }
    public DateOnly? Date { get; init; }
    public string? Description { get; init; }
    public string? Contact { get; init; }

    /// <summary>Path berkas foto baru yang dipilih pengguna; null jika foto tidak diganti.</summary>
    public string? NewPhotoFile { get; init; }

    /// <summary>Hapus foto lama tanpa pengganti (hanya berlaku untuk laporan kehilangan).</summary>
    public bool RemovePhoto { get; init; }
}
