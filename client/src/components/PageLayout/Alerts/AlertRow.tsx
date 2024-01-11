import React, { useState } from "react";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";

import { Box, Typography } from "@mui/material";
import ConnectModal from "./ConnectModal";

const NotificationsBell = ({ alert }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const modals = {
    connect: (
      <ConnectModal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        alert={alert}
      />
    ),
  };

  const alertItems = {
    connect: (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: alert.viewed ? "default" : "pointer",
        }}
        onClick={() => {
          if (!alert.viewed) {
            setModalVisible(true);
          }
        }}
      >
        {alert.viewed ? (
          <Box sx={{ marginRight: "12px" }}>
            {alert.connection.approved ? (
              <ThumbUpOffAltIcon color="success" />
            ) : (
              <ThumbDownOffAltIcon color="error" />
            )}
          </Box>
        ) : (
          <PersonAddIcon
            sx={{
              marginRight: "12px",
              color: alert.viewed ? "grey" : "#006edb",
            }}
          />
        )}
        <Box>
          <Typography
            fontSize={14}
            sx={{
              whiteSpace: "nowrap",
              color: alert.viewed ? "grey" : "black",
            }}
          >
            Connection Request
          </Typography>
          <Typography
            fontSize={12}
            color={alert.viewed ? "primary.light" : "primary.main"}
          >
            {alert.initiatorUser.firstName}
            {alert.initiatorUser.lastName}
          </Typography>
        </Box>
      </Box>
    ),
  };

  return (
    <>
      <Box
        sx={{
          minWidth: "180px",
          padding: "10px 20px",
          transition: " 0.2s ease-in-out",
          margin: "6px 0",
          fontSize: "18px",
          display: "flex",
          alignItems: "center",
          cursor: "default",

          "&:hover": {
            background: "var(--main-purple-lightest)",
          },
        }}
      >
        {alertItems[alert.type]}
      </Box>
      {modalVisible ? modals[alert.type] : null}
    </>
  );
};

export default NotificationsBell;
