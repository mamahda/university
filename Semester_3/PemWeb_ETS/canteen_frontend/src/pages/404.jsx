import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Stack,
  useTheme,
} from "@mui/material";
import NotListedLocationIcon from "@mui/icons-material/NotListedLocation";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // background: "linear-gradient(45deg, #050163ff, #2c96c1ff)",
        bgColor:"white",
        fontFamily:"Inter, sans-serif",
        p: 3,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Stack spacing={3} alignItems="center">
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(45deg, #050163ff, #2c96c1ff)",
                color: "white",
                boxShadow: 3,
                fontSize: 48,
              }}
              aria-hidden
            >
              <NotListedLocationIcon sx={{ fontSize: 56 }} />
            </Box>

            <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
              404 — Page Not Found
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 680 }}
            >
              Sorry, the page you're looking for isn't available or may have
              moved. Check the URL or return to the homepage to continue.
            </Typography>

            {/* Illustration (simple SVG) */}
            <Box
              sx={{
                width: "100%",
                maxWidth: 560,
                mt: 1,
                mb: 1,
                mx: "auto",
              }}
              aria-hidden
            ></Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                onClick={() => navigate("/")}
                sx={{ px: 3 }}
              >
                Back To Home
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{ px: 3 }}
              >
                Back
              </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Jika masalah berlanjut, hubungi tim dukungan.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
