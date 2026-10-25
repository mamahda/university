using System.Collections.ObjectModel;
using System.Windows.Input;
using LostFound.App.Services;
using LostFound.Core.Models;

namespace LostFound.App.ViewModels;

/// <summary>Logika bersama Dashboard Barang Temuan dan Dashboard Laporan Kehilangan.</summary>
public abstract class DashboardViewModelBase : PageViewModel
{
    public const string AllCategories = "Semua kategori";
    public const string SortNewest = "Terbaru";
    public const string SortOldest = "Terlama";

    private const int PageSize = 24;
    private const int TypingDelayMilliseconds = 350;

    private readonly AppServices _services;
    private readonly INavigationService _navigation;
    private CancellationTokenSource? _loadCts;
    private PostFilter _loadedFilter = new();
    private long _loadedVersion = -1;
    private bool _suppressReload;

    private string _keyword = string.Empty;
    private string _location = string.Empty;
    private string _selectedCategory = AllCategories;
    private string _selectedSort = SortNewest;
    private DateTime? _dateFrom;
    private DateTime? _dateTo;
    private bool _isLoading;
    private bool _isLoadingMore;
    private bool _hasMore;
    private int _totalCount;

    protected DashboardViewModelBase(AppServices services, INavigationService navigation, PostKind kind)
    {
        _services = services;
        _navigation = navigation;
        Kind = kind;

        CategoryOptions = [AllCategories, .. Categories.All];
        RefreshCommand = new RelayCommand(() => _ = ReloadAsync(0));
        ResetFiltersCommand = new RelayCommand(ResetFilters, () => HasActiveFilter);
        LoadMoreCommand = new AsyncRelayCommand(LoadMoreAsync, () => HasMore && !IsLoading && !IsLoadingMore);
        CreateCommand = new RelayCommand(() => _navigation.OpenCreateForm(Kind));
    }

    public PostKind Kind { get; }

    public abstract string Title { get; }
    public abstract string Description { get; }
    public abstract string SearchPlaceholder { get; }
    public abstract string DateFromLabel { get; }
    public abstract string CreateButtonText { get; }
    public abstract string EmptyTitle { get; }

    public IReadOnlyList<string> CategoryOptions { get; }
    public IReadOnlyList<string> SortOptions { get; } = [SortNewest, SortOldest];
    public DateTime Today => DateTime.Today;

    public ObservableCollection<PostCardViewModel> Items { get; } = [];

    public ICommand RefreshCommand { get; }
    public ICommand ResetFiltersCommand { get; }
    public ICommand LoadMoreCommand { get; }
    public ICommand CreateCommand { get; }

    public string Keyword
    {
        get => _keyword;
        set { if (SetProperty(ref _keyword, value ?? string.Empty)) FilterChanged(TypingDelayMilliseconds); }
    }

    public string Location
    {
        get => _location;
        set { if (SetProperty(ref _location, value ?? string.Empty)) FilterChanged(TypingDelayMilliseconds); }
    }

    public string SelectedCategory
    {
        get => _selectedCategory;
        set { if (SetProperty(ref _selectedCategory, value ?? AllCategories)) FilterChanged(0); }
    }

    public string SelectedSort
    {
        get => _selectedSort;
        set { if (SetProperty(ref _selectedSort, value ?? SortNewest)) FilterChanged(0); }
    }

    public DateTime? DateFrom
    {
        get => _dateFrom;
        set { if (SetProperty(ref _dateFrom, value?.Date)) FilterChanged(0); }
    }

    public DateTime? DateTo
    {
        get => _dateTo;
        set { if (SetProperty(ref _dateTo, value?.Date)) FilterChanged(0); }
    }

    public bool IsLoading
    {
        get => _isLoading;
        private set
        {
            if (SetProperty(ref _isLoading, value)) OnPropertyChanged(nameof(IsEmpty));
        }
    }

    public bool IsLoadingMore
    {
        get => _isLoadingMore;
        private set => SetProperty(ref _isLoadingMore, value);
    }

    public bool HasMore
    {
        get => _hasMore;
        private set => SetProperty(ref _hasMore, value);
    }

    public int TotalCount
    {
        get => _totalCount;
        private set
        {
            if (SetProperty(ref _totalCount, value)) OnPropertyChanged(nameof(ResultText));
        }
    }

    public string ResultText => TotalCount == 0
        ? "Tidak ada posting"
        : $"{TotalCount} posting aktif" + (Items.Count < TotalCount ? $" · menampilkan {Items.Count}" : string.Empty);

    public bool IsEmpty => !IsLoading && Items.Count == 0;

    public string EmptyText => HasActiveFilter
        ? "Tidak ada posting yang cocok dengan pencarian atau filter."
        : EmptyTitle;

    public bool HasActiveFilter =>
        !string.IsNullOrWhiteSpace(Keyword) || !string.IsNullOrWhiteSpace(Location)
        || SelectedCategory != AllCategories || DateFrom is not null || DateTo is not null;

    public override Task OnNavigatedToAsync() =>
        _loadedVersion == _services.Posts.Version ? Task.CompletedTask : ReloadAsync(0);

