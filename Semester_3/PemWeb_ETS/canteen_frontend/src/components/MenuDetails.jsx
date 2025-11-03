import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Paper,
  TextField,
  Button,
  CardMedia,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import api from "../../services/api";

export default function OrderDetailDialog({
  open,
  onClose,
  item,
  setCartCount,
  cartItems,
  setCartItems,
}) {
  console.log(item);

  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:480px)");

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => quantity > 1 && setQuantity((q) => q - 1);
  const formatPrice = (price) => `Rp ${price.toLocaleString("id-ID")}`;
  const [errorNotif, setErrorNotif] = useState({
    open: false,
    message: "",
  });

  const token = localStorage.getItem("token");
  const totalPrice = item.price * quantity;

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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 1,
          overflow: "hidden",
          margin: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogContent sx={{ p: 0, overflow: "hidden" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            height: isMobile ? "100vh" : { md: 500 },
            overflow: "auto",
          }}
        >
          {/* LEFT SECTION – IMAGE */}
          <Box
            sx={{
              width: { xs: "100%", md: "45%" },
              height: isMobile ? "250px" : "auto",
              backgroundColor: "grey.100",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              fontSize: "10rem",
              flexShrink: 0,
            }}
          >
            <CardMedia
              component="img"
              image={item.image_url}
              alt={item.name}
              sx={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
              }}
            />

            <IconButton
              onClick={onClose}
              sx={{
                position: "absolute",
                top: isMobile ? 8 : 12,
                left: isMobile ? 8 : 12,
                backgroundColor: "white",
                width: isMobile ? 36 : 40,
                height: isMobile ? 36 : 40,
                "&:hover": { backgroundColor: "grey.100" },
              }}
            >
              <CloseIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
            <IconButton
              onClick={() => setIsFavorite(!isFavorite)}
              sx={{
                position: "absolute",
                top: isMobile ? 8 : 12,
                right: isMobile ? 8 : 12,
                backgroundColor: "white",
                width: isMobile ? 36 : 40,
                height: isMobile ? 36 : 40,
                "&:hover": { backgroundColor: "grey.100" },
              }}
            >
              {isFavorite ? (
                <FavoriteIcon
                  sx={{ color: "red", fontSize: isMobile ? "small" : "medium" }}
                />
              ) : (
                <FavoriteBorderIcon fontSize={isMobile ? "small" : "medium"} />
              )}
            </IconButton>
          </Box>

          {/* RIGHT SECTION – DETAILS */}
          <Box
            sx={{
              flex: 1,
              p: isMobile ? 2 : 4,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              scrollbarWidth: "none", // Firefox
              "&::-webkit-scrollbar": {
                display: "none", // Chrome, Edge, Safari
              },
            }}
          >
            {/* HEADER */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{ fontWeight: 700 }}
              >
                {item.name}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? 0.5 : 1,
                  mt: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "warning.main",
                    fontWeight: 600,
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                  }}
                >
                  ⭐ 4.5/5.0
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
                >
                  ({item.reviews} reviews)
                </Typography>
                <Divider orientation="vertical" flexItem />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
                >
                  🕐 10-15 Minutes
                </Typography>
              </Box>
              <Chip
                label="available"
                color="success"
                size="small"
                sx={{
                  mt: 1,
                  fontWeight: 600,
                  height: isMobile ? 24 : 32,
                  fontSize: isMobile ? "0.7rem" : "0.8125rem",
                }}
              />
            </Box>

            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{ fontWeight: 700, color: "primary.main", mb: 2 }}
            >
              {formatPrice(item.price)}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
                lineHeight: 1.6,
                fontSize: isMobile ? "0.875rem" : "1rem",
              }}
            >
              {item.description}
            </Typography>

            {/* QUANTITY */}
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1,
                fontSize: isMobile ? "0.875rem" : "1rem",
              }}
            >
              Quantity
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                display: "flex",
                alignItems: "center",
                width: "fit-content",
                borderRadius: 2,
                mb: 3,
              }}
            >
              <IconButton
                onClick={handleDecrement}
                disabled={quantity <= 1}
                size={isMobile ? "small" : "medium"}
              >
                <RemoveIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
              <Typography
                variant={isMobile ? "body1" : "h6"}
                sx={{ px: isMobile ? 1.5 : 2 }}
              >
                {quantity}
              </Typography>
              <IconButton
                onClick={handleIncrement}
                size={isMobile ? "small" : "medium"}
              >
                <AddIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Paper>

            {/* NOTES */}
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1,
                fontSize: isMobile ? "0.875rem" : "1rem",
              }}
            >
              Special Notes (Optional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={isMobile ? 2 : 2}
              placeholder="Add any special requests..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "grey.50",
                  fontSize: isMobile ? "0.875rem" : "1rem",
                },
              }}
            />

            {/* TOTAL */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: isMobile ? 2 : 3,
                mb: isMobile ? 1 : 0,
              }}
            >
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                sx={{ fontWeight: 700 }}
              >
                Total
              </Typography>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{ fontWeight: 700, color: "primary.main" }}
              >
                {formatPrice(totalPrice)}
              </Typography>
            </Box>

            {/* BUTTON */}
            <Button
              variant="contained"
              fullWidth
              startIcon={
                <ShoppingCartIcon fontSize={isMobile ? "small" : "medium"} />
              }
              sx={{
                mt: isMobile ? 2 : 3,
                py: isMobile ? 1 : 1.2,
                fontWeight: 600,
                fontSize: isMobile ? "0.875rem" : "1rem",
              }}
              onClick={() => {
                handleAddToCart(item.id);
              }}
            >
              Add to Cart
            </Button>
          </Box>
        </Box>
      </DialogContent>
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
    </Dialog>
  );
}
