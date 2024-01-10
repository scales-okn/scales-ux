import React, { useState, useEffect } from "react";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

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
        }}
        onClick={() => {
          setModalVisible(true);
        }}
      >
        <PersonAddIcon
          sx={{ marginRight: "12px", color: alert.viewed ? "grey" : "#b4b8bc" }}
        />
        <Box>
          <Typography fontSize={14} sx={{ whiteSpace: "nowrap" }}>
            Connection Request
          </Typography>
          <Typography fontSize={12} color="primary.main">
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
        onClick={() => {
          setModalVisible(true);
        }}
        sx={{
          minWidth: "180px",
          padding: "10px 20px",
          transition: " 0.2s ease-in-out",
          margin: "6px 0",
          fontSize: "18px",
          display: "flex",
          alignItems: "center",

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
