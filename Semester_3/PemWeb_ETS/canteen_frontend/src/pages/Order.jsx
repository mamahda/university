import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Collapse,
  Fade,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Stack,
  Avatar,
  Paper,
  alpha,
  Snackbar,
  Alert,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ExpandMore,
  MoreVert,
  Schedule,
  LocalShipping,
  CheckCircle,
  Person,
  CalendarToday,
  AccessTime,
  ShoppingBag,
  HighlightOff,
} from "@mui/icons-material";
import api from "../../services/api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

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

export default function DashboardOrders() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:480px)");

  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [tabValue, setTabValue] = useState("Pending");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [errorNotif, setErrorNotif] = useState({
    open: false,
    message: "",
  });
  const [prevStatuses, setPrevStatuses] = useState({});
  const [notif, setNotif] = useState({
    open: false,
    message: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [openChart, setOpenChart] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  console.log(user);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user.name === "admin") {
      navigate("/dashboard/menu");
    }
  });

  const handleAuthNav = (type) => {
    if (type === "login") {
      navigate("/login");
    } else if (type === "register") {
      navigate("/register");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders", {
        headers: {
          Authorization: `bearer ${token}`,
        },
      });

      if (Array.isArray(res.data.data)) {
        const newOrders = res.data.data;

        newOrders.forEach((order) => {
          const oldStatus = prevStatuses[order.id];
          if (oldStatus && oldStatus !== order.status) {
            setNotif({
              open: true,
              message: `Order Status for ORD-${order.id} change to: ${order.status}`,
            });
          }
        });

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
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [prevStatuses]);

  console.log(orders);
  const handleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleStatusMenuOpen = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleStatusMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;

    try {
      await api.patch(
        `/orders/${selectedOrder.id}`,
        {},
        {
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, status: newStatus } : o
        )
      );

      handleStatusMenuClose();
    } catch (error) {
      console.log(error);
      setErrorNotif({
        open: true,
        message: "Cannot Cancel Order!",
      });
      console.log(error);
    }
  };

  const filteredOrders = orders.filter(
    (order) => order.status.toLowerCase() === tabValue.toLowerCase()
  );

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: "Pending",
        color: "#ff9800",
        bgcolor: alpha("#ff9800", 0.1),
        icon: Schedule,
      },
      processing: {
        label: "Processing",
        color: "#2196f3",
        bgcolor: alpha("#2196f3", 0.1),
        icon: LocalShipping,
      },
      completed: {
        label: "Completed",
        color: "#4caf50",
        bgcolor: alpha("#4caf50", 0.1),
        icon: CheckCircle,
      },
      cancelled: {
        label: "Cancelled",
        color: "#ff0000ff",
        bgcolor: alpha("#cb0808ff", 0.1),
        icon: HighlightOff,
      },
    };
    return configs[status.toLowerCase()] || configs.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: isMobile ? "short" : "long",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          p: isMobile ? 2 : 3,
          width: "100vw",
          bgcolor: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cartCount={cartCount}
          openCart={openChart}
          setOpenCart={setOpenChart}
          handleAuthNav={handleAuthNav}
        />

        <Box sx={{ mb: isMobile ? 3 : 4, mt: isMobile ? 8 : 10 }}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{
              fontWeight: 700,
              mb: 1,
              fontFamily: "Inter, sans-serif",
              background: "linear-gradient(45deg, #050163ff, #2c96c1ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Dashboard Orders
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: isMobile ? "0.8rem" : "0.875rem",
            }}
          >
            Kelola dan pantau semua pesanan
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: isMobile ? 2 : 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: alpha("#000", 0.08),
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, val) => setTabValue(val)}
            textColor="primary"
            indicatorColor="primary"
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            sx={{
              "& .MuiTab-root": {
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                textTransform: "none",
                fontSize: isMobile ? "0.75rem" : "15px",
                minHeight: isMobile ? 48 : 56,
                minWidth: isMobile ? 90 : "auto",
                px: isMobile ? 1 : 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: alpha("#2196f3", 0.04),
                },
              },
              "& .Mui-selected": {
                color: "#2196f3",
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab
              icon={<Schedule sx={{ fontSize: isMobile ? 16 : 20, mb: 0.5 }} />}
              iconPosition="start"
              label="Pending"
              value="Pending"
            />
            <Tab
              icon={
                <LocalShipping sx={{ fontSize: isMobile ? 16 : 20, mb: 0.5 }} />
              }
              iconPosition="start"
              label="Processing"
              value="Processing"
            />
            <Tab
              icon={
                <CheckCircle sx={{ fontSize: isMobile ? 16 : 20, mb: 0.5 }} />
              }
              iconPosition="start"
              label="Completed"
              value="Completed"
            />
            <Tab
              icon={
                <HighlightOff sx={{ fontSize: isMobile ? 16 : 20, mb: 0.5 }} />
              }
              iconPosition="start"
              label="Cancelled"
              value="Cancelled"
            />
          </Tabs>
        </Paper>

        <Fade in timeout={400}>
          <Box>
            {filteredOrders.length === 0 ? (
              <Paper
                sx={{
                  p: isMobile ? 4 : 6,
                  textAlign: "center",
                  borderRadius: isMobile ? 2 : 3,
                  border: "1px dashed",
                  borderColor: alpha("#000", 0.12),
                }}
              >
                <ShoppingBag
                  sx={{
                    fontSize: isMobile ? 48 : 64,
                    color: "text.disabled",
                    mb: 2,
                  }}
                />
                <Typography
                  variant={isMobile ? "body1" : "h6"}
                  color="text.secondary"
                  sx={{ fontFamily: "Inter, sans-serif" }}
                >
                  Tidak ada order {tabValue.toLowerCase()}
                </Typography>
              </Paper>
            ) : (
              filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <Card
                    key={order.id}
                    sx={{
                      mb: 2,
                      borderRadius: isMobile ? 2 : 3,
                      border: "1px solid",
                      borderColor: alpha("#000", 0.08),
                      transition: "all 0.3s ease",
                      overflow: "hidden",
                      "&:hover": {
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        transform: isMobile ? "none" : "translateY(-2px)",
                        borderColor: alpha(statusConfig.color, 0.3),
                      },
                    }}
                  >
                    <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        justifyContent="space-between"
                        flexDirection={isMobile ? "column" : "row"}
                        gap={isMobile ? 2 : 0}
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleExpand(order.id)}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: isMobile ? 1.5 : 2,
                            width: isMobile ? "100%" : "auto",
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: statusConfig.bgcolor,
                              width: isMobile ? 40 : 48,
                              height: isMobile ? 40 : 48,
                            }}
                          >
                            <StatusIcon
                              sx={{
                                color: statusConfig.color,
                                fontSize: isMobile ? 20 : 24,
                              }}
                            />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant={isMobile ? "subtitle1" : "h6"}
                              sx={{
                                fontWeight: 700,
                                fontFamily: "Inter, sans-serif",
                                mb: 0.5,
                              }}
                            >
                              Order #{order.id}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: isMobile ? 1 : 2,
                                flexWrap: "wrap",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <Person
                                  sx={{
                                    fontSize: isMobile ? 14 : 16,
                                    color: "text.secondary",
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: isMobile ? "0.7rem" : "0.875rem",
                                  }}
                                >
                                  {user.name || "Tanpa Nama"}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <CalendarToday
                                  sx={{
                                    fontSize: isMobile ? 12 : 14,
                                    color: "text.secondary",
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: isMobile ? "0.7rem" : "0.875rem",
                                  }}
                                >
                                  {formatDate(order.created_at)}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <AccessTime
                                  sx={{
                                    fontSize: isMobile ? 12 : 14,
                                    color: "text.secondary",
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: isMobile ? "0.7rem" : "0.875rem",
                                  }}
                                >
                                  {formatTime(order.created_at)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>

                        <Stack
                          direction="row"
                          spacing={isMobile ? 1 : 1.5}
                          alignItems="center"
                          sx={{
                            width: isMobile ? "100%" : "auto",
                            justifyContent: isMobile
                              ? "space-between"
                              : "flex-start",
                          }}
                        >
                          <Box sx={{ textAlign: isMobile ? "left" : "right" }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: isMobile ? "0.65rem" : "0.75rem",
                              }}
                            >
                              Total
                            </Typography>
                            <Typography
                              variant={isMobile ? "subtitle1" : "h6"}
                              sx={{
                                fontWeight: 700,
                                color: statusConfig.color,
                                fontFamily: "Inter, sans-serif",
                              }}
                            >
                              Rp {order.total_price.toLocaleString("id-ID")}
                            </Typography>
                          </Box>

                          <Chip
                            icon={
                              <StatusIcon
                                sx={{ fontSize: isMobile ? 14 : 18 }}
                              />
                            }
                            label={statusConfig.label}
                            size={isMobile ? "small" : "medium"}
                            sx={{
                              bgcolor: statusConfig.bgcolor,
                              color: statusConfig.color,
                              fontWeight: 600,
                              fontFamily: "Inter, sans-serif",
                              fontSize: isMobile ? "0.7rem" : "0.8125rem",
                              border: `1px solid ${alpha(
                                statusConfig.color,
                                0.3
                              )}`,
                              "& .MuiChip-icon": {
                                color: statusConfig.color,
                              },
                            }}
                          />

                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusMenuOpen(e, order);
                              }}
                              size={isMobile ? "small" : "medium"}
                              sx={{
                                bgcolor: alpha("#000", 0.04),
                                "&:hover": { bgcolor: alpha("#000", 0.08) },
                              }}
                            >
                              <MoreVert
                                fontSize={isMobile ? "small" : "medium"}
                              />
                            </IconButton>

                            <IconButton
                              size={isMobile ? "small" : "medium"}
                              sx={{
                                bgcolor: alpha("#000", 0.04),
                                transition: "all 0.3s ease",
                                "&:hover": { bgcolor: alpha("#000", 0.08) },
                              }}
                            >
                              <ExpandMore
                                fontSize={isMobile ? "small" : "medium"}
                                sx={{
                                  transform:
                                    expanded === order.id
                                      ? "rotate(180deg)"
                                      : "rotate(0deg)",
                                  transition: "transform 0.3s ease",
                                }}
                              />
                            </IconButton>
                          </Box>
                        </Stack>
                      </Box>

                      <Collapse in={expanded === order.id} timeout="auto">
                        <Divider sx={{ my: isMobile ? 2 : 2.5 }} />

                        <Box
                          sx={{
                            bgcolor: alpha("#000", 0.02),
                            borderRadius: isMobile ? 1.5 : 2,
                            p: isMobile ? 1.5 : 2,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 2,
                              fontWeight: 600,
                              fontFamily: "Inter, sans-serif",
                              color: "text.secondary",
                              fontSize: isMobile ? "0.8rem" : "0.875rem",
                            }}
                          >
                            Items Pesanan ({order.menus?.length || 0})
                          </Typography>

                          <Stack spacing={isMobile ? 1 : 1.5}>
                            {order.menus?.map((menu, i) => (
                              <Box
                                key={i}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: isMobile ? 1.5 : 2,
                                  p: isMobile ? 1 : 1.5,
                                  bgcolor: "white",
                                  borderRadius: isMobile ? 1.5 : 2,
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                  },
                                }}
                              >
                                <Avatar
                                  src={menu.image_url}
                                  alt={menu.name}
                                  variant="rounded"
                                  sx={{
                                    width: isMobile ? 50 : 60,
                                    height: isMobile ? 50 : 60,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                  }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      fontFamily: "Inter, sans-serif",
                                      mb: 0.5,
                                      fontSize: isMobile ? "0.85rem" : "1rem",
                                      whiteSpace: isMobile
                                        ? "nowrap"
                                        : "normal",
                                      overflow: isMobile ? "hidden" : "visible",
                                      textOverflow: isMobile
                                        ? "ellipsis"
                                        : "clip",
                                    }}
                                  >
                                    {menu.name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      fontFamily: "Inter, sans-serif",
                                      fontSize: isMobile
                                        ? "0.7rem"
                                        : "0.875rem",
                                    }}
                                  >
                                    {menu.pivot?.quantity}x @ Rp{" "}
                                    {menu.pivot?.unit_price.toLocaleString(
                                      "id-ID"
                                    )}
                                  </Typography>
                                </Box>
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    fontFamily: "Inter, sans-serif",
                                    color: statusConfig.color,
                                    fontSize: isMobile ? "0.85rem" : "1rem",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Rp{" "}
                                  {menu.pivot?.subtotal_price.toLocaleString(
                                    "id-ID"
                                  )}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Box>
        </Fade>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleStatusMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              mt: 1,
              minWidth: isMobile ? 160 : 180,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            },
          }}
        >
          <MenuItem
            onClick={() => handleStatusChange("cancelled")}
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: isMobile ? "0.85rem" : "1rem",
              py: isMobile ? 1 : 1.5,
              "&:hover": { bgcolor: alpha("#990404ff", 0.08) },
            }}
          >
            <Schedule
              sx={{
                mr: 1.5,
                fontSize: isMobile ? 18 : 20,
                color: "#b00710ff",
              }}
            />
            Cancel Order
          </MenuItem>
        </Menu>

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
      </Box>
    </ThemeProvider>
  );
}
