using LostFound.Core.Models;

namespace LostFound.Core.Validation;

public static class PostValidator
{
    public const int ItemNameMaxLength = 100;
    public const int LocationMaxLength = 150;
    public const int FoundDescriptionMaxLength = 300;
    public const int LostDescriptionMaxLength = 1000;
    public const int ContactMinLength = 5;
    public const int ContactMaxLength = 100;

    public static int GetDescriptionMaxLength(PostKind kind) =>
        kind == PostKind.Found ? FoundDescriptionMaxLength : LostDescriptionMaxLength;

    /// <param name="input">Isi form.</param>
    /// <param name="hasPhoto">Apakah posting akan memiliki foto setelah disimpan.</param>
    /// <param name="today">Tanggal hari ini (tanggal di masa depan ditolak).</param>
    public static ValidationResult Validate(PostInput input, bool hasPhoto, DateOnly today)
    {
        var result = new ValidationResult();
        bool isFound = input.Kind == PostKind.Found;

        string itemName = input.ItemName?.Trim() ?? string.Empty;
        if (itemName.Length == 0)
            result.Add(PostFields.ItemName, "Nama barang wajib diisi.");
        else if (itemName.Length > ItemNameMaxLength)
            result.Add(PostFields.ItemName, $"Nama barang maksimal {ItemNameMaxLength} karakter.");

        if (isFound && !hasPhoto)
            result.Add(PostFields.Photo, "Foto barang wajib diunggah untuk barang temuan.");

        if (string.IsNullOrWhiteSpace(input.Category))
            result.Add(PostFields.Category, "Kategori wajib dipilih.");
        else if (!Categories.IsValid(input.Category))
            result.Add(PostFields.Category, "Kategori tidak valid.");

        string location = input.Location?.Trim() ?? string.Empty;
        if (isFound && location.Length == 0)
            result.Add(PostFields.Location, "Lokasi ditemukan wajib diisi.");
        else if (location.Length > LocationMaxLength)
            result.Add(PostFields.Location, $"Lokasi maksimal {LocationMaxLength} karakter.");

        if (input.Date is null)
            result.Add(PostFields.Date, isFound ? "Tanggal ditemukan wajib diisi." : "Tanggal kehilangan wajib diisi.");
        else if (input.Date.Value > today)
            result.Add(PostFields.Date, "Tanggal tidak boleh di masa depan.");

        string description = input.Description?.Trim() ?? string.Empty;
        int descriptionMax = GetDescriptionMaxLength(input.Kind);
        if (description.Length == 0)
            result.Add(PostFields.Description, "Deskripsi wajib diisi.");
        else if (description.Length > descriptionMax)
            result.Add(PostFields.Description, $"Deskripsi maksimal {descriptionMax} karakter.");

        string contact = input.Contact?.Trim() ?? string.Empty;
        if (contact.Length == 0)
            result.Add(PostFields.Contact, "Kontak wajib diisi.");
        else if (contact.Length < ContactMinLength)
            result.Add(PostFields.Contact, $"Kontak minimal {ContactMinLength} karakter.");
        else if (contact.Length > ContactMaxLength)
            result.Add(PostFields.Contact, $"Kontak maksimal {ContactMaxLength} karakter.");

        return result;
    }
}
