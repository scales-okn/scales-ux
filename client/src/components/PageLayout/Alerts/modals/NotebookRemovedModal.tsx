import React from "react";
import { Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAlert, AlertT } from "src/store/alerts";
import ModalContainer from "src/components/Modals/ModalContainer";
import { useEffectOnce } from "react-use";

type NotebookSharedModalT = {
  open: boolean;
  onClose: () => void;
  alert: AlertT;
};

const NotebookSharedModal = ({
  open,
  onClose,
  alert,
}: NotebookSharedModalT) => {
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
        Notebook Removed
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
          fontSize: "16px",
          margin: "0 auto",
          marginBottom: "36px",
          marginTop: "48px",
          textAlign: "center",
          color: "GrayText",
          maxWidth: "300px",
        }}
      >
        {alert.initiatorUser.firstName} {alert.initiatorUser.lastName} has
        removed the notebook {alert.deletedNotebookName} from your team.
      </Typography>
    </ModalContainer>
  );
};

export default NotebookSharedModal;
