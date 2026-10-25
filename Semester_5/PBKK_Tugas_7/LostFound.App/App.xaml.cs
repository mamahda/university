using System.Globalization;
using System.Windows;
using System.Windows.Markup;
using System.Windows.Threading;
using LostFound.App.Services;
using LostFound.App.ViewModels;
using LostFound.App.Views;
using LostFound.Core.Abstractions;
using LostFound.Core.Services;
using LostFound.Data;
using LostFound.Data.Repositories;
using Microsoft.Data.Sqlite;

namespace LostFound.App;

/// <summary>Composition root: membaca konfigurasi, menyiapkan database, dan merangkai semua lapisan.</summary>
public partial class App : Application
{
    private SnackbarService? _snackbar;

    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);
        UseIndonesianCulture();
        DispatcherUnhandledException += OnDispatcherUnhandledException;

        AppServices services;
        try
        {
            string dataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "LostFound");
            AppSettings settings = AppSettings.Load(AppContext.BaseDirectory, dataDir);

            var db = new SqliteConnectionFactory(settings.DatabasePath);
            DatabaseInitializer.Initialize(db, new AdminSeed(
                settings.AdminIdentityNumber, settings.AdminFullName, settings.AdminPassword));

            var photos = new PhotoService(settings.PhotosPath, new WpfImageProcessor());
            photos.EnsureDirectories();

            var session = new UserSession();
            IPostRepository[] postRepositories = [new FoundItemRepository(db), new LostItemRepository(db)];
            _snackbar = new SnackbarService();

            services = new AppServices(
                Auth: new AuthService(new UserRepository(db), session),
                Posts: new PostService(postRepositories, photos, session),
                Photos: photos,
                Session: session,
                Dialogs: new DialogService(),
                Snackbar: _snackbar,
                Images: new ImageLoader());
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                "Aplikasi tidak dapat dimulai karena database atau folder foto tidak dapat diakses.\n\n" +
                "Periksa DatabasePath dan PhotosPath di appsettings.json.\n\nDetail: " + ex.Message,
                "Lost and Found",
                MessageBoxButton.OK,
                MessageBoxImage.Error);
            Shutdown(1);
            return;
        }

        var window = new MainWindow { DataContext = new MainViewModel(services, _snackbar) };
        MainWindow = window;
        window.Show();
    }

    protected override void OnExit(ExitEventArgs e)
    {
        SqliteConnection.ClearAllPools();
        base.OnExit(e);
    }

    private static void UseIndonesianCulture()
    {
        var culture = CultureInfo.GetCultureInfo("id-ID");
        CultureInfo.DefaultThreadCurrentCulture = culture;
        CultureInfo.DefaultThreadCurrentUICulture = culture;
        CultureInfo.CurrentCulture = culture;
        CultureInfo.CurrentUICulture = culture;
        FrameworkElement.LanguageProperty.OverrideMetadata(
            typeof(FrameworkElement),
            new FrameworkPropertyMetadata(XmlLanguage.GetLanguage(culture.IetfLanguageTag)));
    }

    private void OnDispatcherUnhandledException(object sender, DispatcherUnhandledExceptionEventArgs e)
    {
        e.Handled = true;
        string message = "Terjadi kesalahan: " + e.Exception.Message;
        if (_snackbar is not null && MainWindow?.IsVisible == true)
            _snackbar.ShowError(message);
        else
            MessageBox.Show(message, "Lost and Found", MessageBoxButton.OK, MessageBoxImage.Error);
    }
}
