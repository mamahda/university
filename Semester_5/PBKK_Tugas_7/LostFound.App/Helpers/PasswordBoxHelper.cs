using System.Windows;
using System.Windows.Controls;

namespace LostFound.App.Helpers;

/// <summary>
/// Membuat PasswordBox.Password bisa di-binding ke ViewModel (properti aslinya bukan dependency property).
/// Kode khusus tampilan, sehingga ViewModel tidak perlu mengenal PasswordBox.
/// </summary>
public static class PasswordBoxHelper
{
    public static readonly DependencyProperty BoundPasswordProperty = DependencyProperty.RegisterAttached(
        "BoundPassword",
        typeof(string),
        typeof(PasswordBoxHelper),
        // Default null (bukan ""), agar callback terpanggil saat binding pertama kali memberi nilai "".
        new FrameworkPropertyMetadata(null, FrameworkPropertyMetadataOptions.BindsTwoWayByDefault, OnBoundPasswordChanged));

    private static readonly DependencyProperty IsUpdatingProperty =
        DependencyProperty.RegisterAttached("IsUpdating", typeof(bool), typeof(PasswordBoxHelper));

    private static readonly DependencyProperty IsAttachedProperty =
        DependencyProperty.RegisterAttached("IsAttached", typeof(bool), typeof(PasswordBoxHelper));

    public static string? GetBoundPassword(DependencyObject d) => (string?)d.GetValue(BoundPasswordProperty);

    public static void SetBoundPassword(DependencyObject d, string? value) => d.SetValue(BoundPasswordProperty, value);

    private static void OnBoundPasswordChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        if (d is not PasswordBox box) return;

        if (!(bool)box.GetValue(IsAttachedProperty))
        {
            box.SetValue(IsAttachedProperty, true);
            box.PasswordChanged += OnPasswordChanged;
        }

        if ((bool)box.GetValue(IsUpdatingProperty)) return;

        string newPassword = e.NewValue as string ?? string.Empty;
        if (box.Password != newPassword)
            box.Password = newPassword;
    }

    private static void OnPasswordChanged(object sender, RoutedEventArgs e)
    {
        var box = (PasswordBox)sender;
        box.SetValue(IsUpdatingProperty, true);
        try
        {
            SetBoundPassword(box, box.Password);
        }
        finally
        {
            box.SetValue(IsUpdatingProperty, false);
        }
    }
}
