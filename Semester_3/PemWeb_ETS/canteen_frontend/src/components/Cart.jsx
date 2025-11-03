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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import api from "../../services/api";
import { CheckCircle } from "lucide-react";

export default function CartPopup({ open, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:480px)");
  
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const token = localStorage.getItem("token");
  const [success, setSuccess] = useState(false);

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
    } catch (err) {
      console.error("Error adding to cart:", err.response?.data || err);
    }
  };

  const createOrder = async () => {
    setLoading(true);
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
      setLoading(false);
      setSuccess(true);

      const timer = setTimeout(() => {
        setSuccess(false);
        location.reload();
      }, 3000);
    } catch (error) {
      setLoading(false);
      console.log(error.response?.data || error.message);
      console.log("yah gagal");
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={isMobile}
        maxWidth="md"
        sx={{
          "& .MuiPaper-root": {
            borderRadius: isMobile ? 0 : 1.5,
            overflow: "hidden",
            width: isMobile ? "100%" : "auto",
            margin: isMobile ? 0 : 2,
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
            minWidth: isMobile ? "100%" : "200px",
            width: "100%",
            py: isMobile ? 2 : 2.5,
            px: isMobile ? 2 : 3,
          }}
        >
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            fontWeight={700}
          >
            Your Cart
          </Typography>
          <IconButton 
            onClick={onClose} 
            sx={{ 
              color: "white",
              width: isMobile ? 36 : 40,
              height: isMobile ? 36 : 40,
            }}
          >
            <CloseIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: isMobile ? 2 : 3,
            bgcolor: "#fafafa",
            maxHeight: isMobile ? "calc(100vh - 120px)" : "70vh",
            overflowY: "auto",
            scrollbarWidth: "none",
            minWidth: isMobile ? "100%" : "500px",
            maxWidth: isMobile ? "100%" : "700px",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            mt: 2,
          }}
        >
          {loading ? (
            <Typography>Loading cart...</Typography>
          ) : menuItems.length === 0 ? (
            <Box 
              sx={{ 
                textAlign: "center", 
                py: isMobile ? 4 : 6 
              }}
            >
              <Typography 
                color="text.secondary"
                variant={isMobile ? "body2" : "body1"}
              >
                No items found in cart.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={isMobile ? 1.5 : 2}>
              {menuItems.map((item) => (
                <Grid item xs={12} key={item.id}>
                  <Card
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      borderRadius: isMobile ? 1.5 : 2,
                      width: "100%",
                      p: isMobile ? 1 : 1.5,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    {item.image_url && (
                      <CardMedia
                        component="img"
                        image={item.image_url}
                        alt={item.name}
                        sx={{
                          width: isMobile ? 60 : 70,
                          height: isMobile ? 60 : 70,
                          borderRadius: 1,
                          objectFit: "cover",
                          mr: isMobile ? 1.5 : 2,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <CardContent 
                      sx={{ 
                        flexGrow: 1, 
                        p: isMobile ? 0.5 : 1,
                        "&:last-child": {
                          pb: isMobile ? 0.5 : 1,
                        },
                      }}
                    >
                      <Typography 
                        fontWeight="bold"
                        sx={{
                          fontSize: isMobile ? "0.9rem" : "1rem",
                          mb: 0.5,
                          whiteSpace: isMobile ? "nowrap" : "normal",
                          overflow: isMobile ? "hidden" : "visible",
                          textOverflow: isMobile ? "ellipsis" : "clip",
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="primary.main"
                        sx={{
                          fontSize: isMobile ? "0.8rem" : "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        Rp {item.pivot.subtotal_price.toLocaleString()}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: isMobile ? 1 : 1.5,
                          mt: isMobile ? 1 : 1.5,
                          flexWrap: isMobile ? "wrap" : "nowrap",
                        }}
                      >
                        <Box 
                          sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 1 
                          }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              if (item.pivot.quantity - 1 === 0) {
                                handleDeleteCart(item.id, 0);
                              } else {
                                handleUpdateCart(item.id, item.pivot.quantity - 1);
                              }
                            }}
                            sx={{
                              minWidth: isMobile ? 32 : 36,
                              height: isMobile ? 32 : 36,
                              p: 0,
                              fontSize: isMobile ? "1rem" : "1.2rem",
                            }}
                          >
                            -
                          </Button>

                          <Typography 
                            variant="body1"
                            sx={{
                              fontSize: isMobile ? "0.9rem" : "1rem",
                              minWidth: isMobile ? 20 : 24,
                              textAlign: "center",
                            }}
                          >
                            {item.pivot.quantity}
                          </Typography>

                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              handleUpdateCart(item.id, item.pivot.quantity + 1)
                            }
                            sx={{
                              minWidth: isMobile ? 32 : 36,
                              height: isMobile ? 32 : 36,
                              p: 0,
                              fontSize: isMobile ? "1rem" : "1.2rem",
                            }}
                          >
                            +
                          </Button>
                        </Box>

                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteCart(item.id, 0)}
                          sx={{ 
                            ml: "auto",
                            fontSize: isMobile ? "0.75rem" : "0.875rem",
                            px: isMobile ? 1 : 1.5,
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
          )}

          {menuItems.length > 0 && (
            <Box 
              sx={{ 
                mt: isMobile ? 2 : 3, 
                textAlign: "right" 
              }}
            >
              <Button
                variant="contained"
                fullWidth={isMobile}
                sx={{
                  background: "linear-gradient(45deg, #050163ff, #2c96c1ff)",
                  py: isMobile ? 1.2 : 1,
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  fontWeight: 600,
                }}
                onClick={() => createOrder()}
              >
                Order Now
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Loading Dialog */}
      <Dialog
        open={loading}
        PaperProps={{
          sx: {
            bgcolor: "white",
            borderRadius: 2,
            p: isMobile ? 2 : 3,
            minWidth: isMobile ? 250 : 300,
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
            <CircularProgress 
              size={isMobile ? 40 : 50} 
              sx={{ color: "black" }} 
            />
            <Typography
              variant="body1"
              sx={{ 
                color: "black", 
                fontWeight: 500,
                fontSize: isMobile ? "0.9rem" : "1rem",
              }}
            >
              Ordering...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={success}
        PaperProps={{
          sx: {
            bgcolor: "white",
            borderRadius: 2,
            p: isMobile ? 2 : 3,
            minWidth: isMobile ? 250 : 300,
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
                width: isMobile ? 50 : 60,
                height: isMobile ? 50 : 60,
                borderRadius: "50%",
                bgcolor: "#4caf50",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle 
                size={isMobile ? 28 : 36} 
                color="white" 
              />
            </Box>
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"}
              sx={{ 
                color: "black", 
                fontWeight: 600, 
                fontFamily: "Inter, sans-serif",
                textAlign: "center",
              }}
            >
              Order Successful!
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}