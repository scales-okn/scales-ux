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
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import StarBorderPurple500Icon from "@mui/icons-material/StarBorderPurple500";
import { useTheme } from "@mui/material/styles";

import useWindowSize from "src/hooks/useWindowSize";

import { useSessionUser } from "src/store/auth";
import { useTeam } from "src/store/team";
import { useConnection } from "src/store/connection";

import NewTeamModal from "./NewTeamModal";
import { Launch } from "@mui/icons-material";

const TeamsTable = () => {
  const theme = useTheme();
  const { fetchTeams, updateTeam, teams } = useTeam();
  const { fetchApprovedConnectionUsers, approvedConnectionUsers } =
    useConnection();

  const { width } = useWindowSize();
  const isTablet = width < 900;

  const sessionUser = useSessionUser();

  useEffect(() => {
    fetchTeams();
    fetchApprovedConnectionUsers({
      pageSize: 1000,
    });
  }, []);

  const renderName = (selectedUser) => {
    if (!selectedUser) return "";

    return selectedUser.id === sessionUser.id
      ? "You"
      : `${selectedUser.firstName} ${selectedUser.lastName}`;
  };

  const prioritizeLead = (arr = []) => {
    const sortedArray = [...arr].sort((a, b) => {
      if (a.UserTeams.role === "lead") {
        return -1;
      } else if (b.UserTeams.role === "lead") {
        return 1;
      } else {
        return 0;
      }
    });

    return sortedArray;
  };

  const visibilityOptions = ["lead", "editor", "read-only"];

  const selectColors = {
    [visibilityOptions[0]]: theme.palette.primary.light,
    [visibilityOptions[1]]: theme.palette.success.main,
    [visibilityOptions[2]]: theme.palette.warning.main,
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
            const teamLead = team.users.find((u) => {
              return u.UserTeams.role === "lead";
            });
            const teamUsers = prioritizeLead(team.users);
            const sessionUserIsLead = teamLead?.id === sessionUser.id;
            return (
              <Box
                key={team.id}
                sx={{
                  width: "48%",
                  minWidth: "400px",
                  // maxWidth: "800px",
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
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            marginRight: "4px",
                            fontWeight: "700",
                            color: "GrayText",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {renderName(teamLead)}
                          <StarBorderPurple500Icon
                            color="primary"
                            sx={{ fontSize: "1rem", marginLeft: "4px" }}
                          />
                        </Typography>
                      </Box>
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
                      {sessionUserIsLead ? (
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
                    {teamUsers.map((user) => {
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
                              }}
                            >
                              {renderName(user)}
                              {user.id === teamLead?.id ? (
                                <StarBorderPurple500Icon
                                  color="primary"
                                  sx={{ fontSize: "1rem", marginLeft: "4px" }}
                                />
                              ) : null}
                            </Typography>
                          </Box>
                          <Select
                            variant="outlined"
                            value={user.UserTeams.role}
                            disabled={
                              user.UserTeams.role === "lead" ||
                              !sessionUserIsLead
                            }
                            onChange={(event) => {
                              // TODO: finish
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
                            {visibilityOptions.map((val) => (
                              <MenuItem key={val} value={val}>
                                <Typography
                                  sx={{
                                    color: selectColors[val],
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {val}
                                </Typography>
                              </MenuItem>
                            ))}
                          </Select>
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
                    {sessionUserIsLead ? (
                      <>
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            sx={{ padding: "0 12px", color: "GrayText" }}
                          >
                            Add contact to team...
                          </Typography>
                          <Select
                            variant="outlined"
                            onChange={(event) => {
                              updateTeam(team.id, {
                                userIdToAdd: event.target.value as number,
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
                            {approvedConnectionUsers.map((connection) => {
                              const isAlreadyOnTeam = team.users.find(
                                (user) => user.id === connection.id,
                              );
                              if (isAlreadyOnTeam) return null;
                              return (
                                <MenuItem
                                  key={connection.id}
                                  value={connection.id}
                                >
                                  <Typography
                                    sx={{
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {`${connection.firstName} ${connection.lastName}`}
                                  </Typography>
                                </MenuItem>
                              );
                            })}
                          </Select>
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
                        {team.notebooks.length === 2 ? (
                          team.notebooks.map((notebook) => {
                            return (
                              <Box
                                key={notebook.id}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  border: "1px solid grey",
                                  borderRadius: "4px",
                                  padding: "8px",
                                  width: "48%",
                                  cursor: "pointer",
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
                                <Tooltip title={notebook.description}>
                                  <Typography
                                    sx={{
                                      padding: "0 12px",
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {notebook.title}
                                  </Typography>
                                </Tooltip>
                                <Tooltip title="Go to Notebook">
                                  <Launch color="primary" />
                                </Tooltip>
                              </Box>
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
    </>
  );
};

export default TeamsTable;
