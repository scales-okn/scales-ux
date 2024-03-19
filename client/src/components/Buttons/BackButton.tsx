import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, useTheme } from "@mui/material";

const BackButton = ({ onClick }) => {
  const theme = useTheme();
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        color: "white",
        background: theme.palette.info.dark,
        padding: "8px",
        borderRadius: "0 4px 4px 0",
        position: "absolute",
        top: "80px",
        left: "0",
        opacity: "0.8",
        transition: "background 0.2s ease-in-out",
      }}
    >
      <ArrowBackIcon sx={{ fontSize: "22px" }} />
    </Box>
  );
};

export default BackButton;
