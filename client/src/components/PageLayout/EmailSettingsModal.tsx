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

  return (
    <>
      <ModalContainer
        open={visible}
        onClose={() => setVisible(false)}
        paperStyles={{ maxWidth: "500px" }}
        title="Email Settings"
      >
        <Box
          sx={{ display: "flex", alignItems: "center", marginBottom: "30px" }}
        >
          <Switch
            checked={user.notifyOnNewRingVersion}
            onChange={() =>
              updateSessionUser(user.id, {
                notifyOnNewRingVersion: !user.notifyOnNewRingVersion,
              })
            }
            color="primary"
            sx={{ marginRight: "6px" }}
          />
          <Typography>Notify on New Ring Version</Typography>
        </Box>
      </ModalContainer>
    </>
  );
};

export default EmailSettingsModal;
