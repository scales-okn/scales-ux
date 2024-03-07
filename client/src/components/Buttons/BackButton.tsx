import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box } from "@mui/material";
import colorVars from "src/styles/colorVars";

const BackButton = ({ onClick }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        color: "white",
        background: colorVars.mainPurple,
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
