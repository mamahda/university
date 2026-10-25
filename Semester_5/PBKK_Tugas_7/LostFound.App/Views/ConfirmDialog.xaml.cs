using System.Windows;

namespace LostFound.App.Views;

/// <summary>Dialog konfirmasi sederhana. Dibuka oleh DialogService, bukan oleh ViewModel.</summary>
public partial class ConfirmDialog : Window
{
    public ConfirmDialog(string title, string message, string confirmText, bool isDestructive)
    {
        InitializeComponent();
        Title = title;
        TitleText.Text = title;
        MessageText.Text = message;
        ConfirmButton.Content = confirmText;
        if (isDestructive)
            ConfirmButton.Style = (Style)FindResource("DangerButton");

        // Fokus awal di "Batal" agar Enter tidak langsung menjalankan aksi berbahaya.
        Loaded += (_, _) => CancelButton.Focus();
        MouseLeftButtonDown += (_, _) => DragMove();
    }

    private void OnConfirm(object sender, RoutedEventArgs e) => DialogResult = true;
}
