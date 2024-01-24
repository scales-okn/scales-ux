import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import queryString from "query-string";

import { useRings } from "src/store/rings";
import { useNotebook } from "src/store/notebook";
import { usePanels } from "src/store/panels";
import { useSessionUser } from "src/store/auth";
import { useTeam } from "src/store/team";

import { renderName } from "src/helpers/renderName";

import useWindowSize from "src/hooks/useWindowSize";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IosShareIcon from "@mui/icons-material/IosShare";
import {
  Grid,
  TextField,
  Button,
  Switch,
  Box,
  Tooltip,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import DeleteButton from "src/components/Buttons/DeleteButton";
import { useTheme } from "@mui/material/styles";

import AddPanel from "src/components/Panels/AddPanel";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import Loader from "src/components/Loader";
import Panels from "src/components/Panels";
import DuplicateNotebookModal from "./DuplicateNotebookModal";
import ShareLinkModal from "./ShareLinkModal";

const Notebook = () => {
  const { getRings } = useRings();
  const {
    notebook,
    fetchNotebook,
    loadingNotebook,
    updateNotebook,
    deleteNotebook,
    createNotebook,
    deletingNotebook,
    savingNotebook,
    clearNotebook,
    hasErrors,
  } = useNotebook();
  const { getPanels, clearPanels } = usePanels(notebook?.id);
  const { fetchTeams, teams } = useTeam();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionUser = useSessionUser();
  const { notebookId: notebookIdParam } = useParams();

  const { page } = queryString.parse(location.search);

  const isNewNotebook = notebookIdParam === "new";
  const { width } = useWindowSize();
  const isMobile = width < 500;

  const userIsNotebookOwner = sessionUser?.id === notebook?.userId;
  const userIsNotebookTeamAdmin = notebook?.team?.users?.some(
    (user) => user.id === sessionUser?.id && user.UserTeams?.role === "admin",
  );
  const sessionUserCanEdit = userIsNotebookOwner || userIsNotebookTeamAdmin;
  const updatesDisabled = !sessionUserCanEdit && !isNewNotebook;

  const [copyModalOpen, setCopyModalOpen] = useState(false);

  const [shareLinkModalOpen, setShareLinkModalOpen] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [notebookTitle, setNotebookTitle] = useState(notebook?.title || "");

  useEffect(() => {
    getRings();

    return () => {
      clearNotebook();
      clearPanels();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const notebookRef = React.useRef(null);

  useEffect(() => {
    // If we have a notebook id, navigate to it
    if (notebook?.id) {
      const pageParam = page ? `?page=${page}` : "";
      navigate(`/notebooks/${notebook?.id}${pageParam}`);
    }
    // If the notebook title has changed, set the local state
    if (notebook?.title && notebook?.title !== notebookTitle) {
      setNotebookTitle(notebook.title);
    }
    // If the notebook id has changed, fetch the panels
    if (notebook?.id && notebookRef.current !== notebook?.id) {
      getPanels();
      notebookRef.current = notebook?.id;
    }

    fetchTeams();
  }, [notebook?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hasErrors) {
      navigate("/notebooks");
    }
  }, [hasErrors]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // If we have a notebook id, fetch the notebook
    if (notebookIdParam && !isNewNotebook) {
      fetchNotebook(notebookIdParam);
    }
  }, [notebookIdParam]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteNotebook = () => {
    deleteNotebook(notebook.id);
    navigate("/notebooks");
  };

  const updateNotebookVisibility = (id, visibility) => {
    const out = visibility === "public" ? "private" : "public";

    updateNotebook(id, {
      visibility: out,
    });
  };

  const missingTitle =
    notebookTitle === "" && !isNewNotebook && !loadingNotebook;

  return (
    <Loader isVisible={loadingNotebook && !isNewNotebook}>
      <Grid
        container
        sx={{
          borderRadius: "6px",
          background: "white",
          padding: "16px 24px 24px 24px",
          marginBottom: "36px",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",

          "*": {
            transition: ".2s all",
          },
        }}
      >
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          sx={{ marginLeft: "12px" }}
        >
          <Grid item xs={8}>
            <TextField
              fullWidth
              size="medium"
              disabled={updatesDisabled}
              placeholder="Notebook Title"
              variant="standard"
              error={missingTitle}
              helperText={
                missingTitle
                  ? "Title is required. Changes will not be saved."
                  : null
              }
              onChange={(event) => {
                setNotebookTitle(event.target.value);
              }}
              value={notebookTitle}
              onBlur={() => {
                if (
                  notebookTitle &&
                  notebook?.title &&
                  notebookTitle !== notebook?.title
                ) {
                  updateNotebook(notebook?.id, { title: notebookTitle });
                }
              }}
              sx={{
                marginBottom: "6px",
                input: {
                  fontSize: "32px",
                  color: "#333",
                  paddingBottom: "0",
                  ...(isNewNotebook ? { borderBottom: "1px solid black" } : {}),
                },
              }}
            />
            {updatesDisabled && !loadingNotebook && (
              <Typography
                sx={{
                  fontStyle: "italic",
                  fontSize: "14px",
                  color: "GrayText",
                }}
              >
                This is a read-only notebook. Use the copy button to clone your
                own version.
              </Typography>
            )}
          </Grid>

          {notebook?.id ? (
            <>
              <Grid
                item
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: isMobile ? "12px" : 0,
                }}
              >
                {/* TODO: Componentize */}
                {notebook.visibility === "public" ? (
                  <Tooltip title="Share Link to Notebook">
                    <Box
                      sx={{
                        border: `1px solid ${theme.palette.info.main}`,
                        borderRadius: "4px",
                        padding: "4px",
                        height: "36px",
                        width: "36px",
                        marginRight: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: ".2s all",

                        "&:hover": {
                          border: `1px solid ${theme.palette.info.dark}`,
                          background: "#60118e1a",
                        },
                      }}
                      onClick={() => setShareLinkModalOpen(true)}
                    >
                      <IosShareIcon color="info" sx={{ fontSize: "22px" }} />
                    </Box>
                  </Tooltip>
                ) : null}
                <Tooltip title="Make a Copy">
                  <Box
                    sx={{
                      border: `1px solid ${theme.palette.success.main}`,
                      borderRadius: "4px",
                      padding: "4px",
                      height: "36px",
                      width: "36px",
                      marginRight: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: ".2s all",

                      "&:hover": {
                        border: `1px solid ${theme.palette.success.dark}`,
                        background: "#118e151a",
                      },
                    }}
                    onClick={() => setCopyModalOpen(true)}
                  >
                    <ContentCopyIcon
                      color="success"
                      sx={{ fontSize: "22px" }}
                    />
                  </Box>
                </Tooltip>
                <DeleteButton
                  onClick={() => setConfirmVisible(true)}
                  disabled={deletingNotebook || updatesDisabled}
                  variant="outlined"
                  titleAddon="Notebook"
                />
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  marginTop: "24px",
                  "& .title": {
                    fontSize: "18px",
                    fontWeight: "600",
                    marginRight: "12px",
                  },

                  "& .name": {
                    color: "GrayText",
                    fontSize: "16px",
                    fontWeight: "600",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <Typography
                    sx={{
                      fontsize: "18px",
                      fontWeight: "600",
                      marginRight: "12px",
                    }}
                  >
                    Owner:
                  </Typography>
                  <Typography>
                    {renderName({ user: notebook?.user, sessionUser })}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <Tooltip title="Owners of notebooks can assign/unassign to teams they belong to">
                    <Typography
                      sx={{
                        fontsize: "18px",
                        fontWeight: "600",
                        marginRight: "20px",
                      }}
                    >
                      Team:
                    </Typography>
                  </Tooltip>
                  <Typography sx={{ color: "GrayText" }}>
                    {sessionUserCanEdit ? (
                      <Select
                        variant="outlined"
                        value={notebook.team?.id}
                        // disabled={!sessionUserCanEdit}
                        onChange={(event) => {
                          updateNotebook(notebook.id, {
                            teamId: event.target.value,
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
                        {notebook.team?.id ? (
                          <MenuItem key="none" value={null}>
                            <Typography
                              sx={{
                                textTransform: "capitalize",
                                color: "GrayText",
                              }}
                            >
                              Unassign
                            </Typography>
                          </MenuItem>
                        ) : null}
                        {teams.map((teamObj) => (
                          <MenuItem key={teamObj.id} value={teamObj.id}>
                            <Typography
                              sx={{
                                textTransform: "capitalize",
                              }}
                            >
                              {teamObj.name}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <Typography>
                        {notebook?.team?.name || "Unassigned"}
                      </Typography>
                    )}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Tooltip title="Public notebooks can be seen and copied (but not modified) by any user">
                    <Typography
                      sx={{
                        fontsize: "18px",
                        fontWeight: "600",
                        marginRight: "12px",
                      }}
                    >
                      Public:
                    </Typography>
                  </Tooltip>
                  <Switch
                    disabled={!sessionUserCanEdit}
                    checked={notebook?.visibility === "public"}
                    onChange={() =>
                      updateNotebookVisibility(
                        notebook?.id,
                        notebook.visibility,
                      )
                    }
                    color="primary"
                    sx={{ marginLeft: "-8px" }}
                  />
                </Box>
              </Grid>
            </>
          ) : (
            <Button
              size="large"
              color="primary"
              variant="contained"
              onClick={() => {
                if (notebookTitle) {
                  createNotebook({ title: notebookTitle });
                }
              }}
              disabled={savingNotebook || !notebookTitle}
            >
              {savingNotebook ? "Loading…" : "Create"}
            </Button>
          )}
        </Grid>

        {notebook?.id && <></>}
      </Grid>

      {notebook && (
        <Panels
          notebookId={notebook?.id}
          sessionUserCanEdit={sessionUserCanEdit}
        />
      )}
      <AddPanel notebookId={notebook?.id} />

      {confirmVisible && (
        <ConfirmModal
          itemName="notebook"
          open={confirmVisible}
          setOpen={setConfirmVisible}
          onConfirm={handleDeleteNotebook}
        />
      )}
      {copyModalOpen && <DuplicateNotebookModal setOpen={setCopyModalOpen} />}
      {shareLinkModalOpen && <ShareLinkModal setOpen={setShareLinkModalOpen} />}
    </Loader>
  );
};

export default Notebook;
