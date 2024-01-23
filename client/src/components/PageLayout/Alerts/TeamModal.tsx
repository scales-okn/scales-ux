import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAlert, AlertT } from "src/store/alerts";
import ModalContainer from "src/components/Modals/ModalContainer";

type ConnectModalT = {
  open: boolean;
  onClose: () => void;
  alert: AlertT;
  added: boolean;
};

const ConnectModal = ({ open, onClose, alert, added }: ConnectModalT) => {
  const theme = useTheme();
  const { updateAlert } = useAlert();

  useEffect(() => {
    if (open) {
      updateAlert(alert.id, { viewed: "true" });
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

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
        {added ? "Added to Team" : "Removed from Team"}
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
        {added
          ? "You have been added to the team:"
          : "You have been removed from the team:"}
      </Typography>
      <Typography
        sx={{
          fontSize: "18px",
          textAlign: "center",
          marginBottom: "12px",
          color: theme.palette.primary.main,
        }}
      >
        {alert.team.name}
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
          {alert.connection.note}
        </Typography>
      ) : null}
      <Typography
        sx={{
          fontSize: "14px",
          marginBottom: "36px",
          textAlign: "center",
          color: "GrayText",
        }}
      >
        {added ? (
          <Typography>
            To view this team, <Link to={`/connections/teams`}>click here</Link>
          </Typography>
        ) : (
          "If you believe this is an error, please contact a team administrator."
        )}
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
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </Box>
    </ModalContainer>
  );
};

export default ConnectModal;
