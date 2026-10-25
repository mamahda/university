using System.Windows.Input;
using System.Windows.Media;
using LostFound.App.Services;
using LostFound.Core.Models;

namespace LostFound.App.ViewModels;

/// <summary>Satu kartu posting di dashboard atau baris di Posting Saya.</summary>
public sealed class PostCardViewModel : ObservableObject
{
    private const int ThumbnailSize = 480;

    private readonly AppServices _services;
    private ImageSource? _thumbnail;

    public PostCardViewModel(AppServices services, Post post, Action<PostCardViewModel> open)
    {
        _services = services;
        Post = post;
        OpenCommand = new RelayCommand(() => open(this));
    }

    public Post Post { get; }
    public string ItemName => Post.ItemName;
    public string Category => Post.Category;
    public string LocationText => Formatting.LocationOrDefault(Post);
    public string DateText => Formatting.ShortDate(Post.Date);
    public string StatusLabel => Post.StatusLabel;
    public bool IsResolved => Post.IsResolved;
    public bool HasPhoto => Post.PhotoPath is not null;

    public ImageSource? Thumbnail
    {
        get => _thumbnail;
        private set => SetProperty(ref _thumbnail, value);
    }

    public ICommand OpenCommand { get; }

    /// <summary>Tombol aksi status di Posting Saya (null di dashboard).</summary>
    public string? StatusActionText { get; init; }

    public ICommand? StatusActionCommand { get; init; }

    public async Task LoadThumbnailAsync()
    {
        if (!HasPhoto) return;
        Thumbnail = await _services.Images.LoadAsync(
            _services.Photos.GetThumbnailPath(Post.PhotoPath),
            _services.Photos.GetPhotoPath(Post.PhotoPath),
            ThumbnailSize);
    }
}
