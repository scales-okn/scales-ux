import React from "react";
import { Button, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { ConnectionT, useConnection } from "src/store/connection";
import { useSessionUser } from "src/store/auth";

import ModalContainer from "src/components/Modals/ModalContainer";

type UpdateConnectionModalT = {
  connectionDetail: ConnectionT | null;
  setConnectionDetail: (arg: null) => void;
};

const UpdateConnectionModal = ({
  connectionDetail,
  setConnectionDetail,
}: UpdateConnectionModalT) => {
  const { updateConnection, deleteConnection } = useConnection();
  const { id: sessionUserId } = useSessionUser();
  const theme = useTheme();

  const pendingConnection = connectionDetail?.pending;
  const acceptedConnection = connectionDetail?.approved;
  const theyDeclinedConnection =
    !acceptedConnection &&
    !pendingConnection &&
    connectionDetail?.senderUser?.id === sessionUserId;

  const onClose = () => {
    setConnectionDetail(null);
  };

  const updateButton = () => {
    if (pendingConnection) {
      return (
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            deleteConnection(connectionDetail?.id);
            onClose();
          }}
        >
          Cancel Request
        </Button>
      );
    }
    if (acceptedConnection) {
      return (
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            deleteConnection(connectionDetail?.id);
            onClose();
          }}
        >
          Remove Connection
        </Button>
      );
    }
    if (theyDeclinedConnection) {
      return null;
    }
    return (
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          updateConnection(connectionDetail?.id, { approved: true });
          onClose();
        }}
      >
        Accept Request
      </Button>
    );
  };

  const headerText = () => {
    if (pendingConnection) {
      return "Request Pending. You can cancel the request.";
    }
    if (acceptedConnection) {
      return "Connection Accepted. You can remove it if you'd no longer like to be connected to this person.";
    }
    if (theyDeclinedConnection) {
      return "This connection was declined. The receiving user can change their response at any time.";
    }
    return "You declined this connection request. You can change your response.";
  };

  return (
    <ModalContainer
      open={!!connectionDetail}
      onClose={onClose}
      paperStyles={{ width: "500px" }}
    >
      <Typography
        sx={{
          fontSize: "32px",
          textAlign: "center",
          color: theme.palette.primary.main,
          marginBottom: "36px",
        }}
      >
        Update Connection
      </Typography>
      <Typography
        sx={{
          fontSize: "16px",
          marginBottom: "48px",
          textAlign: "center",
          color: "GrayText",
        }}
      >
        {headerText()}
      </Typography>
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {connectionDetail ? updateButton() : null}
      </Box>
    </ModalContainer>
  );
};

export default UpdateConnectionModal;
