import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Stack,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import logo from "../assets/logoTCanteenWhite.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    quickLinks: [
      { label: "Home", href: "/" },
      { label: "Menu", href: "/menu" },
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    services: [
      { label: "Online Order", href: "/order" },
      { label: "Catering", href: "/catering" },
      { label: "Reservation", href: "/reservation" },
      { label: "Gift Cards", href: "/gift-cards" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "FAQ", href: "/faq" },
    ],
  };

  const socialMedia = [
    { icon: <FacebookIcon />, href: "https://facebook.com", label: "Facebook" },
    {
      icon: <InstagramIcon />,
      href: "https://instagram.com",
      label: "Instagram",
    },
    { icon: <TwitterIcon />, href: "https://twitter.com", label: "Twitter" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: "#30468b",
        color: "white",
        pt: 4.5,
        pb: 3,
        mt: "auto",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={6}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  component="img"
                  src={logo}
                  alt="TCanteen Logo"
                  sx={{
                    height: 25,
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/")}
                />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  mb: 3,
                  opacity: 0.9,
                  lineHeight: 1.7,
                }}
              >
                Your favorite destination for delicious meals and refreshing
                beverages. We serve quality food with love and care.
              </Typography>

              {/* Social Media */}
              <Stack direction="row" spacing={1}>
                {socialMedia.map((social) => (
                  <IconButton
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "white",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        transform: "translateY(-3px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: "1rem",
              }}
            >
              Quick Links
            </Typography>
            <Stack spacing={1.5}>
              {footerLinks.quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  underline="none"
                  sx={{
                    color: "white",
                    opacity: 0.8,
                    fontSize: "0.9rem",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      opacity: 1,
                      paddingLeft: 1,
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: "1rem",
              }}
            >
              Services
            </Typography>
            <Stack spacing={1.5} sx={{width: "100px" }}>
              {footerLinks.services.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  underline="none"
                  sx={{
                    color: "white",
                    opacity: 0.8,
                    fontSize: "0.9rem",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      opacity: 1,
                      paddingLeft: 1,
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: "1rem",
              }}
            >
              Contact Us
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <LocationOnIcon sx={{ mr: 1, fontSize: 20, mt: 0.3 }} />
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.9, lineHeight: 1.6 }}
                >
                  Jl. Raya Kampus, Surabaya
                  <br />
                  East Java, Indonesia
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PhoneIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  +62 812-3456-7890
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <EmailIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  info@tcanteen.com
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider
          sx={{
            my: 4,
            borderColor: "rgba(255, 255, 255, 0.2)",
          }}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              opacity: 0.8,
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            © {currentYear} TCanteen. All rights reserved.
          </Typography>

          <Stack
            direction="row"
            spacing={3}
            sx={{
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {footerLinks.legal.map((link, index) => (
              <React.Fragment key={link.label}>
                <Link
                  href={link.href}
                  underline="none"
                  sx={{
                    color: "white",
                    opacity: 0.8,
                    fontSize: "0.85rem",
                    transition: "opacity 0.2s ease",
                    "&:hover": {
                      opacity: 1,
                    },
                  }}
                >
                  {link.label}
                </Link>
                {index < footerLinks.legal.length - 1 && (
                  <Typography
                    component="span"
                    sx={{ opacity: 0.5, display: { xs: "none", sm: "inline" } }}
                  >
                    |
                  </Typography>
                )}
              </React.Fragment>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
