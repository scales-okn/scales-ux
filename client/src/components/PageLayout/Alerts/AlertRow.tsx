import React, { useState } from "react";

import { Box, Typography, Button } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import GroupRemoveIcon from "@mui/icons-material/GroupRemove";
import PostAddIcon from "@mui/icons-material/PostAdd";

import { useAlert } from "src/store/alerts";

import ConnectModal from "./ConnectModal";
import TeamModal from "./TeamModal";
import NewTeamNotebookModal from "./NewTeamNotebookModal";

const NotificationsBell = ({ alert }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { deleteAlert } = useAlert();

  const [isHovered, setIsHovered] = useState(false);

  const modals = {
    connect: (
      <ConnectModal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        alert={alert}
      />
    ),
    addedToTeam: (
      <TeamModal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        alert={alert}
        added={true}
      />
    ),
    removedFromTeam: (
      <TeamModal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        alert={alert}
        added={false}
      />
    ),
    notebookAddedToTeam: (
      <NewTeamNotebookModal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        alert={alert}
      />
    ),
  };

  const alertTemplate = ({ title, targetName, iconUnviewed }) => {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => {
          setModalVisible(true);
        }}
      >
        <Box
          sx={{ marginRight: "12px" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {alert.viewed ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                deleteAlert(alert.id);
              }}
              sx={{
                minWidth: "unset",
                padding: "2px",
                borderRadius: "24px",
                marginLeft: "-4px",
              }}
            >
              {isHovered ? (
                <DeleteOutlineIcon sx={{ color: "#d24444" }} />
              ) : (
                <CheckCircleOutlineIcon sx={{ color: "GrayText" }} />
              )}
            </Button>
          ) : (
            iconUnviewed
          )}
        </Box>
        <Box>
          <Typography
            fontSize={14}
            sx={{
              whiteSpace: "nowrap",
              color: alert.viewed ? "grey" : "black",
            }}
          >
            {title}
          </Typography>
          <Typography
            fontSize={12}
            color={alert.viewed ? "primary.light" : "primary.main"}
          >
            {targetName}
          </Typography>
        </Box>
      </Box>
    );
  };

  const alertItems = {
    connect: alertTemplate({
      iconUnviewed: <PersonAddIcon color="primary" />,
      title: "Connection Request",
      targetName: alert.initiatorUser.firstName + alert.initiatorUser.lastName,
    }),
    addedToTeam: alertTemplate({
      iconUnviewed: <GroupAddIcon color="primary" />,
      title: (
        <span>
          {alert.initiatorUser.firstName} {alert.initiatorUser.lastName} added
          you to a team:
        </span>
      ),
      targetName: <span>{alert.team?.name}</span>,
    }),
    removedFromTeam: alertTemplate({
      iconUnviewed: <GroupRemoveIcon color="primary" />,
      title: <span>You have been removed from a team:</span>,
      targetName: <span>{alert.team?.name}</span>,
    }),
    notebookAddedToTeam: alertTemplate({
      iconUnviewed: <PostAddIcon color="primary" />,
      title: <span>New Notebook add to team:</span>,
      targetName: <span>{alert.team?.name}</span>,
    }),
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
