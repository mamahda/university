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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import OrderDetailDialog from "./MenuDetails";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function MenuCard({ searchQuery, searchTrigger, setCartCount }) {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:480px)");
  
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
            name: searchQuery || undefined,
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
      <Container maxWidth="xl" sx={{ mt: isMobile ? 6 : 8, mb: isMobile ? 6 : 8, px: isMobile ? 2 : 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: isMobile ? 2 : 4 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            centered={!isMobile}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: isMobile ? "0.9rem" : "1.2rem",
                fontWeight: 500,
                minWidth: isMobile ? 100 : 150,
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
                  mx: isMobile ? 0.5 : 1,
                  "&:focus": { outline: "none" },
                  "&:active": { outline: "none" },
                }}
              />
            ))}
          </Tabs>
        </Box>

        <Grid
          container
          spacing={isMobile ? 2 : 4}
          justifyContent="center"
          alignItems="stretch"
          sx={{
            overflowX: "hidden",
            flexWrap: "wrap",
            pt: isMobile ? 1 : 2,
            pb: 1,
          }}
        >
          {filteredItems.map((item) => {
            const isOutOfStock = item.stock === 0;

            return (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <Card
                  onClick={() => {
                    if (isOutOfStock) return;
                    setOpen(true);
                    setSelectedItem(item);
                  }}
                  elevation={isMobile ? 2 : 3}
                  sx={{
                    height: isMobile ? "140px" : "100%",
                    display: "flex",
                    flexDirection: isMobile ? "row" : "column",
                    width: "100%",
                    minWidth: isMobile ? "360px" : "100%",
                    borderRadius: isMobile ? 2 : 1,
                    transition: "all 0.3s ease",
                    cursor: isOutOfStock ? "not-allowed" : "pointer",
                    filter: isOutOfStock ? "grayscale(100%)" : "none",
                    opacity: isOutOfStock ? 0.6 : 1,
                    overflow: "hidden",
                    "&:hover": {
                      transform: isOutOfStock ? "none" : (isMobile ? "none" : "translateY(-8px)"),
                      boxShadow: isOutOfStock ? (isMobile ? 2 : 3) : (isMobile ? 3 : 6),
                    },
                  }}
                >
                  {/* IMAGE SECTION - GoFood Style */}
                  <Box 
                    sx={{ 
                      position: "relative",
                      width: isMobile ? "120px" : "100%",
                      flexShrink: 0,
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={item.image_url}
                      alt={item.name}
                      sx={{
                        height: isMobile ? "140px" : 170,
                        width: isMobile ? 120 : "100%",
                        objectFit: "cover",
                      }}
                    />
                    
                    {isOutOfStock && (
                      <Chip
                        label="Out of Stock"
                        color="default"
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          position: "absolute",
                          top: 6,
                          left: 6,
                          backgroundColor: "rgba(0,0,0,0.7)",
                          color: "white",
                          fontWeight: 600,
                          fontSize: isMobile ? "0.65rem" : "0.8125rem",
                        }}
                      />
                    )}

                    {!isMobile && (
                      <>
                        <IconButton
                          onClick={(e) => handleToggleFavorite(item.id, e)}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            width: 36,
                            height: 36,
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 1)",
                            },
                          }}
                        >
                          {favorites[item.id] ? (
                            <FavoriteIcon sx={{ color: "red", fontSize: 20 }} />
                          ) : (
                            <FavoriteBorderIcon sx={{ fontSize: 20 }} />
                          )}
                        </IconButton>

                        <Chip
                          icon={<LocalOfferIcon sx={{ fontSize: 14 }} />}
                          label={item.type}
                          size="small"
                          sx={{
                            position: "absolute",
                            bottom: 8,
                            left: 8,
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        />
                      </>
                    )}
                  </Box>

                  {/* CONTENT SECTION - GoFood Style */}
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      p: isMobile ? 1.5 : 2.5,
                      "&:last-child": {
                        pb: isMobile ? 1.5 : 2.5,
                      },
                    }}
                  >
                    {/* Title & Price */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: isMobile ? 0.5 : 1,
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant={isMobile ? "body1" : "h6"}
                        sx={{
                          fontWeight: 600,
                          fontSize: isMobile ? "0.85rem" : "1.1rem",
                          color: "text.primary",
                          flex: 1,
                          lineHeight: 1.3,
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant={isMobile ? "body1" : "h6"}
                        sx={{
                          fontWeight: 700,
                          fontSize: isMobile ? "0.9rem" : "1.1rem",
                          color: "primary.main",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatPrice(item.price)}
                      </Typography>
                    </Box>

                    {/* Category Chip on Mobile */}
                    {isMobile && (
                      <Chip
                        icon={<LocalOfferIcon sx={{ fontSize: 12 }} />}
                        label={item.type}
                        size="small"
                        sx={{
                          width: "fit-content",
                          mb: 0.5,
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          "& .MuiChip-icon": {
                            marginLeft: "4px",
                          },
                        }}
                      />
                    )}

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: isMobile ? 1 : 2,
                        lineHeight: 1.5,
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        display: "-webkit-box",
                        WebkitLineClamp: isMobile ? 1 : 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        minHeight: isMobile ? "auto" : "2.625rem",
                      }}
                    >
                      {item.description}
                    </Typography>

                    {/* Rating */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: isMobile ? 1 : 2,
                      }}
                    >
                      <Rating
                        value={item.rating || 4.5}
                        precision={0.5}
                        readOnly
                        size={isMobile ? "small" : "small"}
                        sx={{
                          fontSize: isMobile ? "0.5rem" : "1rem",
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ 
                          ml: 0.5, 
                          color: "text.secondary",
                          fontSize: isMobile ? "0.7rem" : "0.875rem",
                        }}
                      >
                        {item.rating || 4.5} ({item.total_reviews || 0})
                      </Typography>
                    </Box>

                    {/* Buttons - Different layout for mobile */}
                    {isMobile ? (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          width: "100%",
                        }}
                      >
                        <IconButton
                          onClick={(e) => handleToggleFavorite(item.id, e)}
                          sx={{
                            border: 1,
                            borderColor: "divider",
                            width: 36,
                            height: 36,
                            flexShrink: 0,
                          }}
                        >
                          {favorites[item.id] ? (
                            <FavoriteIcon sx={{ color: "red", fontSize: 18 }} />
                          ) : (
                            <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                        
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpen(true);
                            setSelectedItem(item);
                          }}
                          sx={{
                            flex: 1,
                            fontSize: "0.75rem",
                            py: 0.5,
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          View
                        </Button>
                        
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item.id);
                          }}
                          sx={{
                            flex: 1,
                            background: "#30468b",
                            fontSize: "0.75rem",
                            py: 0.5,
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          Add
                        </Button>
                      </Box>
                    ) : (
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
                            textTransform: "none",
                            fontWeight: 600,
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
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          Add To Cart
                        </Button>
                      </Box>
                    )}
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
          <Box sx={{ textAlign: "center", py: isMobile ? 6 : 8 }}>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              color="text.secondary"
            >
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