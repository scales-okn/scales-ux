import React from "react";

import { Switch, Typography, Box } from "@mui/material";

import { useAuth } from "src/store/auth";

import { UserT } from "src/types/user";

import ModalContainer from "src/components/Modals/ModalContainer";

type EmailSettingsModalT = {
  visible: boolean;
  setVisible: (arg: boolean) => void;
  user: Omit<UserT, "password">;
};

const EmailSettingsModal = ({
  visible,
  setVisible,
  user,
}: EmailSettingsModalT) => {
  const { updateSessionUser } = useAuth();

  const isAdmin = user.role === "admin";

  const toggleItems = [
    ...(isAdmin
      ? [
          {
            value: user.notifyOnNewRingVersion,
            text: "New ring version (admin)",
            payload: { notifyOnNewRingVersion: !user.notifyOnNewRingVersion },
          },
        ]
      : []),
    {
      value: user.notifyOnConnectionRequest,
      text: "Received connection request",
      payload: { notifyOnConnectionRequest: !user.notifyOnConnectionRequest },
    },
    {
      value: user.notifyOnConnectionResponse,
      text: "Sent connection request approved / declined",
      payload: {
        notifyOnConnectionResponse: !user.notifyOnConnectionResponse,
      },
    },
    {
      value: user.notifyOnNewNotebook,
      text: "Notebook added to your team",
      payload: { notifyOnNewNotebook: !user.notifyOnNewNotebook },
    },
    {
      value: user.notifyOnSharedNotebook,
      text: "Notebook shared directly to you",
      payload: { notifyOnSharedNotebook: !user.notifyOnSharedNotebook },
    },
    {
      value: user.notifyOnTeamChange,
      text: "You've been added to or removed from a team",
      payload: { notifyOnTeamChange: !user.notifyOnTeamChange },
    },
    {
      value: user.notifyOnTeamNotebookDelete,
      text: "A team notebook has been deleted",
      payload: { notifyOnTeamNotebookDelete: !user.notifyOnTeamNotebookDelete },
    },
  ];

  return (
    <>
      <ModalContainer
        open={visible}
        onClose={() => setVisible(false)}
        paperStyles={{ maxWidth: "500px" }}
        title="Email Settings"
        subtitle="Choose which events you'd like to receive email notifications for. These settings can be updated at any time and changes will take effect immediately."
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "500", marginBottom: "18px" }}
        >
          Send notification on:
        </Typography>
        {toggleItems.map((item) => {
          return (
            <Box
              key={item.text}
              sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: "12px",
                marginLeft: "12px",
              }}
            >
              <Switch
                checked={item.value}
                onChange={() => updateSessionUser(user.id, item.payload)}
                color="primary"
                sx={{ marginRight: "6px" }}
              />
              <Typography sx={{ fontWeight: 600 }}>{item.text}</Typography>
            </Box>
          );
        })}
      </ModalContainer>
    </>
  );
};

export default EmailSettingsModal;
