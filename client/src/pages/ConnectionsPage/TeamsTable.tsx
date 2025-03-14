import React, { useEffect, useState } from "react";

import {
  Typography,
  Box,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Tooltip,
  Button,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Launch } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

import useWindowSize from "src/hooks/useWindowSize";

import { renderName } from "src/helpers/renderName";
import { useSessionUser } from "src/store/auth";
import { useTeam } from "src/store/team";
import { useConnection } from "src/store/connection";

import DeleteUserModal from "./DeleteUserModal";
import DeleteTeamModal from "./DeleteTeamModal";
import NewTeamModal from "./NewTeamModal";
import ConnectionLookup from "./ConnectionLookup";

const TeamsTable = () => {
  const theme = useTheme();
  const { fetchTeams, updateTeam, teams } = useTeam();
  const { fetchApprovedConnectionUsers, approvedConnectionUsers } =
    useConnection();
  const [userToDelete, setUserToDelete] = useState(null);
  const [teamToDelete, setTeamToDelete] = useState(null);

  const { width } = useWindowSize();
  const isTablet = width < 900;

  const sessionUser = useSessionUser();

  useEffect(() => {
    fetchTeams();
    fetchApprovedConnectionUsers({
      pageSize: 1000,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const visibilityOptions = ["admin", "read-only"];

  const selectColors = {
    [visibilityOptions[0]]: theme.palette.primary.main,
    [visibilityOptions[1]]: theme.palette.warning.main,
  };

  return (
    <>
      <NewTeamModal />
      <Box
        sx={{
          display: "flex",
          gap: "24px",
          justifyContent: "space-between",
          flexWrap: "wrap",
          paddingBottom: "80px",
        }}
      >
        {teams.length > 0 ? (
          teams.map((team, idx) => {
            const adminUsers = team.users.filter(
              (u) => u.UserTeams.role === "admin",
            );
            const sessionUserIsAdmin = adminUsers.find((u) => {
              return sessionUser.id === u?.id;
            });

            const availableTeamMembers = approvedConnectionUsers
              .map((connection) => {
                const isAlreadyOnTeam = team.users.find(
                  (user) => user.id === connection.id,
                );
                if (isAlreadyOnTeam) return null;
                return connection;
              })
              .filter((user) => user);

            return (
              <Box
                key={team.id}
                sx={{
                  width: "48%",
                  minWidth: "400px",
                  flexGrow: isTablet ? 1 : 0,
                }}
              >
                <Accordion sx={{ marginBottom: "24px" }}>
                  <AccordionSummary
                    expandIcon={<ArrowDropDownIcon />}
                    aria-controls="panel2-content"
                    id="panel2-header"
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingRight: "12px",
                        paddingLeft: "12px",
                        width: "100%",
                        minHeight: "56px",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "24px",
                          fontWeight: "700",
                          color: theme.palette.primary.main,
                        }}
                      >
                        {team.name}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      paddingLeft: "48px",
                      borderTop: "1px solid lightgrey",
                      padding: "26px",
                    }}
                  >
                    <Box
                      sx={{
                        marginBottom: "36px",
                        paddingBottom: "36px",
                        paddingTop: "12px",
                        borderBottom: "1px solid lightgrey",
                        color: "grey",
                      }}
                    >
                      {sessionUserIsAdmin ? (
                        <>
                          <Typography sx={{ marginBottom: "12px" }}>
                            Team Name:
                          </Typography>
                          <TextField
                            multiline
                            defaultValue={team.name}
                            placeholder="Add a name..."
                            sx={{ width: "100%" }}
                            onBlur={(event) => {
                              if (event.target.value !== team.name) {
                                updateTeam(team.id, {
                                  name: event.target.value,
                                });
                              }
                            }}
                          >
                            {team.description}
                          </TextField>
                          <Typography
                            sx={{ marginBottom: "12px", marginTop: "36px" }}
                          >
                            Description:
                          </Typography>
                          <TextField
                            multiline
                            defaultValue={team.description}
                            placeholder="Add a description..."
                            sx={{ width: "100%" }}
                            onBlur={(event) => {
                              if (event.target.value !== team.description) {
                                updateTeam(team.id, {
                                  description: event.target.value,
                                });
                              }
                            }}
                          >
                            {team.description}
                          </TextField>
                        </>
                      ) : (
                        <Typography sx={{ textAlign: "center" }}>
                          {team.description}
                        </Typography>
                      )}
                    </Box>
                    {team.users.map((user) => {
                      const onlyOneAdmin = adminUsers.length === 1;
                      const userIsAdmin = user.UserTeams.role === "admin";
                      const sessionUserIsUser = user.id === sessionUser.id;
                      const deleteDisabled = onlyOneAdmin && userIsAdmin;

                      const canDelete =
                        (sessionUserIsAdmin || sessionUserIsUser) &&
                        !deleteDisabled;

                      let removeTooltip =
                        user.id === sessionUser.id
                          ? "Leave Team"
                          : "Remove user from team";

                      if (!canDelete) {
                        removeTooltip = "This user cannot be removed";
                      }

                      return (
                        <Box
                          key={user.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box
                            sx={{
                              padding: "12px",
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: "600",
                                color: "#333",
                                display: "flex",
                                alignItems: "center",
                                textTransform: "capitalize",
                              }}
                            >
                              {renderName({ user: user, sessionUser })}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Select
                              variant="outlined"
                              value={user.UserTeams.role}
                              disabled={!sessionUserIsAdmin}
                              onChange={(event) => {
                                updateTeam(team.id, {
                                  userIdToUpdate: user.id,
                                  newUserRole: event.target.value as string,
                                });
                              }}
                              sx={{
                                background: "white",
                                minWidth: "140px",
                                height: "32px",
                              }}
                              MenuProps={{
                                disableScrollLock: true,
                              }}
                            >
                              {visibilityOptions.map((val) => {
                                const optionDisabled =
                                  adminUsers.length === 1 &&
                                  user.UserTeams.role === "admin";
                                return (
                                  <MenuItem
                                    key={val}
                                    value={val}
                                    disabled={optionDisabled}
                                  >
                                    <Typography
                                      sx={{
                                        color: selectColors[val],
                                        textTransform: "capitalize",
                                      }}
                                    >
                                      {val}
                                    </Typography>
                                  </MenuItem>
                                );
                              })}
                            </Select>
                            <Tooltip title={removeTooltip}>
                              <Button
                                sx={{
                                  minWidth: "unset",
                                  padding: "0 0 0 12px",
                                }}
                                onClick={() => {
                                  if (canDelete) {
                                    setUserToDelete({
                                      ...user,
                                      teamId: team.id,
                                    });
                                  }
                                }}
                              >
                                <DeleteOutlineIcon
                                  color="error"
                                  sx={{
                                    color: !canDelete ? "grey" : null,
                                    cursor: canDelete
                                      ? "pointer"
                                      : "not-allowed",
                                  }}
                                />
                              </Button>
                            </Tooltip>
                          </Box>
                        </Box>
                      );
                    })}{" "}
                    <Box
                      sx={{
                        background: "lightgrey",
                        height: "1px",
                        margin: "32px 0",
                      }}
                    />
                    {sessionUserIsAdmin ? (
                      <>
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <ConnectionLookup
                            team={team}
                            availableTeamMembers={availableTeamMembers}
                            updateTeam={updateTeam}
                          />
                        </Box>
                        <Box
                          sx={{
                            background: "lightgrey",
                            height: "1px",
                            margin: "32px 0",
                          }}
                        />
                      </>
                    ) : null}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="h5">Notebooks</Typography>
                      <Box
                        sx={{
                          width: "100%",
                          marginTop: "24px",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "12px",
                        }}
                      >
                        {team.notebooks.length ? (
                          team.notebooks.map((notebook) => {
                            return (
                              <Tooltip title="Go to Notebook" key={notebook.id}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    border: "1px solid grey",
                                    borderRadius: "4px",
                                    padding: "8px",
                                    width: "48%",
                                    cursor: "pointer",
                                    transition: ".2s all ease-in-out",
                                    "&:hover": {
                                      border: "1px solid black",
                                    },
                                  }}
                                  onClick={() => {
                                    window.open(
                                      `/notebooks/${notebook.id}`,
                                      "_blank",
                                    );
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      padding: "0 12px",
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {notebook.title}
                                  </Typography>
                                  <Launch color="primary" />
                                </Box>
                              </Tooltip>
                            );
                          })
                        ) : (
                          <Typography
                            sx={{
                              color: "GrayText",
                              textAlign: "center",
                              marginBottom: "24px",
                            }}
                          >
                            This team currently has no notebooks to display. The
                            owner of a notebook may assign it to a team from the
                            notebook detail page.
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {sessionUserIsAdmin ? (
                      <>
                        <Box
                          sx={{
                            background: "lightgrey",
                            height: "1px",
                            margin: "32px 0",
                          }}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            width: "100%",
                          }}
                        >
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => {
                              setTeamToDelete(team);
                            }}
                          >
                            Delete Team
                          </Button>
                        </Box>
                      </>
                    ) : null}
                  </AccordionDetails>
                </Accordion>
              </Box>
            );
          })
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "40vh",
            }}
          >
            No teams to display
          </Box>
        )}
      </Box>
      <DeleteUserModal
        setUserToDelete={setUserToDelete}
        userToDelete={userToDelete}
      />
      <DeleteTeamModal
        setTeamToDelete={setTeamToDelete}
        teamToDelete={teamToDelete}
      />
    </>
  );
};

export default TeamsTable;
