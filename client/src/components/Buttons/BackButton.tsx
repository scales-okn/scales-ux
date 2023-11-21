import React, { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Typography } from "@mui/material";

const BackButton = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        color: "white",
        background: "var(--main-purple)",
        padding: "8px 16px 8px 8px",
        borderRadius: "0 4px 4px 0",
        position: "absolute",
        top: "80px",
        left: "0",
        opacity: "0.8",
        transition: "background 0.2s ease-in-out",
        width: "38px",
      }}
    >
      <ArrowBackIcon sx={{ fontSize: "22px" }} />
      <div style={{ marginLeft: "6px" }}></div>
    </Box>
  );
};

export default BackButton;
