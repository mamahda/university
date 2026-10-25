using System.Windows;
using LostFound.App.Views;
using Microsoft.Win32;

namespace LostFound.App.Services;

/// <summary>Dialog yang dibutuhkan ViewModel, tanpa ViewModel mengenal jendela secara langsung.</summary>
public interface IDialogService
{
    bool Confirm(string title, string message, string confirmText, bool isDestructive = false);

    /// <summary>Path berkas gambar yang dipilih, atau null jika dibatalkan.</summary>
    string? PickImageFile();
}

public sealed class DialogService : IDialogService
{
    public bool Confirm(string title, string message, string confirmText, bool isDestructive = false)
    {
        var dialog = new ConfirmDialog(title, message, confirmText, isDestructive);
        Window? owner = Application.Current?.MainWindow;
        if (owner is not null && owner.IsVisible)
            dialog.Owner = owner;
        else
            dialog.WindowStartupLocation = WindowStartupLocation.CenterScreen;
        return dialog.ShowDialog() == true;
    }

    public string? PickImageFile()
    {
        var dialog = new OpenFileDialog
        {
            Title = "Pilih foto barang",
            Filter = "Gambar JPG/PNG (*.jpg;*.jpeg;*.png)|*.jpg;*.jpeg;*.png",
            CheckFileExists = true,
            Multiselect = false
        };
        Window? owner = Application.Current?.MainWindow;
        bool? picked = owner is not null && owner.IsVisible ? dialog.ShowDialog(owner) : dialog.ShowDialog();
        return picked == true ? dialog.FileName : null;
    }
}
