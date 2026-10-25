using LostFound.Core.Models;

namespace LostFound.Core.Abstractions;

public interface IUserRepository
{
    Task<User?> GetByIdentityNumberAsync(string identityNumber, CancellationToken ct = default);

    /// <summary>Menyimpan user baru dan mengembalikan Id-nya.</summary>
    /// <exception cref="DuplicateIdentityNumberException">NIM/NIP sudah terdaftar.</exception>
    Task<long> InsertAsync(User user, CancellationToken ct = default);
}

public sealed class DuplicateIdentityNumberException(string identityNumber)
    : Exception($"NIM/NIP '{identityNumber}' sudah terdaftar.");
