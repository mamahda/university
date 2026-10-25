namespace LostFound.Core.Validation;

public static class AccountValidator
{
    public const int FullNameMaxLength = 100;
    public const int IdentityNumberMaxLength = 30;
    public const int PasswordMinLength = 8;
    public const int PasswordMaxLength = 128;

    public static ValidationResult ValidateRegistration(
        string? fullName, string? identityNumber, string? password, string? confirmPassword)
    {
        var result = new ValidationResult();

        string name = fullName?.Trim() ?? string.Empty;
        if (name.Length == 0)
            result.Add(AccountFields.FullName, "Nama lengkap wajib diisi.");
        else if (name.Length > FullNameMaxLength)
            result.Add(AccountFields.FullName, $"Nama lengkap maksimal {FullNameMaxLength} karakter.");

        string identity = identityNumber?.Trim() ?? string.Empty;
        if (identity.Length == 0)
            result.Add(AccountFields.IdentityNumber, "NIM/NIP wajib diisi.");
        else if (identity.Length > IdentityNumberMaxLength)
            result.Add(AccountFields.IdentityNumber, $"NIM/NIP maksimal {IdentityNumberMaxLength} karakter.");
        else if (!identity.All(char.IsAsciiLetterOrDigit))
            result.Add(AccountFields.IdentityNumber, "NIM/NIP hanya boleh berisi huruf dan angka.");

        password ??= string.Empty;
        if (password.Length < PasswordMinLength)
            result.Add(AccountFields.Password, $"Kata sandi minimal {PasswordMinLength} karakter.");
        else if (password.Length > PasswordMaxLength)
            result.Add(AccountFields.Password, $"Kata sandi maksimal {PasswordMaxLength} karakter.");

        if (password != (confirmPassword ?? string.Empty))
            result.Add(AccountFields.ConfirmPassword, "Konfirmasi kata sandi tidak sama.");

        return result;
    }
}
