import { useState, useEffect } from "react";
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
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import OrderDetailDialog from "./MenuDetails";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function MenuCard({ searchQuery, searchTrigger, setCartCount }) {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [cartItems, setCartItems] = useState({});
  const [errorNotif, setErrorNotif] = useState({
    open: false,
    message: "",
  });
  const [openPopup, setOpenPopup] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await api.get("/menus", {
          params: {
            name: searchQuery || undefined, // kirim param name hanya jika ada
          },
        });
        setMenuItems(response.data.data || response.data);
        console.log(`Fetching menus with query: ${searchQuery}`);
      } catch (err) {
        console.error("Error fetching menus:", err);
      }
    };

    fetchMenus();

    const interval = setInterval(fetchMenus, 5000);
    return () => clearInterval(interval);
  }, [searchTrigger, searchQuery]);

  const categories = ["All Menu", "Snack", "Main Course", "Beverage"];

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const token = localStorage.getItem("token");

  const handleAddToCart = async (item_id) => {
    try {
      let currentQuantity = cartItems[item_id] || 0;
      let newQuantity = currentQuantity + 1;

      setCartItems((prev) => ({
        ...prev,
        [item_id]: newQuantity,
      }));

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

      if (setCartCount) {
        setCartCount((prev) => prev + 1);
      }
    } catch (err) {
      setErrorNotif({
        open: true,
        message: `${err.response?.data?.message || err.message}`,
      });
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
      <Container maxWidth="xl" sx={{ mt: 8, mb: 8 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            centered
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "1.2rem",
                fontWeight: 500,
                minWidth: 150,
                color: "text.secondary",
              },
              "& .Mui-selected": {
                color: "primary.main",
                fontWeight: 600,
              },
            }}
          >
            {categories.map((label, index) => (
              <Tab
                key={index}
                label={label}
                disableRipple
                sx={{
                  mx: 1,
                  "&:focus": { outline: "none" },
                  "&:active": { outline: "none" },
                }}
              />
            ))}
          </Tabs>
        </Box>

        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
          sx={{
            overflowX: "hidden",
            flexWrap: "wrap",
            pt: 2,
            pb: 1,
          }}
        >
          {filteredItems.map((item) => {
            const isOutOfStock = item.stock === 0;

            return (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <Card
                  onClick={() => {
                    if (isOutOfStock) return; // 🔒 cegah klik jika stok habis
                    setOpen(true);
                    setSelectedItem(item);
                  }}
                  elevation={3}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    width: "clamp(310px, 23vw, 325px)",
                    borderRadius: 1,
                    transition: "all 0.3s ease",
                    cursor: isOutOfStock ? "not-allowed" : "pointer",
                    filter: isOutOfStock ? "grayscale(100%)" : "none",
                    opacity: isOutOfStock ? 0.6 : 1,
                    "&:hover": {
                      transform: isOutOfStock ? "none" : "translateY(-8px)",
                      boxShadow: isOutOfStock ? 3 : 6,
                    },
                  }}
                >
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
                    {isOutOfStock && (
                      <Chip
                        label="Out of Stock"
                        color="default"
                        sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          backgroundColor: "rgba(0,0,0,0.7)",
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                    )}

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
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
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
                          fontWeight: 600,
                          fontSize: "1.1rem",
                          color: "primary.main",
                          textAlign: "right",
                          ml: 1,
                        }}
                      >
                        {formatPrice(item.price)}
                      </Typography>
                    </Box>

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

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 1,
                        width: "100%",
                      }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(true);
                          setSelectedItem(item);
                        }}
                        sx={{
                          mt: "auto",
                          background: "#ffffffff",
                          color: "black",
                          border: 1,
                          "&:hover": {
                            borderColor: "#30468b",
                            color: "#30468b",
                          },
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item.id);
                        }}
                        sx={{
                          mt: "auto",
                          background: "#30468b",
                        }}
                      >
                        Add To Cart
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {selectedItem && (
          <OrderDetailDialog
            open={open}
            onClose={() => setOpen(false)}
            item={selectedItem}
            setCartCount={setCartCount}
            cartItems={cartItems}
            setCartItems={setCartItems}
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
      <Snackbar
        open={errorNotif.open}
        autoHideDuration={3000}
        onClose={() => setErrorNotif({ ...errorNotif, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setErrorNotif({ ...errorNotif, open: false })}
          sx={{ width: "100%" }}
        >
          {errorNotif.message}
        </Alert>
      </Snackbar>
    </>
  );
}
