using System.Text.Json;

namespace LostFound.App.Services;

/// <summary>Isi appsettings.json. Path relatif dihitung dari folder aplikasi.</summary>
public sealed class AppSettings
{
    public string DatabasePath { get; set; } = "lostfound.db";
    public string PhotosPath { get; set; } = "Photos";
    public string AdminIdentityNumber { get; set; } = "admin";
    public string AdminFullName { get; set; } = "Administrator";
    public string AdminPassword { get; set; } = "admin12345";

    public static AppSettings Load(string configDirectory, string dataDirectory)
    {
        string file = Path.Combine(configDirectory, "appsettings.json");
        AppSettings settings = new();
        if (File.Exists(file))
        {
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                ReadCommentHandling = JsonCommentHandling.Skip,
                AllowTrailingCommas = true
            };
            settings = JsonSerializer.Deserialize<AppSettings>(File.ReadAllText(file), options) ?? new AppSettings();
        }

        settings.DatabasePath = Resolve(dataDirectory, settings.DatabasePath, "lostfound.db");
        settings.PhotosPath = Resolve(dataDirectory, settings.PhotosPath, "Photos");
        if (string.IsNullOrWhiteSpace(settings.AdminIdentityNumber)) settings.AdminIdentityNumber = "admin";
        if (string.IsNullOrWhiteSpace(settings.AdminFullName)) settings.AdminFullName = "Administrator";
        if (string.IsNullOrEmpty(settings.AdminPassword)) settings.AdminPassword = "admin12345";
        settings.AdminIdentityNumber = settings.AdminIdentityNumber.Trim();
        return settings;
    }

    private static string Resolve(string baseDirectory, string? path, string fallback)
    {
        string value = string.IsNullOrWhiteSpace(path) ? fallback : Environment.ExpandEnvironmentVariables(path.Trim());
        return Path.GetFullPath(Path.IsPathRooted(value) ? value : Path.Combine(baseDirectory, value));
    }
}
