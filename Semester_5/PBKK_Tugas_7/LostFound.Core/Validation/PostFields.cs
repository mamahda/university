namespace LostFound.Core.Validation;

/// <summary>Nama field untuk pesan validasi.</summary>
public static class PostFields
{
    public const string ItemName = nameof(ItemName);
    public const string Photo = nameof(Photo);
    public const string Category = nameof(Category);
    public const string Location = nameof(Location);
    public const string Date = nameof(Date);
    public const string Description = nameof(Description);
    public const string Contact = nameof(Contact);
}

public static class AccountFields
{
    public const string FullName = nameof(FullName);
    public const string IdentityNumber = nameof(IdentityNumber);
    public const string Password = nameof(Password);
    public const string ConfirmPassword = nameof(ConfirmPassword);
}
