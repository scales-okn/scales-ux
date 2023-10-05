import React from "react";
import { Button, Tooltip } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

type DeleteButtonT = {
  onClick: () => void;
  disabled?: boolean;
  sx?: Record<string, unknown>;
  variant?: "text" | "outlined" | "contained";
  titleAddon?: string;
};

const DeleteButton = ({
  onClick,
  disabled,
  sx,
  variant = "contained",
  titleAddon = "",
}: DeleteButtonT) => {
  return (
    <Tooltip title={`Delete ${titleAddon}`}>
      <Button
        variant={variant}
        onClick={onClick}
        disabled={disabled}
        sx={{ minWidth: 0, width: "36px", ...sx }}
        color="error"
      >
        <ClearIcon />
      </Button>
    </Tooltip>
  );
};

export default DeleteButton;
