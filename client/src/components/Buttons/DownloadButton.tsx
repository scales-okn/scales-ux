import React from "react";
import { Button, Tooltip, CircularProgress } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

type DownloadButtonT = {
  onClick: () => void;
  disabled?: boolean;
  downloading?: boolean;
  sx?: Record<string, unknown>;
  variant?: "text" | "outlined" | "contained";
};

const DownloadButton = ({
  onClick,
  disabled,
  downloading,
  sx,
  variant = "contained",
}: DownloadButtonT) => {
  return (
    <Tooltip title="Download CSV">
      <Button
        variant={variant}
        onClick={onClick}
        disabled={disabled || downloading}
        sx={{ minWidth: 0, width: "36px", ...sx }}
        color="secondary"
      >
        {downloading ?
          <CircularProgress
            size={20}
            sx={{
              color: "secondary",
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-10px',
              marginLeft: '-10px',
            }}
          /> : <DownloadIcon />}
      </Button>
    </Tooltip>
  );
};

export default DownloadButton;
