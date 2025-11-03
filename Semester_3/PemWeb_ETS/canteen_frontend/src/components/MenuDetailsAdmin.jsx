import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Paper,
  Fade,
  alpha,
} from "@mui/material";
import {
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  CloudUpload as UploadIcon,
  Edit as EditIcon,
  AddCircle as AddIcon,
} from "@mui/icons-material";
import api from "../../services/api";

export default function OrderDetailDialog({ open, onClose, item, onSaved }) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    stock:"",
    description: "",
    file: null,
  });
  const [isEdit, setIsEdit] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);

  // isi data ke form saat item berubah
  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        name: item.name,
        price: item.price,
        stock:item.stock,
        description: item.description || "",
        file: null,
      });
      setPreviewImage(item.image_url || "");
      setIsEdit(true);
    } else {
      setFormData({ id: "", name: "", price: "", description: "", file: null });
      setPreviewImage("");
      setIsEdit(false);
    }
  }, [item]);

  const handleSubmitMenu = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (isEdit) {
        await api.patch(
          `admin/menus/${formData.id}`,
          {
            name: formData.name,
            price: formData.price,
            description: formData.description,
            stock:formData.stock
          },
          {
            headers: {
              Authorization: `bearer ${token}`,
            },
          }
        );
      } else {
        await api.post(
          `/menus`,
          {
            name: formData.name,
            price: formData.price,
            description: formData.description,
          },
          {
            headers: {
              Authorization: `bearer ${token}`,
            },
          }
        );
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data menu");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async () => {
    if (!formData.file || !formData.id) {
      alert("Pilih file dulu atau pastikan menu sudah tersimpan.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("image", formData.file);

      const res = await api.post(`admin/menus/${formData.id}`, data, {
        headers: {
          Authorization: `bearer ${token}`,
        },
      });

      setPreviewImage(res.data.data.image_url);
      alert("Gambar berhasil diunggah!");
      if (onSaved) onSaved();
    } catch (err) {
      console.error(err);
      alert("Gagal mengunggah gambar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
          boxShadow: "0 20px 60px rgba(5, 1, 99, 0.15)",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #050163ff 0%, #2c96c1ff 100%)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2.5,
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {isEdit ? (
            <EditIcon sx={{ fontSize: 28 }} />
          ) : (
            <AddIcon sx={{ fontSize: 28 }} />
          )}
          <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
            {isEdit ? "Edit Menu" : "Tambah Menu"}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "white",
            "&:hover": {
              background: alpha("#ffffff", 0.2),
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
          <TextField
            label="Nama Menu"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.3s",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(5, 1, 99, 0.1)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 16px rgba(44, 150, 193, 0.2)",
                },
              },
            }}
          />

          <TextField
            label="Price"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MoneyIcon sx={{ color: "#2c96c1ff" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.3s",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(5, 1, 99, 0.1)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 16px rgba(44, 150, 193, 0.2)",
                },
              },
            }}
          />

          <TextField
            label="Stock"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MoneyIcon sx={{ color: "#2c96c1ff" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.3s",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(5, 1, 99, 0.1)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 16px rgba(44, 150, 193, 0.2)",
                },
              },
            }}
          />

          <TextField
            label="Deskripsi"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment
                  position="start"
                  sx={{ alignSelf: "flex-start", mt: 1.5 }}
                >
                  <DescriptionIcon sx={{ color: "#2c96c1ff" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.3s",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(5, 1, 99, 0.1)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 16px rgba(44, 150, 193, 0.2)",
                },
              },
            }}
          />

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              background: "linear-gradient(135deg, #f0f4ff 0%, #e8f4f8 100%)",
              border: "2px dashed #2c96c1ff",
              transition: "all 0.3s",
              "&:hover": {
                borderColor: "#050163ff",
                boxShadow: "0 4px 16px rgba(5, 1, 99, 0.1)",
              },
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                mb: 2,
                color: "#050163ff",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <UploadIcon /> Upload Gambar Menu
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                sx={{
                  borderRadius: 2,
                  borderColor: "#2c96c1ff",
                  color: "#2c96c1ff",
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "#050163ff",
                    background: alpha("#050163ff", 0.05),
                  },
                }}
              >
                Choose File
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, file: e.target.files[0] })
                  }
                />
              </Button>

              <Typography variant="body2" sx={{ color: "#666", flex: 1 }}>
                {formData.file ? formData.file.name : "Belum ada file dipilih"}
              </Typography>

              <Button
                variant="contained"
                onClick={handleUploadImage}
                disabled={loading || !formData.file || !formData.id}
                startIcon={<UploadIcon />}
                sx={{
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #050163ff 0%, #2c96c1ff 100%)",
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(5, 1, 99, 0.3)",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(5, 1, 99, 0.4)",
                  },
                  "&:disabled": {
                    background: "#ccc",
                  },
                }}
              >
                Upload
              </Button>
            </Box>

            {previewImage && (
              <Fade in={true}>
                <Box
                  component="img"
                  src={previewImage}
                  alt="Preview"
                  sx={{
                    width: "100%",
                    height: 220,
                    objectFit: "cover",
                    borderRadius: 2,
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                    border: "3px solid white",
                  }}
                />
              </Fade>
            )}
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          background: alpha("#f8f9ff", 0.5),
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            borderColor: "#ccc",
            color: "#666",
            fontWeight: 600,
            "&:hover": {
              borderColor: "#999",
              background: alpha("#000", 0.02),
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmitMenu}
          variant="contained"
          disabled={loading}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1,
            background: "linear-gradient(135deg, #050163ff 0%, #2c96c1ff 100%)",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(5, 1, 99, 0.3)",
            "&:hover": {
              boxShadow: "0 6px 20px rgba(5, 1, 99, 0.4)",
              transform: "translateY(-1px)",
            },
            "&:disabled": {
              background: "#ccc",
            },
            transition: "all 0.3s",
          }}
        >
          {loading ? "Saving..." : isEdit ? "Update Menu" : "Add Menu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
