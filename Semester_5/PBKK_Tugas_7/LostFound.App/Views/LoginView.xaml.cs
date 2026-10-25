using System.Windows;
using System.Windows.Controls;

namespace LostFound.App.Views;

public partial class LoginView : UserControl
{
    public LoginView()
    {
        InitializeComponent();
        Loaded += (_, _) => IdentityBox.Focus();
    }
}
