namespace LostFound.Core.Models;

/// <summary>Field yang sama untuk barang temuan dan laporan kehilangan.</summary>
public abstract class Post
{
    public long Id { get; set; }
    public long UserId { get; set; }

    /// <summary>Nama lengkap pemosting (hasil JOIN ke tabel Users).</summary>
    public string OwnerName { get; set; } = string.Empty;

    public string ItemName { get; set; } = string.Empty;

    /// <summary>Nama berkas foto di folder Photos (bukan path lengkap); null jika tidak ada foto.</summary>
    public string? PhotoPath { get; set; }

    public string Category { get; set; } = string.Empty;
    public string? Location { get; set; }

    /// <summary>Tanggal ditemukan (temuan) atau tanggal kehilangan (kehilangan).</summary>
    public DateOnly Date { get; set; }

    public string Description { get; set; } = string.Empty;
    public string Contact { get; set; } = string.Empty;

    /// <summary>True jika status sudah selesai (Dikembalikan / Ditemukan), artinya posting ada di arsip.</summary>
    public bool IsResolved { get; set; }

    /// <summary>Waktu UTC.</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Waktu UTC.</summary>
    public DateTime UpdatedAt { get; set; }

    public abstract PostKind Kind { get; }

    public string StatusLabel => PostStatus.GetLabel(Kind, IsResolved);

    public static Post Create(PostKind kind) => kind switch
    {
        PostKind.Found => new FoundItem(),
        PostKind.Lost => new LostItem(),
        _ => throw new ArgumentOutOfRangeException(nameof(kind))
    };
}
