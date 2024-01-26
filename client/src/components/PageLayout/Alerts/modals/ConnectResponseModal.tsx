import React from "react";
import { Link } from "react-router-dom";
import { Typography, Box } from "@mui/material";
import { useEffectOnce } from "react-use";
import { useTheme } from "@mui/material/styles";
import { useAlert, AlertT } from "src/store/alerts";
import ModalContainer from "src/components/Modals/ModalContainer";

type ConnectResponseModalT = {
  open: boolean;
  onClose: () => void;
  alert: AlertT;
};

const ConnectResponseModal = ({
  open,
  onClose,
  alert,
}: ConnectResponseModalT) => {
  const theme = useTheme();
  const { updateAlert } = useAlert();

  useEffectOnce(() => {
    updateAlert(alert.id, { viewed: "true" });
  });

  const connectionApproved = alert.connection?.approved;
  const actionVerb = connectionApproved ? "Approved" : "Denied";

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
        Connection Request {actionVerb}
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
          marginBottom: "36px",
          marginTop: "48px",
          textAlign: "center",
          color: "GrayText",
        }}
      >
        {alert.initiatorUser.firstName} {alert.initiatorUser.lastName} has{" "}
        {actionVerb.toLowerCase()} your connection request.
      </Typography>

      <Typography
        sx={{
          fontSize: "14px",
          marginBottom: "36px",
          textAlign: "center",
          color: "GrayText",
        }}
      >
        <Typography>
          To view your connections,{" "}
          <Link to={`/connections`} style={{ textDecoration: "none" }}>
            <span style={{ color: "#0b44bfd2" }}>click here</span>
          </Link>
        </Typography>
      </Typography>
    </ModalContainer>
  );
};

export default ConnectResponseModal;
