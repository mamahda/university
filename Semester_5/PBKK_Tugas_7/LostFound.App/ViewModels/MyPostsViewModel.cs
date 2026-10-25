using System.Collections.ObjectModel;
using System.Windows.Input;
using LostFound.App.Services;
using LostFound.Core.Models;
using LostFound.Core.Services;

namespace LostFound.App.ViewModels;

/// <summary>Posting milik user: tab Temuan/Kehilangan, masing-masing dengan sub-tab Aktif/Arsip.</summary>
public sealed class MyPostsViewModel : PageViewModel
{
    private readonly AppServices _services;
    private readonly INavigationService _navigation;
    private CancellationTokenSource? _loadCts;
    private PostKind _kind = PostKind.Found;
    private bool _showArchive;
    private bool _isLoading;
    private bool _isBusy;

    public MyPostsViewModel(AppServices services, INavigationService navigation)
    {
        _services = services;
        _navigation = navigation;
        CreateCommand = new RelayCommand(() => _navigation.OpenCreateForm(Kind));
    }

    public ObservableCollection<PostCardViewModel> Items { get; } = [];

    public ICommand CreateCommand { get; }

    public PostKind Kind
    {
        get => _kind;
        private set
        {
            if (!SetProperty(ref _kind, value)) return;
            OnPropertyChanged(nameof(IsFoundTab));
            OnPropertyChanged(nameof(IsLostTab));
            _ = LoadAsync();
        }
    }

    public bool IsFoundTab
    {
        get => Kind == PostKind.Found;
        set { if (value) Kind = PostKind.Found; }
    }

    public bool IsLostTab
    {
        get => Kind == PostKind.Lost;
        set { if (value) Kind = PostKind.Lost; }
    }

    public bool ShowArchive
    {
        get => _showArchive;
        private set
        {
            if (!SetProperty(ref _showArchive, value)) return;
            OnPropertyChanged(nameof(IsActiveTab));
            OnPropertyChanged(nameof(IsArchiveTab));
            _ = LoadAsync();
        }
    }

    public bool IsActiveTab
    {
        get => !ShowArchive;
        set { if (value) ShowArchive = false; }
    }

    public bool IsArchiveTab
    {
        get => ShowArchive;
        set { if (value) ShowArchive = true; }
    }

    public bool IsLoading
    {
        get => _isLoading;
        private set
        {
            if (SetProperty(ref _isLoading, value)) OnPropertyChanged(nameof(IsEmpty));
        }
    }

    public bool IsEmpty => !IsLoading && Items.Count == 0;

    public string EmptyText => ShowArchive
        ? "Arsip kosong. Posting yang statusnya sudah selesai akan muncul di sini."
        : Kind == PostKind.Found
            ? "Anda belum memiliki posting barang temuan yang aktif."
            : "Anda belum memiliki laporan kehilangan yang aktif.";

    public string ArchiveHint => "Arsip hanya terlihat oleh Anda dan tidak tampil di dashboard.";

    public override Task OnNavigatedToAsync() => LoadAsync();

    private async Task LoadAsync()
    {
        _loadCts?.Cancel();
        var cts = new CancellationTokenSource();
        _loadCts = cts;

        PostKind kind = Kind;
        bool archived = ShowArchive;
        OnPropertyChanged(nameof(EmptyText));
        IsLoading = true;
        try
        {
            IReadOnlyList<Post> posts = await _services.Posts.GetMyPostsAsync(kind, archived, cts.Token);
            if (cts.IsCancellationRequested) return;

            Items.Clear();
            foreach (Post post in posts)
            {
                var card = new PostCardViewModel(_services, post, c => _navigation.OpenDetail(c.Post.Kind, c.Post.Id))
                {
                    StatusActionText = archived ? "Aktifkan kembali" : PostStatus.GetResolveActionLabel(kind),
                    StatusActionCommand = new AsyncRelayCommand(() => ToggleStatusAsync(post), () => !_isBusy)
                };
                Items.Add(card);
                _ = card.LoadThumbnailAsync();
            }
        }
        catch (OperationCanceledException) when (cts.IsCancellationRequested)
        {
        }
        catch (Exception ex)
        {
            if (_loadCts == cts)
                _services.Snackbar.ShowError("Gagal memuat posting Anda: " + ex.Message);
        }
        finally
        {
            if (_loadCts == cts)
            {
                IsLoading = false;
                OnPropertyChanged(nameof(IsEmpty));
            }
        }
    }

    private async Task ToggleStatusAsync(Post post)
    {
        bool resolve = !post.IsResolved;
        _isBusy = true;
        CommandManager.InvalidateRequerySuggested();
        try
        {
            ServiceResult result = await _services.Posts.SetResolvedAsync(post.Kind, post.Id, resolve);
            if (!result.Succeeded)
            {
                _services.Snackbar.ShowError(result.Error ?? "Status gagal diubah.");
            }
            else
            {
                _services.Snackbar.Show(resolve
                    ? $"Status diubah menjadi \"{PostStatus.GetLabel(post.Kind, true)}\". Posting dipindahkan ke arsip."
                    : "Posting diaktifkan kembali.");
            }
            await LoadAsync();
        }
        catch (Exception ex)
        {
            _services.Snackbar.ShowError("Terjadi kesalahan: " + ex.Message);
        }
        finally
        {
            _isBusy = false;
            CommandManager.InvalidateRequerySuggested();
        }
    }
}
