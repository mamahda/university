using LostFound.Core.Abstractions;
using LostFound.Core.Models;
using LostFound.Core.Validation;

namespace LostFound.Core.Services;

/// <summary>Registrasi, login, dan logout.</summary>
public sealed class AuthService(IUserRepository users, IUserSession session)
{
    public async Task<ServiceResult<User>> LoginAsync(string? identityNumber, string? password, CancellationToken ct = default)
    {
        string identity = identityNumber?.Trim() ?? string.Empty;
        if (identity.Length == 0 || string.IsNullOrEmpty(password))
            return ServiceResult<User>.Fail("NIM/NIP dan kata sandi wajib diisi.");

        User? user = await users.GetByIdentityNumberAsync(identity, ct);

        // Hash tetap dihitung walau user tidak ada, agar waktu respons tidak membocorkan NIM/NIP yang terdaftar.
        bool valid = await Task.Run(() =>
        {
            if (user is null)
            {
                PasswordHasher.Verify(password, DummyHash.Value.Hash, DummyHash.Value.Salt);
                return false;
            }
            return PasswordHasher.Verify(password, user.PasswordHash, user.PasswordSalt);
        }, ct);

        if (user is null || !valid)
            return ServiceResult<User>.Fail("NIM/NIP atau kata sandi salah.");

        session.SignIn(user);
        return ServiceResult<User>.Ok(user);
    }

    public async Task<ServiceResult<User>> RegisterAsync(
        string? fullName, string? identityNumber, string? password, string? confirmPassword, CancellationToken ct = default)
    {
        ValidationResult validation = AccountValidator.ValidateRegistration(fullName, identityNumber, password, confirmPassword);
        if (!validation.IsValid)
            return ServiceResult<User>.Invalid(validation);

        string identity = identityNumber!.Trim();
        if (await users.GetByIdentityNumberAsync(identity, ct) is not null)
            return DuplicateIdentity();

        var (hash, salt) = await Task.Run(() => PasswordHasher.Hash(password!), ct);
        var user = new User
        {
            IdentityNumber = identity,
            FullName = fullName!.Trim(),
            PasswordHash = hash,
            PasswordSalt = salt,
            Role = UserRole.User
        };

        try
        {
            user.Id = await users.InsertAsync(user, ct);
        }
        catch (DuplicateIdentityNumberException)
        {
            // Didaftarkan bersamaan dari PC lain.
            return DuplicateIdentity();
        }

        session.SignIn(user);
        return ServiceResult<User>.Ok(user);
    }

    public void Logout() => session.SignOut();

    private static ServiceResult<User> DuplicateIdentity()
    {
        var validation = new ValidationResult();
        validation.Add(AccountFields.IdentityNumber, "NIM/NIP sudah terdaftar.");
        return ServiceResult<User>.Invalid(validation);
    }

    private static readonly Lazy<(string Hash, string Salt)> DummyHash =
        new(() => PasswordHasher.Hash(Guid.NewGuid().ToString()));
}
