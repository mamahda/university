namespace LostFound.Core.Models;

/// <summary>Posting kehilangan barang.</summary>
public sealed class LostItem : Post
{
    public override PostKind Kind => PostKind.Lost;

    public DateOnly LostDate
    {
        get => Date;
        set => Date = value;
    }
}
