using LostFound.Core.Validation;

namespace LostFound.Core.Services;

/// <summary>Hasil operasi service: sukses, gagal dengan pesan umum, atau gagal validasi per field.</summary>
public class ServiceResult
{
    private static readonly IReadOnlyDictionary<string, string> NoErrors = new Dictionary<string, string>();

    protected ServiceResult(bool succeeded, string? error, IReadOnlyDictionary<string, string>? fieldErrors)
    {
        Succeeded = succeeded;
        Error = error;
        FieldErrors = fieldErrors ?? NoErrors;
    }

    public bool Succeeded { get; }

    /// <summary>Pesan kesalahan umum (bukan untuk field tertentu).</summary>
    public string? Error { get; }

    public IReadOnlyDictionary<string, string> FieldErrors { get; }

    public static ServiceResult Ok() => new(true, null, null);
    public static ServiceResult Fail(string error) => new(false, error, null);
    public static ServiceResult Invalid(ValidationResult validation) => new(false, null, validation.Errors);
}

public sealed class ServiceResult<T> : ServiceResult
{
    private ServiceResult(bool succeeded, T? value, string? error, IReadOnlyDictionary<string, string>? fieldErrors)
        : base(succeeded, error, fieldErrors)
    {
        Value = value;
    }

    public T? Value { get; }

    public static ServiceResult<T> Ok(T value) => new(true, value, null, null);
    public static new ServiceResult<T> Fail(string error) => new(false, default, error, null);
    public static new ServiceResult<T> Invalid(ValidationResult validation) => new(false, default, null, validation.Errors);
}
