import React from "react";

import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

type DirectionT = "left" | "right";

type ArrowT = {
  direction: DirectionT;
  handleNavigate: (direction: DirectionT, pageOverride: number) => void;
  disabled: boolean;
  pageOverride?: number;
};

const Arrow = ({
  direction,
  handleNavigate,
  disabled,
  pageOverride = null,
}: ArrowT) => {
  const theme = useTheme();

  const leftElement =
    pageOverride === null ? (
      <KeyboardArrowLeftIcon />
    ) : (
      <KeyboardDoubleArrowLeftIcon />
    );

  const rightElement =
    pageOverride === null ? (
      <KeyboardArrowRightIcon />
    ) : (
      <KeyboardDoubleArrowRightIcon />
    );

  return (
    <Box
      sx={{
        minWidth: "32px",
        height: "32px",
        borderRadius: "8px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: theme.palette.primary.main,
        color: "white",
        cursor: disabled ? "not-allowed" : "pointer",
        marginRight: direction === "left" ? "6px" : "0",
        marginLeft: direction === "right" ? "6px" : "0",

        "&:hover": {
          background: disabled
            ? theme.palette.primary.main
            : theme.palette.primary.dark,
        },
      }}
      onClick={() => handleNavigate(direction, pageOverride)}
    >
      {direction === "left" ? leftElement : rightElement}
    </Box>
  );
};

export default Arrow;
