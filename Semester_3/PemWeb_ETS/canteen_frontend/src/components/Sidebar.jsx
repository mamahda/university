import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery,
  Collapse,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ReceiptIcon from "@mui/icons-material/Receipt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useNavigate } from "react-router-dom";

const drawerWidth = 280;
const drawerWidthCollapsed = 70;

export default function Sidebar({ open, onClose, variant = "permanent" }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState({});

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);

  };

  const handleSubmenuToggle = (key) => {
    setOpenSubmenu((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const menuItems = [
    // {
    //   key: "dashboard",
    //   title: "Dashboard",
    //   icon: <DashboardIcon />,
    //   path: "/dashboard",
    // },
    {
      key: "menu",
      title: "Menu",
      icon: <MenuBookIcon />,
      path: "/dashboard/menu",
      // submenu: [
      //   { title: "All Menu", path: "/dashboard/menu", icon: <RestaurantMenuIcon /> },
      //   { title: "Snack", path: "/dashboard/menu", icon: <RestaurantMenuIcon /> },
      //   { title: "Main Course", path: "/dashboard/menu", icon: <RestaurantMenuIcon /> },
      //   { title: "Beverage", path: "/dashboard/menu", icon: <RestaurantMenuIcon /> },
      // ],
    },
    {
      key: "order",
      title: "Order",
      icon: <ShoppingCartIcon />,
      path: "/dashboard/order",
      // submenu: [
      //   { title: "New Orders", path: "/dashboard/order", icon: <ShoppingCartIcon /> },
      // ],
    },
    // {
    //   key: "sales",
    //   title: "Penjualan",
    //   icon: <BarChartIcon />,
    //   path: "/sales",
    //   submenu: [
    //     { title: "Sales Report", path: "/dashboard/sales", icon: <BarChartIcon /> },
    //     { title: "Analytics", path: "/dashboard/sales", icon: <TrendingUpIcon /> },
    //   ],
    // },
  ];

  const bottomMenuItems = [
    {
      key: "settings",
      title: "Settings",
      icon: <SettingsIcon />,
      path: "/settings",
    },
    {
      key: "logout",
      title: "Logout",
      icon: <LogoutIcon />,
      action: () => {
        localStorage.removeItem("token");
        navigate("/login");
      },
    },
  ];

  const handleNavigation = (item) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
      if (isMobile) {
        onClose();
        console.log("hello")
        
      }
    }
  };

  const drawerContent = (
    <Box
      sx={{
      height: "100vh", // pastikan tinggi sesuai viewport
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(45deg, #050163ff, #2c96c1ff)",
      color: "white",
      overflow: "hidden", // sembunyikan overflow horizontal
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: collapsed ? 1.5 : 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          minHeight: 80,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {!collapsed && (
          <Box sx={{ display:"flex",alignItems: "center", gap: 1.5 }}>
            <RestaurantMenuIcon id="topIconRestaurant" sx={{ fontSize: 36 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontFamily: '"Inter", sans-serif',
              }}
            >
              TCanteen
            </Typography>
          </Box>
        )}
        {collapsed}
        {!isMobile && (
          <IconButton
            onClick={handleToggleCollapse}
            sx={{
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Box>

      {/* User Profile */}
      <Box
        sx={{
          p: collapsed ? 1.5 : 2.5,
          display: "flex",
          flexDirection: collapsed ? "column" : "row",
          alignItems: "center",
          gap: collapsed ? 1 : 2,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Avatar
          sx={{
            width: collapsed ? 40 : 56,
            height: collapsed ? 40 : 56,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            fontSize: collapsed ? "1rem" : "1.5rem",
            fontWeight: 700,
            fontFamily: '"Inter", sans-serif',
          }}
        >
          A
        </Avatar>
        {!collapsed && (
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Admin User
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.8, fontSize: "0.75rem" }}
            >
              admin@tcanteen.com
            </Typography>
          </Box>
        )}
      </Box>

      {/* Main Menu Items */}
      <List sx={{ flex: 1, py: 2, px: 1 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.key}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  if (item.submenu) {
                    handleSubmenuToggle(item.key);
                  } else {
                    handleNavigation(item);
                  }
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: collapsed ? 1.5 : 2,
                  justifyContent: collapsed ? "center" : "flex-start",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "white",
                    minWidth: collapsed ? "auto" : 40,
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontSize: "0.95rem",
                        fontWeight: 500,
                      }}
                    />
                    {item.submenu &&
                      (openSubmenu[item.key] ? <ExpandLess /> : <ExpandMore />)}
                  </>
                )}
              </ListItemButton>
            </ListItem>

            {/* Submenu */}
            {item.submenu && !collapsed && (
              <Collapse in={openSubmenu[item.key]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((subItem) => (
                    <ListItem key={subItem.path} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => handleNavigation(subItem)}
                        sx={{
                          pl: 4,
                          py: 1,
                          borderRadius: 2,
                          mx: 1,
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: "white",
                            minWidth: 36,
                            opacity: 0.8,
                          }}
                        >
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={subItem.title}
                          primaryTypographyProps={{
                            fontSize: "0.85rem",
                            fontWeight: 400,
                            opacity: 0.9,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

      {/* Bottom Menu Items */}
      <List sx={{ py: 2, px: 1 }}>
        {bottomMenuItems.map((item) => (
          <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item)}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: collapsed ? 1.5 : 2,
                justifyContent: collapsed ? "center" : "flex-start",
                "&:hover": {
                  backgroundColor:
                    item.key === "logout"
                      ? "rgba(255, 82, 82, 0.2)"
                      : "rgba(255, 255, 255, 0.1)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <ListItemIcon
                sx={{
                  color: item.key === "logout" ? "#ff5252" : "white",
                  minWidth: collapsed ? "auto" : 40,
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    color: item.key === "logout" ? "#ff5252" : "white",
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: collapsed ? drawerWidthCollapsed : drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: collapsed ? drawerWidthCollapsed : drawerWidth,
          boxSizing: "border-box",
          border: "none",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}