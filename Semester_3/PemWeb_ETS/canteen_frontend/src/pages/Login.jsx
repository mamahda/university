import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Container,
  Link,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import { CheckCircle } from "lucide-react";
import { InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#30468b",
    },
    background: {
      default: "#dbe2edff",
      paper: "#ffffffff",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
});

export default function LoginPage() {
  const { user, setUser } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Di dalam component LoginPage
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      console.log("tes");
      setUser(JSON.parse(storedUser));
      // console.log(user)
      // if (user.role === "admin") {
      //   navigate("/dashboardmenu")
      // }
    } else {
      console.log("oioioi");
    }
  }, []);

  // useEffect(() => {
  //   if (user) {
  //     if (user.role === "admin") {
  //       // console.log("ye admin")
  //       navigate("/dashboardmenu")
  //     }
  //     // console.log(user.role)
  //   }
  // }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", {
        email,
        password,
      });

      const token = response.data.data.token;
      const user = response.data.data.user;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      setLoading(false);
      setSuccess(true);

      if (response.data.data.user.role === "admin") {
        navigate("/dashboard/menu");
      } else {
        navigate("/");
      }
    } catch (err) {
      let message = "Tidak dapat terhubung ke server.";
      if (err.response) {
        message =
          err.response.data.message || "Login gagal. Periksa email/password.";
      }
      setLoading(false);
      setError(message);
    }
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              bgcolor: "background.paper",
              borderRadius: 2,
            }}
          >
            {/* Logo */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "primary.main",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography sx={{ color: "black", fontWeight: "bold" }}>
                    🍴
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{ color: "black", fontWeight: 600 }}
                >
                  Welcome to CanteenTC
                </Typography>
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 600, color: "black" }}>
                Sign in
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {/* 🔹 Alert Error */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, color: "black" }}>
                  Email
                </Typography>
                <TextField
                  fullWidth
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                      "& fieldset": {
                        borderColor: "black",
                      },
                      "&:hover fieldset": {
                        borderColor: "black",
                      },
                    },
                    "& input::placeholder": {
                      color: "gray",
                      opacity: 1,
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, color: "black" }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                      "& fieldset": {
                        borderColor: "black",
                      },
                      "&:hover fieldset": {
                        borderColor: "black",
                      },
                    },
                    "& input::placeholder": {
                      color: "gray",
                      opacity: 1,
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          onMouseDown={(e) => e.preventDefault()} // supaya klik tidak hilangkan focus
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: "black" }}>
                    Remember me
                  </Typography>
                }
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{
                  py: 1.5,
                  mb: 2,
                  bgcolor: "#30468b",
                  color: "white",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "grey.800",
                  },
                }}
              >
                Sign in
              </Button>

              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Link
                  href="#"
                  underline="hover"
                  sx={{
                    color: "grey.600",
                    fontSize: "0.875rem",
                    "&:hover": {
                      color: "black",
                    },
                  }}
                >
                  Forgot your password?
                </Link>
              </Box>

              <Box
                sx={{
                  textAlign: "center",
                  mt: 3,
                  pt: 3,
                  borderTop: 1,
                  borderColor: "grey.800",
                }}
              >
                <Typography variant="body2" sx={{ color: "black" }}>
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    underline="hover"
                    sx={{
                      color: "black",
                      fontWeight: 500,
                    }}
                  >
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>

        {/* INI BUAT LOADING */}
        <Dialog
          open={loading}
          PaperProps={{
            sx: {
              bgcolor: "white",
              borderRadius: 2,
              p: 3,
              minWidth: 300,
            },
          }}
        >
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <CircularProgress size={50} sx={{ color: "black" }} />
              <Typography
                variant="body1"
                sx={{ color: "black", fontWeight: 500 }}
              >
                Signing in...
              </Typography>
            </Box>
          </DialogContent>
        </Dialog>

        <Dialog
          open={success}
          PaperProps={{
            sx: {
              bgcolor: "white",
              borderRadius: 2,
              p: 3,
              minWidth: 300,
            },
          }}
        >
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  bgcolor: "#4caf50",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle size={36} color="white" />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: "black",
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Login Successful!
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "grey.600", textAlign: "center" }}
              >
                Redirecting to dashboard...
              </Typography>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
