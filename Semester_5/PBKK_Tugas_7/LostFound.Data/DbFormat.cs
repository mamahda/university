using System.Globalization;

namespace LostFound.Data;

/// <summary>Format tanggal/waktu yang disimpan sebagai TEXT di SQLite.</summary>
internal static class DbFormat
{
    private const string DateFormat = "yyyy-MM-dd";
    private const string DateTimeFormat = "yyyy-MM-dd HH:mm:ss";

    public static string ToDb(DateOnly date) => date.ToString(DateFormat, CultureInfo.InvariantCulture);

    public static DateOnly ParseDate(string value) =>
        DateOnly.ParseExact(value, DateFormat, CultureInfo.InvariantCulture);

    /// <summary>Disimpan dalam UTC.</summary>
    public static string ToDb(DateTime utc) =>
        utc.ToUniversalTime().ToString(DateTimeFormat, CultureInfo.InvariantCulture);

    public static DateTime ParseDateTime(string value) =>
        DateTime.ParseExact(value, DateTimeFormat, CultureInfo.InvariantCulture,
            DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal);

    /// <summary>Meloloskan karakter khusus LIKE (\, %, _) lalu membungkus dengan %...%.</summary>
    public static string ToContainsPattern(string value) =>
        "%" + value.Replace(@"\", @"\\").Replace("%", @"\%").Replace("_", @"\_") + "%";
}
