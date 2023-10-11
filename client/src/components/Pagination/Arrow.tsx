import React from "react";

import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

type DirectionT = "left" | "right";

type ArrowT = {
  direction: DirectionT;
  handleNavigate: (arg: DirectionT) => void;
  disabled: boolean;
};

const Arrow = ({ direction, handleNavigate, disabled }: ArrowT) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        borderRadius: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: theme.palette.info.light,
        color: "white",
        cursor: disabled ? "not-allowed" : "pointer",
        marginRight: direction === "left" ? "12px" : "0",
        marginLeft: direction === "right" ? "12px" : "0",
      }}
      onClick={() => handleNavigate(direction)}
    >
      {direction === "left" ? (
        <KeyboardArrowLeftIcon />
      ) : (
        <KeyboardArrowRightIcon />
      )}
    </Box>
  );
};

export default Arrow;
