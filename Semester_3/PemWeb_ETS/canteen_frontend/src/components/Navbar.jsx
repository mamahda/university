// src/components/Navbar.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Avatar,
  Button,
  Card,
  CardContent,
  Divider,
  Fade,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import CartPopup from "./Cart";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import logo from "../assets/logoTCanteen.png";

export default function Navbar({
  searchQuery,
  setSearchQuery,
  cartCount,
  openCart,
  setOpenCart,
  handleAuthNav,
  onSearch,
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:480px)");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    } else {
      setUser({ name: "Guest", email: "Not logged in" });
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser({ name: "Guest", email: "Not logged in" });
    setIsLoggedIn(false);
    setShowProfileCard(false);
    setMobileMenuOpen(false);
    location.reload();
  };

  const toggleProfileCard = () => {
    setShowProfileCard((prev) => !prev);
  };

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  // Mobile Menu Content
  const MobileMenu = () => (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        p: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box
          component="img"
          src={logo}
          alt="TCanteen Logo"
          sx={{ height: 25 }}
        />
        <IconButton onClick={() => setMobileMenuOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Search in Mobile Menu */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search menu..."
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "#f5f5f5",
              borderRadius: "12px",
              "& fieldset": { borderColor: "transparent" },
              "&:hover fieldset": { borderColor: "#ccc" },
              "&.Mui-focused fieldset": { borderColor: "primary.main" },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "grey.600" }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          fullWidth
          onClick={handleSearchClick}
          sx={{
            mt: 1,
            borderRadius: "12px",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          }}
        >
          Search
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* User Profile Section */}
      {isLoggedIn ? (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography fontWeight="bold">{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              navigate("/order");
              setMobileMenuOpen(false);
            }}
            sx={{
              mb: 1,
              borderRadius: "10px",
              textTransform: "none",
            }}
          >
            View Order
          </Button>

          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Logout
          </Button>
        </Box>
      ) : (
        <Box>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              mb: 1.5,
              borderRadius: "10px",
              "&:hover": {
                borderColor: "#30468b",
                color: "#30468b",
              },
            }}
            onClick={() => {
              handleAuthNav("login");
              setMobileMenuOpen(false);
            }}
          >
            Login
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{ borderRadius: "10px" }}
            onClick={() => {
              handleAuthNav("register");
              setMobileMenuOpen(false);
            }}
          >
            Register
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          backgroundColor: "#ffffff",
          color: "black",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <Toolbar sx={{ py: 1, minHeight: { xs: 56, sm: 64 } }}>
          <Box
            component="img"
            src={logo}
            alt="TCanteen Logo"
            sx={{
              height: { xs: 20, sm: 25 },
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          />

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop View */}
          {!isMobile ? (
            <>
              {/* SEARCH */}
              <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
                <TextField
                  placeholder="Search menu..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  sx={{
                    width: 300,
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#f5f5f5",
                      borderRadius: "12px 0 0 12px",
                      "& fieldset": { borderColor: "transparent" },
                      "&:hover fieldset": { borderColor: "#ccc" },
                      "&.Mui-focused fieldset": { borderColor: "primary.main" },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "grey.600" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearchClick}
                  sx={{
                    height: "40px",
                    minWidth: "60px",
                    borderRadius: "0 12px 12px 0",
                    boxShadow: "none",
                    "&:hover": {
                      boxShadow: "none",
                    },
                  }}
                >
                  Search
                </Button>
              </Box>

              {/* CART */}
              <IconButton onClick={() => setOpenCart(true)} sx={{ mr: 2 }}>
                <Badge badgeContent={cartCount} color="primary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              {/* Auth Section */}
              {!isLoggedIn ? (
                <>
                  <Button
                    variant="outlined"
                    sx={{
                      mr: 1.5,
                      borderRadius: "10px",
                      "&:hover": {
                        borderColor: "#30468b",
                        color: "#30468b",
                      },
                    }}
                    onClick={() => handleAuthNav("login")}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ borderRadius: "10px" }}
                    onClick={() => handleAuthNav("register")}
                  >
                    Register
                  </Button>
                </>
              ) : (
                <Box sx={{ position: "relative" }}>
                  <IconButton onClick={toggleProfileCard}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <PersonIcon />
                    </Avatar>
                  </IconButton>

                  {/* Profile Card */}
                  <Fade in={showProfileCard}>
                    <Card
                      sx={{
                        position: "absolute",
                        top: "50px",
                        right: 0,
                        width: 250,
                        borderRadius: "16px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                        overflow: "hidden",
                        zIndex: 1000,
                      }}
                    >
                      <CardContent sx={{ textAlign: "center", p: 2.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            width: 56,
                            height: 56,
                            mx: "auto",
                            mb: 1.5,
                          }}
                        >
                          <PersonIcon fontSize="large" />
                        </Avatar>
                        <Typography fontWeight="bold">{user.name}</Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          {user.email}
                        </Typography>

                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigate("/order")}
                          sx={{
                            mb: 1,
                            borderRadius: "10px",
                            textTransform: "none",
                          }}
                        >
                          View Order
                        </Button>

                        <Divider sx={{ my: 1 }} />

                        <Button
                          fullWidth
                          variant="contained"
                          color="error"
                          startIcon={<LogoutIcon />}
                          onClick={handleLogout}
                          sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: "bold",
                          }}
                        >
                          Logout
                        </Button>
                      </CardContent>
                    </Card>
                  </Fade>
                </Box>
              )}
            </>
          ) : (
            /* Mobile View */
            <>
              <IconButton onClick={() => setOpenCart(true)} sx={{ mr: 1 }}>
                <Badge badgeContent={cartCount} color="primary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              <IconButton onClick={() => setMobileMenuOpen(true)}>
                <MenuIcon />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Cart Popup */}
      <CartPopup open={openCart} onClose={() => setOpenCart(false)} />

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "100%",
          },
        }}
      >
        <MobileMenu />
      </Drawer>
    </>
  );
}