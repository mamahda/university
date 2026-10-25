using LostFound.App.Services;
using LostFound.Core.Models;

namespace LostFound.App.ViewModels;

/// <summary>ViewModel jendela utama: berganti antara layar login dan shell.</summary>
public sealed class MainViewModel : ObservableObject
{
    private readonly AppServices _services;
    private ObservableObject _current;

    public MainViewModel(AppServices services, SnackbarService snackbar)
    {
        _services = services;
        Snackbar = snackbar;
        _current = CreateLogin();
    }

    public SnackbarService Snackbar { get; }

    public ObservableObject Current
    {
        get => _current;
        private set => SetProperty(ref _current, value);
    }

    private LoginViewModel CreateLogin() => new(_services, OnSignedIn);

    private void OnSignedIn(User user, bool isNewAccount)
    {
        Current = new ShellViewModel(_services, user, () => Current = CreateLogin());
        _services.Snackbar.Show(isNewAccount
            ? $"Akun berhasil dibuat. Selamat datang, {user.FullName}!"
            : $"Selamat datang, {user.FullName}.");
    }
}
