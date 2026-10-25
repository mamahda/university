using LostFound.Core.Abstractions;
using LostFound.Core.Models;

namespace LostFound.Core.Services;

public sealed class UserSession : IUserSession
{
    public User? CurrentUser { get; private set; }

    public void SignIn(User user) => CurrentUser = user ?? throw new ArgumentNullException(nameof(user));

    public void SignOut() => CurrentUser = null;
}
