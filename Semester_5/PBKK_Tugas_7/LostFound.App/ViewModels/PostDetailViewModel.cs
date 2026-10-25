using System.Windows.Input;
using System.Windows.Media;
using LostFound.App.Services;
using LostFound.Core.Models;
using LostFound.Core.Services;

namespace LostFound.App.ViewModels;

/// <summary>Halaman detail posting beserta aksi pemilik (edit, status, hapus) dan takedown Admin.</summary>
public sealed class PostDetailViewModel : PageViewModel
{
    private const int PhotoSize = 1200;

    private readonly AppServices _services;
    private readonly INavigationService _navigation;
    private Post? _post;
    private ImageSource? _photo;
    private bool _isLoading;
    private bool _notFound;
    private bool _isBusy;

    public PostDetailViewModel(AppServices services, INavigationService navigation, PostKind kind, long id)
    {
        _services = services;
        _navigation = navigation;
        Kind = kind;
        Id = id;

        BackCommand = new RelayCommand(_navigation.GoBack);
        EditCommand = new RelayCommand(() => _navigation.OpenEditForm(Kind, Id), () => CanEdit && !IsBusy);
        ResolveCommand = new AsyncRelayCommand(() => SetResolvedAsync(true), () => CanResolve && !IsBusy);
        ReactivateCommand = new AsyncRelayCommand(() => SetResolvedAsync(false), () => CanReactivate && !IsBusy);
        DeleteCommand = new AsyncRelayCommand(DeleteAsync, () => CanDelete && !IsBusy);
        TakedownCommand = new AsyncRelayCommand(TakedownAsync, () => CanTakedown && !IsBusy);
    }

    public PostKind Kind { get; }
    public long Id { get; }

    public ICommand BackCommand { get; }
    public ICommand EditCommand { get; }
    public ICommand ResolveCommand { get; }
    public ICommand ReactivateCommand { get; }
    public ICommand DeleteCommand { get; }
    public ICommand TakedownCommand { get; }

    public Post? Post
    {
        get => _post;
        private set
        {
            if (!SetProperty(ref _post, value)) return;
            foreach (string name in DerivedProperties)
                OnPropertyChanged(name);
        }
    }

    private static readonly string[] DerivedProperties =
    [
        nameof(HasPost), nameof(KindLabel), nameof(ItemName), nameof(StatusLabel), nameof(IsResolved), nameof(Category),
        nameof(LocationLabel), nameof(LocationText), nameof(DateLabel), nameof(DateText), nameof(Description),
        nameof(Contact), nameof(OwnerName), nameof(CreatedText), nameof(UpdatedText), nameof(HasPhoto),
        nameof(IsOwner), nameof(CanEdit), nameof(CanResolve), nameof(CanReactivate), nameof(CanDelete),
        nameof(CanTakedown), nameof(ResolveText), nameof(HasActions)
    ];

    public bool HasPost => Post is not null;
    public string KindLabel => Formatting.KindLabel(Kind);
    public string ItemName => Post?.ItemName ?? string.Empty;
    public string StatusLabel => Post?.StatusLabel ?? string.Empty;
    public bool IsResolved => Post?.IsResolved == true;
    public string Category => Post?.Category ?? string.Empty;
    public string LocationLabel => Kind == PostKind.Found ? "Lokasi ditemukan" : "Lokasi kehilangan";
    public string LocationText => Post is null ? string.Empty : Formatting.LocationOrDefault(Post);
    public string DateLabel => Kind == PostKind.Found ? "Tanggal ditemukan" : "Tanggal kehilangan";
    public string DateText => Post is null ? string.Empty : Formatting.LongDate(Post.Date);
    public string Description => Post?.Description ?? string.Empty;
    public string Contact => Post?.Contact ?? string.Empty;
    public string OwnerName => Post?.OwnerName ?? string.Empty;
    public string CreatedText => Post is null ? string.Empty : Formatting.DateTimeLocal(Post.CreatedAt);
    public string UpdatedText => Post is null || Post.UpdatedAt == Post.CreatedAt ? string.Empty : Formatting.DateTimeLocal(Post.UpdatedAt);
    public bool HasPhoto => Post?.PhotoPath is not null;
    public string ResolveText => PostStatus.GetResolveActionLabel(Kind);

