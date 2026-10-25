using System.Windows.Input;
using LostFound.App.Services;
using LostFound.Core.Models;
using LostFound.Core.Services;
using LostFound.Core.Validation;

namespace LostFound.App.ViewModels;

/// <summary>Layar login dan registrasi.</summary>
public sealed class LoginViewModel : ObservableObject
{
    private readonly AppServices _services;
    private readonly Action<User, bool> _onSignedIn;

    private bool _isRegisterMode;
    private string _fullName = string.Empty;
    private string _identityNumber = string.Empty;
    private string _password = string.Empty;
    private string _confirmPassword = string.Empty;
    private string? _errorMessage;
    private string? _fullNameError;
    private string? _identityNumberError;
    private string? _passwordError;
    private string? _confirmPasswordError;
    private bool _isBusy;

    /// <param name="onSignedIn">Dipanggil setelah login/registrasi berhasil; argumen kedua true jika akun baru.</param>
    public LoginViewModel(AppServices services, Action<User, bool> onSignedIn)
    {
        _services = services;
        _onSignedIn = onSignedIn;
        SubmitCommand = new AsyncRelayCommand(SubmitAsync, () => !IsBusy);
        ToggleModeCommand = new RelayCommand(() => IsRegisterMode = !IsRegisterMode, () => !IsBusy);
    }

    public ICommand SubmitCommand { get; }
    public ICommand ToggleModeCommand { get; }

    public bool IsRegisterMode
    {
        get => _isRegisterMode;
        set
        {
            if (!SetProperty(ref _isRegisterMode, value)) return;
            OnPropertyChanged(nameof(Heading));
            OnPropertyChanged(nameof(SubmitText));
            OnPropertyChanged(nameof(ToggleText));
            OnPropertyChanged(nameof(TogglePrompt));
            ClearErrors();
        }
    }

    public string Heading => IsRegisterMode ? "Buat akun" : "Masuk";
    public string SubmitText => IsRegisterMode ? "Daftar" : "Masuk";
    public string TogglePrompt => IsRegisterMode ? "Sudah punya akun?" : "Belum punya akun?";
    public string ToggleText => IsRegisterMode ? "Masuk" : "Daftar sekarang";

    public string FullName
    {
        get => _fullName;
        set { if (SetProperty(ref _fullName, value ?? string.Empty)) FullNameError = null; }
    }

    public string IdentityNumber
    {
        get => _identityNumber;
        set { if (SetProperty(ref _identityNumber, value ?? string.Empty)) IdentityNumberError = null; }
    }

    public string Password
    {
        get => _password;
        set { if (SetProperty(ref _password, value ?? string.Empty)) PasswordError = null; }
    }

    public string ConfirmPassword
    {
        get => _confirmPassword;
        set { if (SetProperty(ref _confirmPassword, value ?? string.Empty)) ConfirmPasswordError = null; }
    }

    public string? ErrorMessage { get => _errorMessage; private set => SetProperty(ref _errorMessage, value); }
    public string? FullNameError { get => _fullNameError; private set => SetProperty(ref _fullNameError, value); }
    public string? IdentityNumberError { get => _identityNumberError; private set => SetProperty(ref _identityNumberError, value); }
    public string? PasswordError { get => _passwordError; private set => SetProperty(ref _passwordError, value); }
    public string? ConfirmPasswordError { get => _confirmPasswordError; private set => SetProperty(ref _confirmPasswordError, value); }

    public bool IsBusy
    {
        get => _isBusy;
        private set
        {
            if (SetProperty(ref _isBusy, value)) CommandManager.InvalidateRequerySuggested();
        }
    }

    private async Task SubmitAsync()
    {
        ClearErrors();
        IsBusy = true;
        try
        {
            ServiceResult<User> result = IsRegisterMode
                ? await _services.Auth.RegisterAsync(FullName, IdentityNumber, Password, ConfirmPassword)
                : await _services.Auth.LoginAsync(IdentityNumber, Password);

            if (result.Succeeded)
            {
                _onSignedIn(result.Value!, IsRegisterMode);
                return;
            }

            ErrorMessage = result.Error;
            foreach (var (field, message) in result.FieldErrors)
            {
                switch (field)
                {
                    case AccountFields.FullName: FullNameError = message; break;
                    case AccountFields.IdentityNumber: IdentityNumberError = message; break;
                    case AccountFields.Password: PasswordError = message; break;
                    case AccountFields.ConfirmPassword: ConfirmPasswordError = message; break;
                }
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = "Tidak dapat terhubung ke database: " + ex.Message;
        }
        finally
        {
            IsBusy = false;
        }
    }

    private void ClearErrors()
    {
        ErrorMessage = null;
        FullNameError = null;
        IdentityNumberError = null;
        PasswordError = null;
        ConfirmPasswordError = null;
    }
}
