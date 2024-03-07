import React from "react";

import { Typography, Box, Button } from "@mui/material";

import { useTheme } from "@mui/material/styles";

import type { UserT } from "src/types/user";
import { useTeam } from "src/store/team";
import { useSessionUser } from "src/store/auth";

import { renderName } from "src/helpers/renderName";

import ModalContainer from "src/components/Modals/ModalContainer";

type DeleteUserModalT = {
  setUserToDelete: (arg: UserT) => void;
  userToDelete: UserT & { teamId: number };
};

const DeleteUserModal = ({
  setUserToDelete,
  userToDelete,
}: DeleteUserModalT) => {
  const theme = useTheme();
  const sessionUser = useSessionUser();
  const { fetchTeams, updateTeam } = useTeam();

  return (
    <ModalContainer
      onClose={() => setUserToDelete(null)}
      open={!!userToDelete}
      paperStyles={{ maxWidth: "500px" }}
    >
      <Typography
        sx={{
          fontSize: "32px",
          textAlign: "center",
          marginBottom: "12px",
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
        Are you sure you want to remove{" "}
        {renderName({
          user: userToDelete,
          replacementText: "yourself",
          sessionUser,
        })}{" "}
        from this team?
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="outlined"
          onClick={() => setUserToDelete(null)}
          sx={{ marginRight: "12px" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            updateTeam(userToDelete.teamId, {
              userIdToRemove: userToDelete.id,
            });
            setUserToDelete(null);
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

export default DeleteUserModal;
