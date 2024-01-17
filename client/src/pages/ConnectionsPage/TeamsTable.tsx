import React, { useEffect, useState } from "react";

import {
  Typography,
  Box,
  Grid,
  Button,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import StarBorderPurple500Icon from "@mui/icons-material/StarBorderPurple500";
import { useTheme } from "@mui/material/styles";

import { useSessionUser } from "src/store/auth";
import { useTeam } from "src/store/team";
import { useConnection } from "src/store/connection";

import NewTeamModal from "./NewTeamModal";

const TeamsTable = () => {
  const theme = useTheme();
  const { fetchTeams, teams } = useTeam();
  const { fetchApprovedConnectionUsers, approvedConnectionUsers } =
    useConnection();
  console.log("🚀 ~ TeamsTable ~ connections:", approvedConnectionUsers);
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
        }}
      >
        {teams.map((team) => {
          const teamLead = team.users.find((u) => {
            return u.UserTeams.role === "lead";
          });
          const teamUsers = prioritizeLead(team.users);

          return (
            <Box
              key={team.id}
              sx={{
                width: "48%",
                minWidth: "400px",
                maxWidth: "800px",
                flexGrow: 1,
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
                  {team.description ? (
                    <Box
                      sx={{
                        marginBottom: "36px",
                        paddingBottom: "36px",
                        paddingTop: "12px",
                        borderBottom: "1px solid lightgrey",
                        textAlign: "center",
                        color: "grey",
                      }}
                    >
                      {team.description}
                    </Box>
                  ) : null}
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
                          onChange={(event) => {
                            console.log(event);
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
                      width: "100%",
                      display: "flex",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Select
                      variant="outlined"
                      onChange={(event) => {
                        console.log(event);
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
                        return (
                          <MenuItem key={connection.id} value={connection.id}>
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
                </AccordionDetails>
              </Accordion>
            </Box>
          );
        })}
      </Box>
    </>
  );
};

export default TeamsTable;
