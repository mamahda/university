using System.Windows.Input;
using System.Windows.Media;
using LostFound.App.Services;
using LostFound.Core.Models;
using LostFound.Core.Services;
using LostFound.Core.Validation;

namespace LostFound.App.ViewModels;

/// <summary>Satu form untuk posting barang temuan dan kehilangan, dipakai untuk membuat maupun mengedit.</summary>
public sealed class PostFormViewModel : PageViewModel
{
    private const int PreviewSize = 800;

    private readonly AppServices _services;
    private readonly INavigationService _navigation;
    private readonly long? _editId;
    private bool _loaded;

    private PostKind _kind;
    private string _itemName = string.Empty;
    private string? _category;
    private string _location = string.Empty;
    private DateTime? _date = DateTime.Today;
    private string _description = string.Empty;
    private string _contact = string.Empty;
    private string? _existingPhoto;
    private string? _newPhotoFile;
    private bool _removePhoto;
    private ImageSource? _photoPreview;
    private bool _isBusy;
    private bool _isLoading;

    private string? _itemNameError;
    private string? _photoError;
    private string? _categoryError;
    private string? _locationError;
    private string? _dateError;
    private string? _descriptionError;
    private string? _contactError;

    public PostFormViewModel(AppServices services, INavigationService navigation, PostKind kind, long? editId)
    {
        _services = services;
        _navigation = navigation;
        _kind = kind;
        _editId = editId;

        PickPhotoCommand = new AsyncRelayCommand(PickPhotoAsync, () => !IsBusy);
        RemovePhotoCommand = new RelayCommand(RemovePhoto, () => !IsBusy && HasPhoto);
        SaveCommand = new AsyncRelayCommand(SaveAsync, () => !IsBusy && !IsLoading);
        CancelCommand = new RelayCommand(_navigation.GoBack, () => !IsBusy);
    }

    public bool IsEditMode => _editId is not null;
    public bool CanChangeKind => !IsEditMode;
    public string Title => IsEditMode ? "Edit Posting" : "Posting Baru";
    public string SaveText => IsEditMode ? "Simpan Perubahan" : "Posting";
    public IReadOnlyList<string> CategoryOptions => Categories.All;
    public DateTime Today => DateTime.Today;

    public ICommand PickPhotoCommand { get; }
    public ICommand RemovePhotoCommand { get; }
    public ICommand SaveCommand { get; }
    public ICommand CancelCommand { get; }

    public PostKind Kind
    {
        get => _kind;
        private set
        {
            if (!SetProperty(ref _kind, value)) return;
            OnPropertyChanged(nameof(IsFound));
            OnPropertyChanged(nameof(IsLost));
            OnPropertyChanged(nameof(LocationLabel));
            OnPropertyChanged(nameof(DateLabel));
            OnPropertyChanged(nameof(DescriptionLabel));
            OnPropertyChanged(nameof(PhotoLabel));
            OnPropertyChanged(nameof(DescriptionMaxLength));
            OnPropertyChanged(nameof(DescriptionCounter));
            OnPropertyChanged(nameof(CanRemovePhoto));
            ClearErrors();
        }
    }

    /// <summary>Diikat ke tombol pilihan jenis posting.</summary>
    public bool IsFound
    {
        get => Kind == PostKind.Found;
        set { if (value && CanChangeKind) Kind = PostKind.Found; }
    }

    public bool IsLost
    {
        get => Kind == PostKind.Lost;
        set { if (value && CanChangeKind) Kind = PostKind.Lost; }
    }

    public string LocationLabel => Kind == PostKind.Found ? "Lokasi ditemukan" : "Lokasi kehilangan (opsional)";
    public string DateLabel => Kind == PostKind.Found ? "Tanggal ditemukan" : "Tanggal kehilangan";
    public string DescriptionLabel => Kind == PostKind.Found ? "Deskripsi singkat" : "Deskripsi kehilangan";
    public string PhotoLabel => Kind == PostKind.Found ? "Foto barang" : "Foto barang (opsional)";
    public int DescriptionMaxLength => PostValidator.GetDescriptionMaxLength(Kind);
    public string DescriptionCounter => $"{Description.Length}/{DescriptionMaxLength}";

    public string ItemName
    {
        get => _itemName;
        set { if (SetProperty(ref _itemName, value ?? string.Empty)) ItemNameError = null; }
    }

    public string? Category
    {
        get => _category;
        set { if (SetProperty(ref _category, value)) CategoryError = null; }
    }

    public string Location
    {
        get => _location;
        set { if (SetProperty(ref _location, value ?? string.Empty)) LocationError = null; }
    }

    public DateTime? Date
    {
        get => _date;
        set { if (SetProperty(ref _date, value?.Date)) DateError = null; }
    }

    public string Description
    {
        get => _description;
        set
        {
            if (!SetProperty(ref _description, value ?? string.Empty)) return;
            DescriptionError = null;
            OnPropertyChanged(nameof(DescriptionCounter));
        }
    }

    public string Contact
    {
        get => _contact;
        set { if (SetProperty(ref _contact, value ?? string.Empty)) ContactError = null; }
    }

    public ImageSource? PhotoPreview
    {
        get => _photoPreview;
        private set => SetProperty(ref _photoPreview, value);
    }

    public bool HasPhoto => _newPhotoFile is not null || (_existingPhoto is not null && !_removePhoto);

    /// <summary>Foto hanya bisa dihapus tanpa pengganti untuk laporan kehilangan (foto temuan wajib).</summary>
    public bool CanRemovePhoto => HasPhoto && Kind == PostKind.Lost;

    public string PhotoButtonText => HasPhoto ? "Ganti foto" : "Pilih foto";

