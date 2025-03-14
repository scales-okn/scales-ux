import React from "react";
import { Link } from "react-router-dom";
import { Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAlert } from "src/store/alerts";
import type { AlertT } from "src/types/alert";
import ModalContainer from "src/components/Modals/ModalContainer";
import { useEffectOnce } from "react-use";

type RingUpdatedModalT = {
  open: boolean;
  onClose: () => void;
  alert: AlertT;
};

const RingUpdatedModal = ({ open, onClose, alert }: RingUpdatedModalT) => {
  const theme = useTheme();
  const { updateAlert } = useAlert();

  useEffectOnce(() => {
    updateAlert(alert.id, { viewed: "true" });
  });

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
        Ring Updated
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
        {alert.initiatorUser.firstName} {alert.initiatorUser.lastName} has
        updated the ring {alert.ringLabel}
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
          To view rings,{" "}
          <Link to={`/rings`}>
            <Typography sx={{ color: "#0b44bfd2", fontSize: "14px" }}>
              click here
            </Typography>
          </Link>
        </Typography>
      </Typography>
    </ModalContainer>
  );
};

export default RingUpdatedModal;
