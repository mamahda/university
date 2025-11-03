import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
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
import RestaurantIcon from "@mui/icons-material/Restaurant";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const darkTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0000",
      secondary: "#dbe2edff",
      gradient: "linear-gradient(45deg, #dde7f6ff , #bcd1f0ff)",
    },
    background: {
      default: "#dbe2edff",
      paper: "#dbe2edff",
      gradient: "linear-gradient(45deg, #dde7f6ff , #bcd1f0ff)",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
});

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/register", {
        name,
        email,
        password,
      });

      const token = response.data.token;
      setLoading(false);
      setSuccess(true);

      localStorage.setItem("token", token);
      navigate("/login");
    } catch (err) {
      setLoading(false);
      if (err.response) {
        setError(
          err.response.data.message || "Register. Periksa email/password."
        );
      } else {
        setError("Tidak dapat terhubung ke server.");
      }
    }

    console.log("Register:", { name, email, password });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "primary.secondary",
          // background:"linear-gradient(45deg, #000000ff, #02183bff)",
          boxShadow: 3,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              bgcolor: "white",
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
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      fontFamily: "serif",
                    }}
                  >
                    <RestaurantIcon
                      sx={{ fontSize: 30, mr: 1, color: "black" }}
                    />
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
                Sign up
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, color: "black" }}>
                  Name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  Email
                </Typography>
                <TextField
                  fullWidth
                  type="email"
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
                  type="password"
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
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, color: "black" }}>
                  Re-enter Password
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                Sign up
              </Button>

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
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    underline="hover"
                    sx={{
                      color: "black",
                      fontWeight: 500,
                    }}
                  >
                    Sign in
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
              <Typography variant="h6" sx={{ color: "black", fontWeight: 600 }}>
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
