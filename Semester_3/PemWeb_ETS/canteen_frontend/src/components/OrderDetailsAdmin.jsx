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
} from "@mui/material";
import {
  ExpandMore,
  MoreVert,
  Schedule,
  FastfoodRounded,
  CheckCircle,
  Person,
  CalendarToday,
  AccessTime,
  ShoppingBag,
  CancelRounded
} from "@mui/icons-material";
import api from "../../services/api";

export default function DashboardOrders() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [tabValue, setTabValue] = useState("Pending");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const token = localStorage.getItem("token");

  const updateStatus = async (order_id, order_status) => {
    try {
      await api.patch(
        `admin/orders/${order_id}`,
        {
          status: order_status,
        },
        {
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      );
    } catch (err) {
      alert("error ndeng");
    }
  };

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/admin/orders", {
          headers: {
            Authorization: `bearer ${token}`,
          },
        });
        if (Array.isArray(res.data.data)) setOrders(res.data.data);
        else setOrders(dummyOrders);
      } catch (err) {
        console.error("Gagal fetch orders:", err);
        setOrders(dummyOrders);
      }
    };
    fetchOrders();
  }, []);

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

  const handleStatusChange = (newStatus) => {
    if (!selectedOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id ? { ...o, status: newStatus } : o
      )
    );
    handleStatusMenuClose();
    try {
      updateStatus(selectedOrder.id, newStatus)
    } catch (error) {
      console.log(error)
      
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
        icon: FastfoodRounded,
      },
      completed: {
        label: "Completed",
        color: "#4caf50",
        bgcolor: alpha("#4caf50", 0.1),
        icon: CheckCircle,
      },
      cancelled: {
        label: "Cancelled",
        color: "#eb0606ff",
        bgcolor: alpha("#c20505ff", 0.1),
        icon: CancelRounded,
      },
    };
    return configs[status.toLowerCase()] || configs.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
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
    <Box
      sx={{
        p: 3,
        width: "100vw",
        maxWidth: "1175px",
        bgcolor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            fontFamily: "Inter, sans-serif",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Dashboard Orders
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontFamily: "Inter, sans-serif" }}
        >
          Kelola dan pantau semua pesanan
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
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
          sx={{
            "& .MuiTab-root": {
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              fontSize: "15px",
              minHeight: 56,
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
            icon={<Schedule sx={{ fontSize: 20, mb: 0.5 }} />}
            iconPosition="start"
            label="Pending"
            value="Pending"
          />
          <Tab
            icon={<FastfoodRounded sx={{ fontSize: 20, mb: 0.5 }} />}
            iconPosition="start"
            label="Processing"
            value="Processing"
          />
          <Tab
            icon={<CheckCircle sx={{ fontSize: 20, mb: 0.5 }} />}
            iconPosition="start"
            label="Completed"
            value="Completed"
          />
          <Tab
            icon={<CancelRounded sx={{ fontSize: 20, mb: 0.5 }} />}
            iconPosition="start"
            label="Cancelled"
            value="Cancelled"
          />
        </Tabs>
      </Paper>

      {/* Order List */}
      <Fade in timeout={400}>
        <Box>
          {filteredOrders.length === 0 ? (
            <Paper
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: 3,
                border: "1px dashed",
                borderColor: alpha("#000", 0.12),
              }}
            >
              <ShoppingBag
                sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
              />
              <Typography
                variant="h6"
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
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: alpha("#000", 0.08),
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      transform: "translateY(-2px)",
                      borderColor: alpha(statusConfig.color, 0.3),
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Header Preview */}
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleExpand(order.id)}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: statusConfig.bgcolor,
                            width: 48,
                            height: 48,
                          }}
                        >
                          <StatusIcon sx={{ color: statusConfig.color }} />
                        </Avatar>
                        <Box>
                          <Typography
                            variant="h6"
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
                              gap: 2,
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
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontFamily: "Inter, sans-serif" }}
                              >
                                {order.user?.name || "Tanpa Nama"}
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
                                sx={{ fontSize: 14, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontFamily: "Inter, sans-serif" }}
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
                                sx={{ fontSize: 14, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontFamily: "Inter, sans-serif" }}
                              >
                                {formatTime(order.created_at)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontFamily: "Inter, sans-serif" }}
                          >
                            Total
                          </Typography>
                          <Typography
                            variant="h6"
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
                          icon={<StatusIcon sx={{ fontSize: 18 }} />}
                          label={statusConfig.label}
                          sx={{
                            bgcolor: statusConfig.bgcolor,
                            color: statusConfig.color,
                            fontWeight: 600,
                            fontFamily: "Inter, sans-serif",
                            border: `1px solid ${alpha(
                              statusConfig.color,
                              0.3
                            )}`,
                            "& .MuiChip-icon": {
                              color: statusConfig.color,
                            },
                          }}
                        />

                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusMenuOpen(e, order);
                          }}
                          sx={{
                            bgcolor: alpha("#000", 0.04),
                            "&:hover": { bgcolor: alpha("#000", 0.08) },
                          }}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>

                        <IconButton
                          sx={{
                            bgcolor: alpha("#000", 0.04),
                            transition: "all 0.3s ease",
                            "&:hover": { bgcolor: alpha("#000", 0.08) },
                          }}
                        >
                          <ExpandMore
                            sx={{
                              transform:
                                expanded === order.id
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                              transition: "transform 0.3s ease",
                            }}
                          />
                        </IconButton>
                      </Stack>
                    </Box>

                    {/* Expand Section */}
                    <Collapse in={expanded === order.id} timeout="auto">
                      <Divider sx={{ my: 2.5 }} />

                      <Box
                        sx={{
                          bgcolor: alpha("#000", 0.02),
                          borderRadius: 2,
                          p: 2,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 2,
                            fontWeight: 600,
                            fontFamily: "Inter, sans-serif",
                            color: "text.secondary",
                          }}
                        >
                          Items Pesanan ({order.menus?.length || 0})
                        </Typography>

                        <Stack spacing={1.5}>
                          {order.menus?.map((menu, i) => (
                            <Box
                              key={i}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                p: 1.5,
                                bgcolor: "white",
                                borderRadius: 2,
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
                                  width: 60,
                                  height: 60,
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  sx={{
                                    fontWeight: 600,
                                    fontFamily: "Inter, sans-serif",
                                    mb: 0.5,
                                  }}
                                >
                                  {menu.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ fontFamily: "Inter, sans-serif" }}
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

      {/* Status Change Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleStatusMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            mt: 1,
            minWidth: 180,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        <MenuItem
          onClick={() => handleStatusChange("Pending")}
          sx={{
            fontFamily: "Inter, sans-serif",
            "&:hover": { bgcolor: alpha("#ff9800", 0.08) },
          }}
        >
          <Schedule sx={{ mr: 1.5, fontSize: 20, color: "#ff9800" }} />
          Pending
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange("Processing")}
          sx={{
            fontFamily: "Inter, sans-serif",
            "&:hover": { bgcolor: alpha("#2196f3", 0.08) },
          }}
        >
          <FastfoodRounded sx={{ mr: 1.5, fontSize: 20, color: "#2196f3" }} />
          Processing
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange("Completed")}
          sx={{
            fontFamily: "Inter, sans-serif",
            "&:hover": { bgcolor: alpha("#4caf50", 0.08) },
          }}
        >
          <CheckCircle sx={{ mr: 1.5, fontSize: 20, color: "#4caf50" }} />
          Completed
        </MenuItem>
      </Menu>
    </Box>
  );
}
