using LostFound.Core.Models;

namespace LostFound.Data.Repositories;

public sealed class FoundItemRepository(SqliteConnectionFactory db) : PostRepositoryBase(db)
{
    private static readonly string[] SearchColumns = ["ItemName", "Description", "Location"];

    public override PostKind Kind => PostKind.Found;
    protected override string Table => "FoundItems";
    protected override string DateColumn => "FoundDate";
    protected override IReadOnlyList<string> KeywordColumns => SearchColumns;
}
