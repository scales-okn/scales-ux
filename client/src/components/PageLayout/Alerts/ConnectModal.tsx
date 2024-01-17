import React from "react";
import { Button, Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAlert, AlertT } from "src/store/alerts";
import { useConnection } from "src/store/connection";
import ModalContainer from "src/components/Modals/ModalContainer";

type ConnectModalT = {
  open: boolean;
  onClose: () => void;
  alert: AlertT;
};

const ConnectModal = ({ open, onClose, alert }: ConnectModalT) => {
  const theme = useTheme();
  const { updateAlert } = useAlert();
  const { updateConnection } = useConnection();

  const handleResponse = (approved) => {
    updateConnection(alert.connectionId, {
      approved,
    });
    setTimeout(() => {
      updateAlert(alert.id, { viewed: "true" });
    }, 100);
    onClose();
  };

  return (
    <ModalContainer
      open={open}
      onClose={onClose}
      paperStyles={{ maxWidth: "500px", paddingBottom: "40px" }}
    >
      <Typography
        sx={{
          fontSize: "32px",
          textAlign: "center",
          color: theme.palette.primary.main,
        }}
      >
        New Connection Request
      </Typography>
      <Box
        sx={{
          width: "90%",
          height: "2px",
          background: "#e0e0e0",
          margin: "0 auto",
          marginTop: "22px",
        }}
      />
      <Typography
        sx={{
          fontSize: "14px",
          marginBottom: "12px",
          marginTop: "48px",
          textAlign: "center",
          color: "GrayText",
        }}
      >
        You have a new connection request from:
      </Typography>
      <Typography
        sx={{
          fontSize: "18px",
          textAlign: "center",
          marginBottom: "12px",
          color: theme.palette.primary.main,
        }}
      >
        {alert.initiatorUser.firstName} {alert.initiatorUser.lastName}
      </Typography>
      {alert.connection?.note ? (
        <Typography
          sx={{
            fontSize: "18px",
            textAlign: "center",
            marginTop: "24px",
            marginBottom: "24px",
            color: "GrayText",
          }}
        >
          {'"'}
          {alert.connection.note}
          {'"'}
        </Typography>
      ) : null}
      <Typography
        sx={{
          fontSize: "14px",
          marginBottom: "56px",
          textAlign: "center",
          color: "GrayText",
        }}
      >
        Would you like to accept this request?
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          marginBottom: "48px",
          width: "50%",
          margin: "0 auto",
        }}
      >
        <Button variant="outlined" onClick={() => handleResponse(false)}>
          Decline
        </Button>
        <Button variant="contained" onClick={() => handleResponse(true)}>
          Accept
        </Button>
      </Box>
    </ModalContainer>
  );
};

export default ConnectModal;
