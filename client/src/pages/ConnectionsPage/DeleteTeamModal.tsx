import React from "react";

import { Typography, Box, Button } from "@mui/material";

import { useTheme } from "@mui/material/styles";

import { useTeam } from "src/store/team";
import { useSessionUser } from "src/store/auth";
import { UserT } from "src/store/user";

import ModalContainer from "src/components/Modals/ModalContainer";

type DeleteTeamModalT = {
  setTeamToDelete: (arg: UserT) => void;
  teamToDelete: UserT & { teamId: number };
};

const DeleteTeamModal = ({
  setTeamToDelete,
  teamToDelete,
}: DeleteTeamModalT) => {
  const theme = useTheme();
  const { fetchTeams, deleteTeam } = useTeam();

  return (
    <ModalContainer
      onClose={() => setTeamToDelete(null)}
      open={!!teamToDelete}
      paperStyles={{ maxWidth: "500px" }}
    >
      <Typography
        sx={{
          fontSize: "32px",
          textAlign: "center",
          marginBottom: "36px",
          color: theme.palette.primary.main,
        }}
      >
        Please Confirm
      </Typography>
      <Typography
        sx={{
          fontSize: "14px",
          marginBottom: "48px",
          textAlign: "center",
          color: "GrayText",
        }}
      >
        Are you sure you want to delete this team? This action cannot be undone.
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="outlined"
          onClick={() => setTeamToDelete(null)}
          sx={{ marginRight: "12px" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            deleteTeam(teamToDelete.id);
            setTeamToDelete(null);
            setTimeout(() => {
              fetchTeams();
            }, 500);
          }}
        >
          Confirm
        </Button>
      </Box>
    </ModalContainer>
  );
};

export default DeleteTeamModal;