    public bool IsOwner => Post is not null && _services.Posts.IsOwner(Post);
    public bool CanEdit => IsOwner && !IsResolved;
    public bool CanResolve => IsOwner && !IsResolved;
    public bool CanReactivate => IsOwner && IsResolved;
    public bool CanDelete => IsOwner;

    /// <summary>Admin melihat tombol Takedown pada posting pengguna lain; untuk posting sendiri tersedia tombol Hapus.</summary>
    public bool CanTakedown => Post is not null && _services.Posts.CanTakedown && !IsOwner;

    public bool HasActions => IsOwner || CanTakedown;

    public ImageSource? Photo
    {
        get => _photo;
        private set => SetProperty(ref _photo, value);
    }

    public bool IsLoading
    {
        get => _isLoading;
        private set => SetProperty(ref _isLoading, value);
    }

    public bool NotFound
    {
        get => _notFound;
        private set => SetProperty(ref _notFound, value);
    }

    public bool IsBusy
    {
        get => _isBusy;
        private set
        {
            if (SetProperty(ref _isBusy, value)) CommandManager.InvalidateRequerySuggested();
        }
    }

    public override Task OnNavigatedToAsync() => LoadAsync();

    private async Task LoadAsync()
    {
        IsLoading = true;
        try
        {
            Post? post = await _services.Posts.GetDetailAsync(Kind, Id);
            string? previousPhoto = Post?.PhotoPath;
            Post = post;
            NotFound = post is null;

            if (post?.PhotoPath is null)
                Photo = null;
            else if (Photo is null || post.PhotoPath != previousPhoto)
                Photo = await _services.Images.LoadAsync(_services.Photos.GetPhotoPath(post.PhotoPath), null, PhotoSize);
        }
        catch (Exception ex)
        {
            _services.Snackbar.ShowError("Gagal memuat posting: " + ex.Message);
        }
        finally
        {
            IsLoading = false;
            CommandManager.InvalidateRequerySuggested();
        }
    }

    private async Task SetResolvedAsync(bool resolved)
    {
        await RunAsync(async () =>
        {
            ServiceResult result = await _services.Posts.SetResolvedAsync(Kind, Id, resolved);
            if (!result.Succeeded)
            {
                _services.Snackbar.ShowError(result.Error ?? "Status gagal diubah.");
                return;
            }

            _services.Snackbar.Show(resolved
                ? $"Status diubah menjadi \"{PostStatus.GetLabel(Kind, true)}\". Posting dipindahkan ke arsip."
                : "Posting diaktifkan kembali.");
            await LoadAsync();
        });
    }

    private async Task DeleteAsync()
    {
        if (!_services.Dialogs.Confirm(
                "Hapus posting?",
                $"Posting \"{ItemName}\" beserta fotonya akan dihapus permanen.",
                "Hapus",
                isDestructive: true))
            return;

        await RunAsync(async () =>
        {
            ServiceResult result = await _services.Posts.DeleteAsync(Kind, Id);
            if (!result.Succeeded)
            {
                _services.Snackbar.ShowError(result.Error ?? "Posting gagal dihapus.");
                return;
            }

            _services.Snackbar.Show("Posting berhasil dihapus.");
            _navigation.GoBack();
        });
    }

    private async Task TakedownAsync()
    {
        if (!_services.Dialogs.Confirm(
                "Takedown posting?",
                $"Posting \"{ItemName}\" milik {OwnerName} akan dihapus permanen beserta fotonya karena melanggar ketentuan.",
                "Takedown",
                isDestructive: true))
            return;

        await RunAsync(async () =>
        {
            ServiceResult result = await _services.Posts.TakedownAsync(Kind, Id);
            if (!result.Succeeded)
            {
                _services.Snackbar.ShowError(result.Error ?? "Takedown gagal.");
                return;
            }

            _services.Snackbar.Show("Posting berhasil di-takedown.");
            _navigation.GoBack();
        });
    }

    private async Task RunAsync(Func<Task> action)
    {
        IsBusy = true;
        try
        {
            await action();
        }
        catch (Exception ex)
        {
            _services.Snackbar.ShowError("Terjadi kesalahan: " + ex.Message);
        }
        finally
        {
            IsBusy = false;
        }
    }
}
