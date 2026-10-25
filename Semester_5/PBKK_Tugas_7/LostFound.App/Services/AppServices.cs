using LostFound.Core.Abstractions;
using LostFound.Core.Services;

namespace LostFound.App.Services;

/// <summary>Kumpulan service yang dibuat sekali di App.OnStartup (composition root).</summary>
public sealed record AppServices(
    AuthService Auth,
    PostService Posts,
    PhotoService Photos,
    IUserSession Session,
    IDialogService Dialogs,
    ISnackbarService Snackbar,
    IImageLoader Images);
