import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import queryString from "query-string";

import { useRings } from "src/store/rings";
import { useNotebook } from "src/store/notebook";
import { usePanels } from "src/store/panels";
import { useSessionUser } from "src/store/auth";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IosShareIcon from "@mui/icons-material/IosShare";
import {
  Grid,
  TextField,
  Button,
  Switch,
  Box,
  Tooltip,
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

  const navigate = useNavigate();
  const location = useLocation();
  const { page } = queryString.parse(location.search);

  const { notebookId: notebookIdParam } = useParams();
  const isNewNotebook = notebookIdParam === "new";

  const sessionUser = useSessionUser();
  const sessionUserCanEdit = sessionUser?.id === notebook?.userId;
  const updatesDisabled = !sessionUserCanEdit && !isNewNotebook;
  const isAdmin = sessionUser.role === "admin";

  const theme = useTheme();

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
        <Grid container alignItems="center" justifyContent="space-between">
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
                This is a read-only, public notebook. Use the copy button to
                clone your own version.
              </Typography>
            )}
          </Grid>

          {notebook?.id ? (
            <>
              <Grid item sx={{ display: "flex", alignItems: "center" }}>
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
                {isAdmin && (
                  <div>
                    <span className="title">Owner:</span>
                    <span className="name">
                      {notebook?.user?.firstName} {notebook?.user?.lastName}
                    </span>
                  </div>
                )}
                <div>
                  <Tooltip title="Public tooltips can be seen and copied (but not modified) by any user">
                    <span className="title">Public:</span>
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
                </div>
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

      {notebook && <Panels notebookId={notebook?.id} />}
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
