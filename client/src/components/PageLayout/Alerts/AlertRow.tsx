import React, { useState } from "react";

import { Box, Typography, Button } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import GroupRemoveIcon from "@mui/icons-material/GroupRemove";
import PostAddIcon from "@mui/icons-material/PostAdd";
import DataSaverOffIcon from "@mui/icons-material/DataSaverOff";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MobileScreenShareIcon from "@mui/icons-material/MobileScreenShare";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";

import { useAlert } from "src/store/alerts";

import colorVars from "src/styles/colorVars";

const AlertRow = ({ alert, setModalAlert }) => {
  const { deleteAlert } = useAlert();

  const [isHovered, setIsHovered] = useState(false);

  const alertTemplate = ({ title, targetName, iconUnviewed }) => {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          cursor: "pointer",
        }}
        onClick={() => {
          setModalAlert(alert);
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
      targetName: (
        <span>
          {alert.initiatorUser.firstName} {alert.initiatorUser.lastName}
        </span>
      ),
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
      title: <span>New notebook added to team:</span>,
      targetName: <span>{alert.team?.name}</span>,
    }),
    ringUpdated: alertTemplate({
      iconUnviewed: <DataSaverOffIcon color="primary" />,
      title: <span>Ring Updated:</span>,
      targetName: <span>{alert.ringLabel}</span>,
    }),
    connectResponse: alertTemplate({
      iconUnviewed: <PeopleAltIcon color="primary" />,
      title: <span>Response to connection request from:</span>,
      targetName: (
        <span>
          {alert.initiatorUser.firstName} {alert.initiatorUser.lastName}
        </span>
      ),
    }),
    notebookShared: alertTemplate({
      iconUnviewed: <MobileScreenShareIcon color="primary" />,
      title: <span>New notebook shared with you from:</span>,
      targetName: (
        <span>
          {alert.initiatorUser.firstName} {alert.initiatorUser.lastName}
        </span>
      ),
    }),
    notebookRemovedFromTeam: alertTemplate({
      iconUnviewed: <PlaylistRemoveIcon color="primary" />,
      title: <span>Notebook removed from team:</span>,
      targetName: <span>{alert.deletedNotebookName}</span>,
    }),
  };

  return (
    <>
      <Box
        sx={{
          minWidth: "180px",
          width: "100%",
          padding: "10px 20px",
          transition: " 0.2s ease-in-out",
          margin: "6px 0",
          fontSize: "18px",
          display: "flex",
          alignItems: "center",
          cursor: "default",

          "&:hover": {
            background: colorVars.mainPurpleLightest,
          },
        }}
      >
        {alertItems[alert.type]}
      </Box>
    </>
  );
};

export default AlertRow;
