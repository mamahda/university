namespace LostFound.Core.Models;

/// <summary>Posting barang temuan.</summary>
public sealed class FoundItem : Post
{
    public override PostKind Kind => PostKind.Found;

    public DateOnly FoundDate
    {
        get => Date;
        set => Date = value;
    }
}
