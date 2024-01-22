import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { sessionUserSelector } from "src/store/auth";
import { useAlert } from "src/store/alerts";
import { useSessionUser } from "src/store/auth";

import NotificationsIcon from "@mui/icons-material/Notifications";
import { Box } from "@mui/material";
import Popover from "@mui/material/Popover";
import { useTheme } from "@mui/material/styles";

import AlertRow from "./AlertRow";

const NotificationsBell = () => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  const theme = useTheme();
  const location = useLocation();

  const { alerts, fetchAlerts } = useAlert();
  const sessionUser = useSessionUser();

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

  const open = Boolean(anchorEl);

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
                background: "var(--main-purple-lightest)",
              },
            },
          }}
        >
          {alerts.length ? (
            alerts.map((alert) => {
              return <AlertRow alert={alert} key={alert.id} />;
            })
          ) : (
            <Box sx={{ padding: "20px" }}>No New Notifications</Box>
          )}
        </Popover>
      )}
    </Box>
  ) : null;
};

export default NotificationsBell;
