namespace LostFound.Core.Models;

public enum UserRole
{
    User,
    Admin
}

public sealed class User
{
    public long Id { get; set; }
    public string IdentityNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string PasswordSalt { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;

    public bool IsAdmin => Role == UserRole.Admin;
}
