using LostFound.Core.Models;

namespace LostFound.Data.Repositories;

public sealed class LostItemRepository(SqliteConnectionFactory db) : PostRepositoryBase(db)
{
    // Sesuai PRD 4.6: pencarian laporan kehilangan pada nama barang dan deskripsi.
    private static readonly string[] SearchColumns = ["ItemName", "Description"];

    public override PostKind Kind => PostKind.Lost;
    protected override string Table => "LostItems";
    protected override string DateColumn => "LostDate";
    protected override IReadOnlyList<string> KeywordColumns => SearchColumns;
}
