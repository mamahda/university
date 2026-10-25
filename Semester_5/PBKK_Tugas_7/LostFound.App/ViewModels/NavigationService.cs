using LostFound.App.Services;
using LostFound.Core.Models;

namespace LostFound.App.ViewModels;

public enum NavSection
{
    Found,
    Lost,
    MyPosts,
    Create
}

public interface INavigationService
{
    void OpenFoundDashboard();
    void OpenLostDashboard();
    void OpenMyPosts();
    void OpenCreateForm(PostKind kind);
    void OpenEditForm(PostKind kind, long id);

    /// <param name="replaceCurrent">True untuk mengganti halaman saat ini (mis. setelah posting baru disimpan).</param>
    void OpenDetail(PostKind kind, long id, bool replaceCurrent = false);

    void GoBack();
}

/// <summary>
/// Navigasi berbasis ViewModel: halaman aktif adalah ViewModel, dan View dipilih lewat DataTemplate di App.xaml.
/// Dashboard dan Posting Saya dibuat sekali per sesi login agar filter dan tab tetap tersimpan.
/// </summary>
public sealed class NavigationService(AppServices services) : ObservableObject, INavigationService
{
    private readonly Stack<(PageViewModel Page, NavSection Section)> _history = new();
    private FoundDashboardViewModel? _found;
    private LostDashboardViewModel? _lost;
    private MyPostsViewModel? _myPosts;
    private PageViewModel? _currentPage;
    private NavSection _section;

    public PageViewModel? CurrentPage
    {
        get => _currentPage;
        private set => SetProperty(ref _currentPage, value);
    }

    public NavSection Section
    {
        get => _section;
        private set => SetProperty(ref _section, value);
    }

    public void OpenFoundDashboard() =>
        NavigateRoot(_found ??= new FoundDashboardViewModel(services, this), NavSection.Found);

    public void OpenLostDashboard() =>
        NavigateRoot(_lost ??= new LostDashboardViewModel(services, this), NavSection.Lost);

    public void OpenMyPosts() =>
        NavigateRoot(_myPosts ??= new MyPostsViewModel(services, this), NavSection.MyPosts);

    public void OpenCreateForm(PostKind kind) =>
        Push(new PostFormViewModel(services, this, kind, editId: null), NavSection.Create);

    public void OpenEditForm(PostKind kind, long id) =>
        Push(new PostFormViewModel(services, this, kind, id), Section);

    public void OpenDetail(PostKind kind, long id, bool replaceCurrent = false)
    {
        var detail = new PostDetailViewModel(services, this, kind, id);
        if (replaceCurrent)
        {
            Show(detail, SectionFor(kind));
        }
        else
        {
            Push(detail, Section);
        }
    }

    public void GoBack()
    {
        if (_history.Count == 0)
        {
            OpenFoundDashboard();
            return;
        }

        var (page, section) = _history.Pop();
        Show(page, section);
    }

    private void NavigateRoot(PageViewModel page, NavSection section)
    {
        _history.Clear();
        Show(page, section);
    }

    private void Push(PageViewModel page, NavSection section)
    {
        if (CurrentPage is not null)
            _history.Push((CurrentPage, Section));
        Show(page, section);
    }

    private void Show(PageViewModel page, NavSection section)
    {
        Section = section;
        CurrentPage = page;
        _ = NotifyNavigatedAsync(page);
    }

    private async Task NotifyNavigatedAsync(PageViewModel page)
    {
        try
        {
            await page.OnNavigatedToAsync();
        }
        catch (Exception ex)
        {
            services.Snackbar.ShowError("Gagal memuat halaman: " + ex.Message);
        }
    }

    private static NavSection SectionFor(PostKind kind) => kind == PostKind.Found ? NavSection.Found : NavSection.Lost;
}