    public bool IsBusy
    {
        get => _isBusy;
        private set
        {
            if (SetProperty(ref _isBusy, value)) CommandManager.InvalidateRequerySuggested();
        }
    }

    public bool IsLoading
    {
        get => _isLoading;
        private set
        {
            if (SetProperty(ref _isLoading, value)) CommandManager.InvalidateRequerySuggested();
        }
    }

    public string? ItemNameError { get => _itemNameError; private set => SetProperty(ref _itemNameError, value); }
    public string? PhotoError { get => _photoError; private set => SetProperty(ref _photoError, value); }
    public string? CategoryError { get => _categoryError; private set => SetProperty(ref _categoryError, value); }
    public string? LocationError { get => _locationError; private set => SetProperty(ref _locationError, value); }
    public string? DateError { get => _dateError; private set => SetProperty(ref _dateError, value); }
    public string? DescriptionError { get => _descriptionError; private set => SetProperty(ref _descriptionError, value); }
    public string? ContactError { get => _contactError; private set => SetProperty(ref _contactError, value); }

    public override async Task OnNavigatedToAsync()
    {
        if (_loaded || _editId is null) return;

        IsLoading = true;
        try
        {
            Post? post = await _services.Posts.GetDetailAsync(Kind, _editId.Value);
            if (post is null || !_services.Posts.IsOwner(post) || post.IsResolved)
            {
                _services.Snackbar.ShowError(post is null
                    ? "Posting tidak ditemukan. Mungkin sudah dihapus."
                    : "Posting ini tidak dapat diedit.");
                _navigation.GoBack();
                return;
            }

            _loaded = true;
            ItemName = post.ItemName;
            Category = post.Category;
            Location = post.Location ?? string.Empty;
            Date = post.Date.ToDateTime(TimeOnly.MinValue);
            Description = post.Description;
            Contact = post.Contact;
            _existingPhoto = post.PhotoPath;
            RaisePhotoChanged();
            ClearErrors();

            if (_existingPhoto is not null)
            {
                PhotoPreview = await _services.Images.LoadAsync(
                    _services.Photos.GetPhotoPath(_existingPhoto), null, PreviewSize);
            }
        }
        catch (Exception ex)
        {
            _services.Snackbar.ShowError("Gagal memuat posting: " + ex.Message);
            _navigation.GoBack();
        }
        finally
        {
            IsLoading = false;
        }
    }

    private async Task PickPhotoAsync()
    {
        string? file = _services.Dialogs.PickImageFile();
        if (file is null) return;

        string? error = PhotoService.ValidateSourceFile(file);
        if (error is not null)
        {
            PhotoError = error;
            return;
        }

        ImageSource? preview = await _services.Images.LoadAsync(file, null, PreviewSize);
        if (preview is null)
        {
            PhotoError = "Berkas tidak dapat dibaca sebagai gambar JPG/PNG.";
            return;
        }

        _newPhotoFile = file;
        PhotoPreview = preview;
        PhotoError = null;
        RaisePhotoChanged();
    }

    private void RemovePhoto()
    {
        _newPhotoFile = null;
        _removePhoto = _existingPhoto is not null;
        PhotoPreview = null;
        RaisePhotoChanged();
    }

    private async Task SaveAsync()
    {
        ClearErrors();
        var input = new PostInput
        {
            Kind = Kind,
            ItemName = ItemName,
            Category = Category,
            Location = Location,
            Date = Date is null ? null : DateOnly.FromDateTime(Date.Value),
            Description = Description,
            Contact = Contact,
            NewPhotoFile = _newPhotoFile,
            RemovePhoto = _removePhoto
        };

        IsBusy = true;
        try
        {
            if (_editId is null)
            {
                ServiceResult<long> result = await _services.Posts.CreateAsync(input);
                if (!HandleFailure(result)) return;

                _services.Snackbar.Show("Posting berhasil dibuat.");
                _navigation.OpenDetail(Kind, result.Value, replaceCurrent: true);
            }
            else
            {
                ServiceResult result = await _services.Posts.UpdateAsync(Kind, _editId.Value, input);
                if (!HandleFailure(result)) return;

                _services.Snackbar.Show("Perubahan berhasil disimpan.");
                _navigation.GoBack();
            }
        }
        catch (Exception ex)
        {
            _services.Snackbar.ShowError("Posting gagal disimpan: " + ex.Message);
        }
        finally
        {
            IsBusy = false;
        }
    }

    /// <returns>True jika berhasil.</returns>
    private bool HandleFailure(ServiceResult result)
    {
        if (result.Succeeded) return true;

        foreach (var (field, message) in result.FieldErrors)
        {
            switch (field)
            {
                case PostFields.ItemName: ItemNameError = message; break;
                case PostFields.Photo: PhotoError = message; break;
                case PostFields.Category: CategoryError = message; break;
                case PostFields.Location: LocationError = message; break;
                case PostFields.Date: DateError = message; break;
                case PostFields.Description: DescriptionError = message; break;
                case PostFields.Contact: ContactError = message; break;
            }
        }

        _services.Snackbar.ShowError(result.Error ?? "Periksa kembali isian yang ditandai.");
        return false;
    }

    private void ClearErrors()
    {
        ItemNameError = null;
        PhotoError = null;
        CategoryError = null;
        LocationError = null;
        DateError = null;
        DescriptionError = null;
        ContactError = null;
    }

    private void RaisePhotoChanged()
    {
        OnPropertyChanged(nameof(HasPhoto));
        OnPropertyChanged(nameof(CanRemovePhoto));
        OnPropertyChanged(nameof(PhotoButtonText));
        CommandManager.InvalidateRequerySuggested();
    }
}
