namespace LostFound.Core.Validation;

/// <summary>Kumpulan pesan kesalahan per field.</summary>
public sealed class ValidationResult
{
    private readonly Dictionary<string, string> _errors = new(StringComparer.Ordinal);

    public IReadOnlyDictionary<string, string> Errors => _errors;
    public bool IsValid => _errors.Count == 0;

    /// <summary>Menambah pesan kesalahan; pesan pertama untuk sebuah field yang dipertahankan.</summary>
    public void Add(string field, string message) => _errors.TryAdd(field, message);
}
