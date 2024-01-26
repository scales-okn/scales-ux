import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";

import { sessionUserSelector } from "src/store/auth";
import { useAlert } from "src/store/alerts";
import { useSessionUser } from "src/store/auth";

import NotificationsIcon from "@mui/icons-material/Notifications";
import { Box } from "@mui/material";
import Popover from "@mui/material/Popover";
import { useTheme } from "@mui/material/styles";

import ConnectModal from "./ConnectModal";
import TeamModal from "./TeamModal";
import NewTeamNotebookModal from "./NewTeamNotebookModal";

import AlertRow from "./AlertRow";

const NotificationsBell = () => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const open = Boolean(anchorEl);
  const [modalAlert, setModalAlert] = useState(null);
  console.log("🚀 ~ NotificationsBell ~ modalAlert:", modalAlert);

  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const search = queryString.parse(location.search);

  const { alerts, fetchAlerts } = useAlert();
  const sessionUser = useSessionUser();

  useEffect(() => {
    const triggerAlert = alerts.find(
      (alert) => alert.connection?.id?.toString() === search.connectionId,
    );
    if (triggerAlert) {
      setModalAlert(triggerAlert);
    }
  }, [search.connectionId, alerts]);

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

  const modals = {
    connect: (
      <ConnectModal
        open={!!modalAlert}
        onClose={() => {
          delete search.connectionId;
          navigate({
            search: queryString.stringify(search),
          });
          setModalAlert(null);
        }}
        alert={modalAlert}
      />
    ),
    addedToTeam: (
      <TeamModal
        open={!!modalAlert}
        onClose={() => setModalAlert(null)}
        alert={modalAlert}
        added={true}
      />
    ),
    removedFromTeam: (
      <TeamModal
        open={!!modalAlert}
        onClose={() => setModalAlert(null)}
        alert={modalAlert}
        added={false}
      />
    ),
    notebookAddedToTeam: (
      <NewTeamNotebookModal
        open={!!modalAlert}
        onClose={() => setModalAlert(null)}
        alert={modalAlert}
      />
    ),
  };

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
              return (
                <AlertRow
                  alert={alert}
                  key={alert.id}
                  setModalAlert={setModalAlert}
                />
              );
            })
          ) : (
            <Box sx={{ padding: "20px" }}>No New Notifications</Box>
          )}
        </Popover>
      )}
      {modalAlert ? modals[modalAlert?.type] : null}
    </Box>
  ) : null;
};

export default NotificationsBell;
