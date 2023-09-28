import React from "react";
import { Button, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

type DownloadButtonT = {
  onClick: () => void;
  disabled?: boolean;
  sx?: Record<string, unknown>;
  variant?: "text" | "outlined" | "contained";
};

const DownloadButton = ({
  onClick,
  disabled,
  sx,
  variant = "contained",
}: DownloadButtonT) => {
  return (
    <Tooltip title="Download CSV">
      <Button
        variant={variant}
        onClick={onClick}
        disabled={disabled}
        sx={{ minWidth: 0, width: "36px", ...sx }}
        color="secondary"
      >
        <DownloadIcon />
      </Button>
    </Tooltip>
  );
};

export default DownloadButton;
