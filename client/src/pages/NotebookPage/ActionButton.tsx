import React from "react";
import { Box, Tooltip } from "@mui/material";
import IosShareIcon from "@mui/icons-material/IosShare";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTheme } from "@mui/material/styles";

const ActionButton = ({ setOpen, tooltipTitle, type }) => {
  const theme = useTheme();

  const colors = {
    share: "info",
    copy: "success",
  };

  const icons = {
    share: <IosShareIcon color="info" sx={{ fontSize: "22px" }} />,
    copy: <ContentCopyIcon color="success" sx={{ fontSize: "22px" }} />,
  };

  return (
    <Tooltip title={tooltipTitle}>
      <Box
        sx={{
          border: `1px solid ${theme.palette[colors[type]].main}`,
          borderRadius: "4px",
          padding: "4px",
          height: "36px",
          width: "36px",
          marginRight: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: ".2s all",

          "&:hover": {
            border: `1px solid ${theme.palette[colors[type]].dark}`,
            background: "#60118e1a",
          },
        }}
        onClick={() => setOpen(true)}
      >
        {icons[type]}
      </Box>
    </Tooltip>
  );
};

export default ActionButton;
