import React from "react";
import { Box, Card, CardContent, Typography, Chip } from "@mui/material";
import { keyframes } from "@mui/system";

const scroll = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`;

const promoItems = [
  {
    id: 1,
    title: "Special Promo",
    description: "Get 20% off for all beverages",
    color: "#FF6B6B",
    icon: "🎉",
  },
  {
    id: 2,
    title: "Lunch Deal",
    description: "Buy 2 Get 1 Free every lunch time",
    color: "#4ECDC4",
    icon: "🍽️",
  },
  {
    id: 3,
    title: "New Menu",
    description: "Try our latest signature dishes",
    color: "#45B7D1",
    icon: "✨",
  },
  {
    id: 4,
    title: "Member Bonus",
    description: "Extra points for every purchase",
    color: "#FFA07A",
    icon: "🎁",
  },
  {
    id: 5,
    title: "Weekend Special",
    description: "Free delivery on weekends",
    color: "#98D8C8",
    icon: "🚀",
  },
];

export default function InfiniteCarousel() {
  // Duplicate items untuk seamless loop
  const duplicatedItems = [...promoItems, ...promoItems];

  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
        py: 4,
        backgroundColor: "background.default",
        position: "relative",
        "&::before, &::after": {
          content: '""',
          position: "absolute",
          top: 0,
          width: "100px",
          height: "100%",
          zIndex: 2,
          pointerEvents: "none",
        },
        "&::before": {
          left: 0,
          background:
            "linear-gradient(to right, rgba(236, 240, 247, 1), rgba(236, 240, 247, 0))",
        },
        "&::after": {
          right: 0,
          background:
            "linear-gradient(to left, rgba(236, 240, 247, 1), rgba(236, 240, 247, 0))",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 3,
          animation: `${scroll} 30s linear infinite`,
          width: "fit-content",
          "&:hover": {
            animationPlayState: "paused",
          },
        }}
      >
        {duplicatedItems.map((item, index) => (
          <Card
            key={`${item.id}-${index}`}
            elevation={3}
            sx={{
              minWidth: 320,
              maxWidth: 320,
              flexShrink: 0,
              background: `linear-gradient(135deg, ${item.color}22 0%, ${item.color}44 100%)`,
              border: `2px solid ${item.color}33`,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                p: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    fontSize: "2.5rem",
                    lineHeight: 1,
                  }}
                >
                  {item.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Chip
                    label="PROMO"
                    size="small"
                    sx={{
                      backgroundColor: item.color,
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      height: 20,
                      mb: 0.5,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      fontSize: "1.1rem",
                    }}
                  >
                    {item.title}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                {item.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}