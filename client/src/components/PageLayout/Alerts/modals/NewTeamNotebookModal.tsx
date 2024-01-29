import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAlert, AlertT } from "src/store/alerts";
import ModalContainer from "src/components/Modals/ModalContainer";

type NewTeamNotebookT = {
  open: boolean;
  onClose: () => void;
  alert: AlertT;
};

const NewTeamNotebook = ({ open, onClose, alert }: NewTeamNotebookT) => {
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
        New Team Notebook
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
        A new notebook{" "}
        <span style={{ fontWeight: "bold", fontStyle: "italic" }}>
          {alert.notebook.title}
        </span>{" "}
        has been added to the team:
      </Typography>
      <Typography
        sx={{
          fontSize: "18px",
          textAlign: "center",
          marginBottom: "12px",
          color: theme.palette.primary.main,
        }}
      >
        {" "}
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
          marginBottom: "18px",
          textAlign: "center",
          color: "GrayText",
        }}
      >
        <Typography>
          To view this notebook,{" "}
          <Link
            to={`/notebooks/${alert.notebookId}`}
            style={{ textDecoration: "none" }}
            onClick={onClose}
          >
            <span style={{ color: "#0b44bfd2" }}>click here</span>
          </Link>
        </Typography>
      </Typography>
    </ModalContainer>
  );
};

export default NewTeamNotebook;
