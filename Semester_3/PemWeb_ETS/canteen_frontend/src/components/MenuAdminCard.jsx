import { useState, useEffect, useContext } from "react";
import {
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Rating,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import OrderDetailDialog from "./MenuDetailsAdmin";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import AddMenu from "./AddMenuDialog";

export default function MenuCardAdmin() {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [formData, setFormData] = useState({
    id: "",
    quantitiy: 0,
  });
  const [cartItems, setCartItems] = useState({});

  const navigate = useNavigate();
  let menuCartCount = 0;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await api.get("/menus");
        setMenuItems(response.data.data || response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMenus();

    const interval = setInterval(fetchMenus, 5000);

    return () => clearInterval(interval);
  }, []);

  const categories = ["All Menu", "Snack", "Main Course", "Beverage"];

  const categoryMapping = {
    snack: "Snack",
    foods: "Makanan",
    beverages: "Minuman",
  };

  const handleDeleteMenu = async (item_id) => {
    try {
      await api.delete(`/admin/menus/${item_id}`, {
        headers: {
          Authorization: `bearer ${token}`,
        },
      });
    } catch (error) {
      alert(error);
    }
  };
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  console.log("Token:", localStorage.getItem("token"));
  const token = localStorage.getItem("token");

  const handleAddToCart = async (item_id) => {
    try {
      let currentQuantity = cartItems[item_id] || 0;
      let newQuantity = currentQuantity + 1;

      setCartItems((prev) => ({
        ...prev,
        [item_id]: newQuantity,
      }));

      console.log("Sending:", { menu_id: item_id, quantity: newQuantity });

      // Kirim ke backend
      await api.patch(
        `/carts`,
        {
          menu_id: item_id,
          quantity: newQuantity,
        },
        {
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      );

      // Update badge cart count total
      setCartCount((prev) => prev + 1);
    } catch (err) {
      console.error("Error adding to cart:", err.response?.data || err);
    }
  };

  const handleToggleFavorite = (itemId, event) => {
    event.stopPropagation();
    setFavorites((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedTab === 0 || item.type === categories[selectedTab];
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (price) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  return (
    <>
      <Container maxWidth="xl" sx={{ mb: 8 }}>
        <AddMenu
          open={open}
          onClose={() => setOpen(false)}
          onSuccess={() => window.location.reload()}
        />

        {/* Header dan Tombol Tambah Menu */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, fontFamily: "Inter, sans-serif" }}
          >
            Daftar Menu
          </Typography>

          <Button
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              background: "linear-gradient(45deg, #050163ff, #2c96c1ff)",
            }}
            onClick={() => setOpen(true)}
          >
            + Add New Menu
          </Button>
        </Box>

        {/* Category Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            centered
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 500,
                minWidth: 120,
                color: "text.secondary",
              },
              "& .Mui-selected": {
                color: "primary.main",
                fontWeight: 600,
              },
            }}
          >
            {categories.map((label, index) => (
              <Tab key={index} label={label} />
            ))}
          </Tabs>
        </Box>

        {/* Menu Grid - 4 cards per row */}
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
          sx={{
            overflowX: "hidden",
            flexWrap: "wrap",
          }}
        >
          {filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.id}>
              <Card
                onClick={() => {
                  setOpen(true);
                  setSelectedItem(item);
                }}
                elevation={3}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  width: "clamp(280px, 23vw, 300px)",
                  borderRadius: 1,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                  },
                }}
              >
                {/* Image Container with Favorite & Category */}
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    image={item.image_url}
                    alt={item.name}
                    sx={{
                      height: 200,
                      objectFit: "cover",
                    }}
                  />

                  {/* Favorite Button */}
                  <IconButton
                    onClick={(e) => handleToggleFavorite(item.id, e)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 1)",
                      },
                    }}
                  >
                    {favorites[item.id] ? (
                      <FavoriteIcon sx={{ color: "red" }} />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>

                  {/* Category Chip */}
                  <Chip
                    icon={<LocalOfferIcon />}
                    label={item.type}
                    size="small"
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      left: 8,
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    p: 2.5,
                  }}
                >
                  {/* Title and Price */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        color: "text.primary",
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "primary.main",
                        ml: 1,
                      }}
                    >
                      {formatPrice(item.price)}
                    </Typography>
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      flexGrow: 1,
                      lineHeight: 1.6,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.description}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="black"
                    sx={{
                      mb: 2,
                      flexGrow: 1,
                      lineHeight: 1.6,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Stock: {item.stock}
                  </Typography>

                  {/* Rating */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Rating
                      value={item.rating || 4.5}
                      precision={0.5}
                      readOnly
                      size="small"
                    />
                    <Typography
                      variant="body2"
                      sx={{ ml: 1, color: "text.secondary" }}
                    >
                      {item.rating || 4.5} ({item.total_reviews || 0})
                    </Typography>
                  </Box>

                  {/* Add Button */}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={(e) => {
                        setOpen(true);
                        setSelectedItem(item);
                      }}
                      sx={{
                        mt: "auto",
                        borderColor: "#2c96c1ff",
                        border: 1,
                        background: "transparent",
                        color: "black",
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMenu(item.id);
                      }}
                      sx={{
                        mt: "auto",
                        background:
                          "linear-gradient(45deg, #050163ff, #2c96c1ff)",
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {selectedItem && (
          <OrderDetailDialog
            open={open}
            onClose={() => setOpen(false)}
            item={selectedItem}
          />
        )}

        {filteredItems.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Tidak ada item yang sesuai dengan pencarian Anda.
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
}
