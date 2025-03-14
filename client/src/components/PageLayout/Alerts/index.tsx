import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import queryString from "query-string";

import { sessionUserSelector } from "src/store/auth";
import { useAlert } from "src/store/alerts";
import { useSessionUser } from "src/store/auth";

import NotificationsIcon from "@mui/icons-material/Notifications";
import { Box, Button, Typography, useTheme, Popover } from "@mui/material";

import AlertRow from "./AlertRow";
import ModalAlertElement from "./modals";

const NotificationsBell = () => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const open = Boolean(anchorEl);
  const [modalAlert, setModalAlert] = useState(null);
  const [clearActive, setClearActive] = useState(null);

  const theme = useTheme();
  const location = useLocation();
  const search = queryString.parse(location.search);

  const { alerts, fetchAlerts, deleteAllAlerts } = useAlert();
  const sessionUser = useSessionUser();

  useEffect(() => {
    const { connectionId } = search;
    const triggerAlert = alerts.find(
      (alert) => alert.connection?.id?.toString() === search.connectionId,
    );
    if (triggerAlert && connectionId) {
      setModalAlert(triggerAlert);
    }
  }, [search.connectionId, alerts]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setAnchorEl(null);
  }, [location.pathname]);

  useEffect(() => {
    if (sessionUser?.id) {
      fetchAlerts();
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const user = useSelector(sessionUserSelector);

  const unreadAlerts = alerts?.filter((alert) => !alert.viewed)?.length;

  return user ? (
    <Box sx={{ marginRight: "16px", cursor: "pointer" }}>
      <Box
        className="icon"
        onClick={handleClick}
        sx={{
          height: "50px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <NotificationsIcon
          sx={{ color: unreadAlerts ? theme.palette.warning.light : "white" }}
        />
      </Box>
      {open && (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          container={anchorEl}
          disableEnforceFocus
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          sx={{
            "& .item": {
              minWidth: "180px",
              padding: "10px 10px 10px 20px",
              transition: " 0.2s ease-in-out",
              margin: "6px 0",
              fontSize: "18px",

              "&:hover": {
                background: theme.palette.info.light,
              },
            },
          }}
        >
          {alerts.length ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {alerts.map((alert) => {
                return (
                  <AlertRow
                    alert={alert}
                    key={alert.id}
                    setModalAlert={setModalAlert}
                  />
                );
              })}
              <Button
                sx={{
                  marginTop: "12px",
                  marginBottom: "6px",
                  width: "calc(100% - 24px)",
                }}
                onClick={() => {
                  if (clearActive) {
                    setClearActive(false);
                    deleteAllAlerts();
                  } else {
                    setClearActive(true);
                  }
                }}
              >
                {clearActive ? (
                  <Box>
                    <Typography sx={{ fontWeight: "300", fontSize: "12px" }}>
                      Click to Confirm
                    </Typography>
                    <Typography sx={{ fontWeight: "600", fontSize: "14px" }}>
                      Clear All
                    </Typography>
                  </Box>
                ) : (
                  "Clear All"
                )}
              </Button>
            </Box>
          ) : (
            <Box sx={{ padding: "20px", cursor: "default" }}>
              No New Notifications
            </Box>
          )}
        </Popover>
      )}
      <ModalAlertElement
        modalAlert={modalAlert}
        setModalAlert={setModalAlert}
      />
    </Box>
  ) : null;
};

export default NotificationsBell;
