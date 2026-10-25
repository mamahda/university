using System.Windows.Threading;
using LostFound.App.ViewModels;

namespace LostFound.App.Services;

public interface ISnackbarService
{
    void Show(string message);
    void ShowError(string message);
}

/// <summary>Pesan singkat di bagian bawah jendela yang hilang sendiri. Diikat ke MainWindow.</summary>
public sealed class SnackbarService : ObservableObject, ISnackbarService
{
    private readonly DispatcherTimer _timer;
    private string _message = string.Empty;
    private bool _isError;
    private bool _isVisible;

    public SnackbarService()
    {
        _timer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(3.5) };
        _timer.Tick += (_, _) => Hide();
        CloseCommand = new RelayCommand(Hide);
    }

    public string Message
    {
        get => _message;
        private set => SetProperty(ref _message, value);
    }

    public bool IsError
    {
        get => _isError;
        private set => SetProperty(ref _isError, value);
    }

    public bool IsVisible
    {
        get => _isVisible;
        private set => SetProperty(ref _isVisible, value);
    }

    public RelayCommand CloseCommand { get; }

    public void Show(string message) => Display(message, isError: false);

    public void ShowError(string message) => Display(message, isError: true);

    private void Display(string message, bool isError)
    {
        _timer.Stop();
        Message = message;
        IsError = isError;
        IsVisible = true;
        _timer.Interval = TimeSpan.FromSeconds(isError ? 5 : 3.5);
        _timer.Start();
    }

    private void Hide()
    {
        _timer.Stop();
        IsVisible = false;
    }
}