    private void FilterChanged(int delayMilliseconds)
    {
        OnPropertyChanged(nameof(HasActiveFilter));
        if (!_suppressReload)
            _ = ReloadAsync(delayMilliseconds);
    }

    private void ResetFilters()
    {
        _suppressReload = true;
        try
        {
            Keyword = string.Empty;
            Location = string.Empty;
            SelectedCategory = AllCategories;
            SelectedSort = SortNewest;
            DateFrom = null;
            DateTo = null;
        }
        finally
        {
            _suppressReload = false;
        }
        _ = ReloadAsync(0);
    }

    private PostFilter BuildFilter() => new()
    {
        Keyword = Keyword,
        Location = Location,
        Category = SelectedCategory == AllCategories ? null : SelectedCategory,
        DateFrom = DateFrom is null ? null : DateOnly.FromDateTime(DateFrom.Value),
        DateTo = DateTo is null ? null : DateOnly.FromDateTime(DateTo.Value),
        NewestFirst = SelectedSort != SortOldest
    };

    /// <summary>Memuat ulang halaman pertama. Pemuatan sebelumnya yang belum selesai dibatalkan.</summary>
    private async Task ReloadAsync(int delayMilliseconds)
    {
        _loadCts?.Cancel();
        var cts = new CancellationTokenSource();
        _loadCts = cts;
        CancellationToken ct = cts.Token;

        try
        {
            if (delayMilliseconds > 0)
                await Task.Delay(delayMilliseconds, ct);

            IsLoading = true;
            PostFilter filter = BuildFilter();
            long version = _services.Posts.Version;

            Task<PostPage> pageTask = _services.Posts.SearchActiveAsync(Kind, filter, null, PageSize, ct);
            Task<int> countTask = _services.Posts.CountActiveAsync(Kind, filter, ct);
            await Task.WhenAll(pageTask, countTask);
            ct.ThrowIfCancellationRequested();

            Items.Clear();
            AddCards(pageTask.Result.Items);
            HasMore = pageTask.Result.HasMore;
            TotalCount = countTask.Result;
            _loadedFilter = filter;
            _loadedVersion = version;
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            // Digantikan oleh pemuatan yang lebih baru.
        }
        catch (Exception ex)
        {
            if (_loadCts == cts)
                _services.Snackbar.ShowError("Gagal memuat posting: " + ex.Message);
        }
        finally
        {
            if (_loadCts == cts)
            {
                IsLoading = false;
                RaiseListChanged();
            }
        }
    }

    private async Task LoadMoreAsync()
    {
        if (Items.Count == 0 || _loadCts is null) return;

        CancellationTokenSource cts = _loadCts;
        CancellationToken ct = cts.Token;
        Post last = Items[^1].Post;

        IsLoadingMore = true;
        try
        {
            PostPage page = await _services.Posts.SearchActiveAsync(Kind, _loadedFilter, new PostCursor(last.Date, last.Id), PageSize, ct);
            ct.ThrowIfCancellationRequested();

            var existing = Items.Select(i => i.Post.Id).ToHashSet();
            AddCards(page.Items.Where(p => !existing.Contains(p.Id)));
            HasMore = page.HasMore;
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
        }
        catch (Exception ex)
        {
            _services.Snackbar.ShowError("Gagal memuat posting berikutnya: " + ex.Message);
        }
        finally
        {
            IsLoadingMore = false;
            RaiseListChanged();
        }
    }

    private void AddCards(IEnumerable<Post> posts)
    {
        foreach (Post post in posts)
        {
            var card = new PostCardViewModel(_services, post, c => _navigation.OpenDetail(c.Post.Kind, c.Post.Id));
            Items.Add(card);
            _ = card.LoadThumbnailAsync();
        }
    }

    private void RaiseListChanged()
    {
        OnPropertyChanged(nameof(IsEmpty));
        OnPropertyChanged(nameof(EmptyText));
        OnPropertyChanged(nameof(ResultText));
        CommandManager.InvalidateRequerySuggested();
    }
}

public sealed class FoundDashboardViewModel(AppServices services, INavigationService navigation)
    : DashboardViewModelBase(services, navigation, PostKind.Found)
{
    public override string Title => "Barang Temuan";
    public override string Description => "Barang yang ditemukan di lingkungan departemen dan belum dikembalikan.";
    public override string SearchPlaceholder => "Cari nama barang, deskripsi, atau lokasi";
    public override string DateFromLabel => "Tanggal ditemukan";
    public override string CreateButtonText => "Posting Barang Temuan";
    public override string EmptyTitle => "Belum ada barang temuan yang aktif.";
}

public sealed class LostDashboardViewModel(AppServices services, INavigationService navigation)
    : DashboardViewModelBase(services, navigation, PostKind.Lost)
{
    public override string Title => "Laporan Kehilangan";
    public override string Description => "Barang yang dilaporkan hilang dan belum ditemukan.";
    public override string SearchPlaceholder => "Cari nama barang atau deskripsi";
    public override string DateFromLabel => "Tanggal kehilangan";
    public override string CreateButtonText => "Laporkan Kehilangan";
    public override string EmptyTitle => "Belum ada laporan kehilangan yang aktif.";
}
