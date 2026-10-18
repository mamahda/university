import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import api from "../../services/api";
import { CheckCircle } from "lucide-react";

export default function CartPopup({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const token = localStorage.getItem("token");
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!open) return;

    const fetchCart = async () => {
      try {
        const res = await api.get("/carts", {
          headers: {
            Authorization: `bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log("Cart API response:", res.data);

        const cartData = res.data.data;
        const items = Array.isArray(cartData?.menus) ? cartData.menus : [];
        setMenuItems(items);
      } catch (err) {
        console.error("Error fetching cart:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [open]);

  const handleUpdateCart = async (item_id, newQuantity) => {
    try {

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

      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === item_id
            ? {
                ...item,
                pivot: {
                  ...item.pivot,
                  quantity: newQuantity,
                  subtotal_price: newQuantity * item.price,
                },
              }
            : item
        )
      );
      // Update badge cart count total
      setCartCount((prev) => prev + 1);
    } catch (err) {
      console.error("Error adding to cart:", err.response?.data || err);
    }
  };

  const handleDeleteCart = async (item_id, newQuantity) => {
    try {
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

      setMenuItems((prev) => prev.filter((item) => item.id !== item_id));
      setCartCount((prev) => prev + 1);
    } catch (err) {
      console.error("Error adding to cart:", err.response?.data || err);
    }
  };

  const createOrder = async () => {
    setLoading(true)
    try {
      const res = await api.post(
        "/orders",
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      console.log("yeyeye", res.data);
      setLoading(false)
      setSuccess(true)

      const timer = setTimeout(() => {
        setSuccess(false);
        location.reload()
      }, 3000);



    } catch (error) {
      setLoading(false)
      console.log(error.response?.data || error.message);
      console.log("yah gagal");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      // maxWidth="xl"
      minWidth="300px"
      // fullWidth
      // scroll="body"
      sx={{
        // minWidth:"300px",
        "& .MuiPaper-root": {
          borderRadius: 1.5,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(45deg, #050163ff, #2c96c1ff)",
          color: "white",
          minWidth:"200px",
          width:"100%"
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Your Cart
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          bgcolor: "#fafafa",
          maxHeight: "70vh",
          overflowY: "auto",
          scrollbarWidth: "none", // untuk Firefox
          minWidth:"500px",
          maxWIdth:"700px",
          "&::-webkit-scrollbar": {
            display: "none", // untuk Chrome, Edge, Safari
          },
          mt: 2,
        }}
      >
        {/* Jika masih loading */}
        {loading ? (
          <Typography>Loading cart...</Typography>
        ) : menuItems.length === 0 ? (
          <Typography color="text.secondary">
            No items found in cart.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {menuItems.map((item) => (
              <Grid item xs={12} key={item.id}>
                <Card
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 1,
                    width: "35vw",
                    p: 1,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  {item.image_url && (
                    <CardMedia
                      component="img"
                      image={item.image_url}
                      alt={item.name}
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: 1,
                        objectFit: "cover",
                        mr: 2,
                      }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1, p: 1 }}>
                    <Typography fontWeight="bold">{item.name}</Typography>
                    <Typography variant="body2" color="primary.main">
                      Rp {item.pivot.subtotal_price.toLocaleString()}
                    </Typography>

                    {/* Tombol +, -, dan Delete */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        mt: 1,
                      }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (item.pivot.quantity - 1 == 0) {
                            handleDeleteCart(item.id, 0);
                          } else {
                            handleUpdateCart(item.id, item.pivot.quantity - 1);
                          }
                        }}
                        value="minus"
                      >
                        -
                      </Button>

                      <Typography variant="body1">
                        {item.pivot.quantity}
                      </Typography>

                      <Button
                        variant="outlined"
                        size="small"
                        value="plus"
                        onClick={() =>
                          handleUpdateCart(item.id, item.pivot.quantity + 1)
                        }
                      >
                        +
                      </Button>

                      <Button
                        variant="text"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteCart(item.id, 0)}
                        sx={{ ml: "auto" }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Tombol Pay Now */}
        {menuItems.length > 0 && (
          <Box sx={{ mt: 3, textAlign: "right" }}>
            <Button
              variant="contained"
              // color="primary"
              sx={{
                background: "linear-gradient(45deg, #050163ff, #2c96c1ff)",
              }}
              onClick={() => createOrder()}
            >
              Order Now
            </Button>
          </Box>
        )}
      </DialogContent>
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
                    Ordering...
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
                  <Typography variant="h6" sx={{ color: "black", fontWeight: 600, fontFamily:"Inter, sans-serif" }}>
                    Order Successful!
                  </Typography>
                </Box>
              </DialogContent>
            </Dialog>
    </Dialog>
  );

}
