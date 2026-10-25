using System.ComponentModel;
using System.Windows.Input;
using LostFound.App.Services;
using LostFound.Core.Models;

namespace LostFound.App.ViewModels;

/// <summary>Kerangka setelah login: menu di sisi kiri dan halaman aktif di kanan.</summary>
public sealed class ShellViewModel : ObservableObject
{
    private readonly AppServices _services;

    public ShellViewModel(AppServices services, User user, Action onLoggedOut)
    {
        _services = services;
        User = user;
        Navigation = new NavigationService(services);
        Navigation.PropertyChanged += OnNavigationChanged;

        ShowFoundCommand = new RelayCommand(Navigation.OpenFoundDashboard);
        ShowLostCommand = new RelayCommand(Navigation.OpenLostDashboard);
        ShowMyPostsCommand = new RelayCommand(Navigation.OpenMyPosts);
        CreatePostCommand = new RelayCommand(() => Navigation.OpenCreateForm(
            Navigation.Section == NavSection.Lost ? PostKind.Lost : PostKind.Found));
        LogoutCommand = new RelayCommand(() =>
        {
            if (!_services.Dialogs.Confirm("Keluar?", "Anda akan keluar dari aplikasi.", "Keluar")) return;
            _services.Auth.Logout();
            onLoggedOut();
        });

        Navigation.OpenFoundDashboard();
    }

    public User User { get; }
    public string UserName => User.FullName;
    public string UserIdentity => User.IdentityNumber;
    public bool IsAdmin => User.IsAdmin;
    public string Initial => string.IsNullOrWhiteSpace(User.FullName) ? "?" : User.FullName.Trim()[..1].ToUpperInvariant();

    public NavigationService Navigation { get; }

    public bool IsFoundActive => Navigation.Section == NavSection.Found;
    public bool IsLostActive => Navigation.Section == NavSection.Lost;
    public bool IsMyPostsActive => Navigation.Section == NavSection.MyPosts;
    public bool IsCreateActive => Navigation.Section == NavSection.Create;

    public ICommand ShowFoundCommand { get; }
    public ICommand ShowLostCommand { get; }
    public ICommand ShowMyPostsCommand { get; }
    public ICommand CreatePostCommand { get; }
    public ICommand LogoutCommand { get; }

    private void OnNavigationChanged(object? sender, PropertyChangedEventArgs e)
    {
        if (e.PropertyName != nameof(NavigationService.Section)) return;
        OnPropertyChanged(nameof(IsFoundActive));
        OnPropertyChanged(nameof(IsLostActive));
        OnPropertyChanged(nameof(IsMyPostsActive));
        OnPropertyChanged(nameof(IsCreateActive));
    }
}
