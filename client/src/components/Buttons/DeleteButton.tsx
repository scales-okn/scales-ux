import React from "react";
import { Button } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

type DeleteButtonT = {
  onClick: () => void;
  disabled?: boolean;
  sx?: Record<string, unknown>;
  variant?: "text" | "outlined" | "contained";
};

const DeleteButton = ({
  onClick,
  disabled,
  sx,
  variant = "contained",
}: DeleteButtonT) => {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      sx={{ marginRight: "12px", minWidth: 0, width: "36px", ...sx }}
      color="error"
    >
      <ClearIcon />
    </Button>
  );
};

export default DeleteButton;
