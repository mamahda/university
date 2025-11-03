import React, { useState, useEffect } from "react";
import {
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import InfiniteCarousel from "../components/Promo";
import MenuCard from "../components/MenuCard";
import CustomerReviews from "../components/Rating";
import heroBg1 from "../assets/bgMenu1.svg";
import heroBg2 from "../assets/bgMenu2.svg";
import heroBg3 from "../assets/bgMenu3.svg";
import heroBg4 from "../assets/bgMenu4.svg";
import { IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import api from "../../services/api"

const theme = createTheme({
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
  palette: {
    mode: "light",
    primary: {
      main: "#30468b",
      light: "#041f6aff",
      dark: "#040c66ff",
    },
    background: {
      default: "#ecf0f7ff",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
});

export default function CanteenHomepage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [openChart, setOpenChart] = useState(false);
  const [bgIndex, setBgIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [prevStatuses, setPrevStatuses] = useState({});
  const [notif, setNotif] = useState({
    open: false,
    message: "",
  });
  const [orders, setOrders] = useState([])

  const [searchTrigger, setSearchTrigger] = useState(0);

  const backgrounds = [heroBg1, heroBg2, heroBg3, heroBg4];
  const loopedBackgrounds = [
    backgrounds[backgrounds.length - 1],
    ...backgrounds,
    backgrounds[0],
  ];

  const token = localStorage.getItem("token")

  const fetchOrders = async () => {
    if (!token) {
      // alert("token gaada");
      return;
    }
    try {
      const res = await api.get("/orders", {
        headers: {
          Authorization: `bearer ${token}`,
        },
      });

      if (Array.isArray(res.data.data)) {
        const newOrders = res.data.data;

        // Deteksi perubahan status
        newOrders.forEach((order) => {
          const oldStatus = prevStatuses[order.id];
          if (oldStatus && oldStatus !== order.status) {
            setNotif({
              open: true,
              message: `Order Status for ORD-${order.id} change to: ${order.status}`,
            });
          }
        });

        // Update state orders & prevStatuses
        setOrders(newOrders);

        const updatedStatusMap = {};
        newOrders.forEach((o) => (updatedStatusMap[o.id] = o.status));
        setPrevStatuses(updatedStatusMap);
      }
    } catch (err) {
      console.error("Gagal fetch orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [prevStatuses]);

  const nextSlide = () => {
    setBgIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    setBgIndex((prev) => prev - 1);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("user sekarang" + user);
    if (user && user.name === "admin") {
      navigate("/dashboard/menu");
    }
  });

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setBgIndex((prev) => prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered]);

  useEffect(() => {
    if (bgIndex === loopedBackgrounds.length - 1) {
      setTimeout(() => {
        setIsTransitioning(false);
        setBgIndex(1);
      }, 2000);
    } else if (bgIndex === 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setBgIndex(loopedBackgrounds.length - 2);
      }, 2000);
    } else {
      setIsTransitioning(true);
    }
  }, [bgIndex]);

  const handleAuthNav = (type) => {
    if (type === "login") {
      navigate("/login");
    } else if (type === "register") {
      navigate("/register");
    }
  };

  const handleSearch = () => {
    setSearchTrigger((prev) => prev + 1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          backgroundColor: "background.default",
          width: "100%",
          overflowX: "hidden",
          alignItems: "center",
        }}
      >
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cartCount={cartCount}
          openCart={openChart}
          setOpenCart={setOpenChart}
          handleAuthNav={handleAuthNav}
          onSearch={handleSearch}
        />

        {/* Hero Section */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            overflow: "hidden",
            mt: 8,
            height: "280px",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Box
            sx={{
              display: "flex",
              width: "max-content",
              transform: `translateX(-${bgIndex * 100}vw)`,
              transition: isTransitioning ? "transform 2s ease-in-out" : "none",
            }}
          >
            {loopedBackgrounds.map((bg, index) => (
              <Box
                key={index}
                sx={{
                  width: "100vw",
                  height: "280px",
                  backgroundImage: `url(${bg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  flexShrink: 0,
                }}
              />
            ))}
          </Box>

          <IconButton
            onClick={prevSlide}
            sx={{
              position: "absolute",
              top: "50%",
              left: 10,
              transform: "translateY(-50%)",
              backgroundColor: "rgba(0,0,0,0.2)",
              color: "white",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.4)" },
              "&:focus": { outline: "none" },
              "&:active": { outline: "none" },
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>

          <IconButton
            onClick={nextSlide}
            sx={{
              position: "absolute",
              top: "50%",
              right: 10,
              transform: "translateY(-50%)",
              backgroundColor: "rgba(0,0,0,0.2)",
              color: "white",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.4)" },
              "&:focus": { outline: "none" },
              "&:active": { outline: "none" },
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>

        <InfiniteCarousel />
        <MenuCard
          searchQuery={searchQuery}
          searchTrigger={searchTrigger}
          setCartCount={setCartCount}
        />
        <CustomerReviews />
      </Box>
      <Snackbar
        open={notif.open}
        autoHideDuration={4000}
        onClose={() => setNotif({ ...notif, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotif({ ...notif, open: false })}
          severity="info"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notif.message}
        </Alert>
      </Snackbar>
      <Footer />
    </ThemeProvider>
  );
}
