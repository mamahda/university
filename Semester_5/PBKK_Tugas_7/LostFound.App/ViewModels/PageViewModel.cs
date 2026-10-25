namespace LostFound.App.ViewModels;

/// <summary>Halaman yang ditampilkan di area konten shell.</summary>
public abstract class PageViewModel : ObservableObject
{
    /// <summary>Dipanggil setiap kali halaman ditampilkan (termasuk saat kembali dari halaman lain).</summary>
    public virtual Task OnNavigatedToAsync() => Task.CompletedTask;
}
