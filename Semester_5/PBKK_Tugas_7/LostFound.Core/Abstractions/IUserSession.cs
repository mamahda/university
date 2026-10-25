using LostFound.Core.Models;

namespace LostFound.Core.Abstractions;

/// <summary>User yang sedang login di aplikasi ini.</summary>
public interface IUserSession
{
    User? CurrentUser { get; }
    void SignIn(User user);
    void SignOut();
}
