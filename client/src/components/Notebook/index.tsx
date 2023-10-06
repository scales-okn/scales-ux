import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { useRings } from "src/store/rings";
import { useNotebook } from "src/store/notebook";
import { useUser } from "src/store/user";
import { usePanels } from "src/store/panels";
import { sessionUserSelector } from "src/store/auth";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Grid, TextField, Button, Switch, Box, Tooltip } from "@mui/material";
import DeleteButton from "src/components/Buttons/DeleteButton";
import { useTheme } from "@mui/material/styles";

import AddPanel from "src/components/Panels/AddPanel";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import Loader from "src/components/Loader";
import Panels from "src/components/Panels";
import DuplicateNotebookModal from "./DuplicateNotebookModal";

const Notebook = () => {
  const { getRings } = useRings();
  const { fetchUsers } = useUser();
  const sessionUser = useSelector(sessionUserSelector);

  const theme = useTheme(); // mui theme

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
  } = useNotebook();

  const updateDisabled = notebook?.userId !== sessionUser.id;

  const { getPanels, clearPanels } = usePanels(notebook?.id);

  const { notebookId: notebookIdParam } = useParams();

  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [notebookTitle, setNotebookTitle] = useState(notebook?.title || "");
  const navigate = useNavigate();

  useEffect(() => {
    getRings();
    fetchUsers();

    return () => {
      clearNotebook();
      clearPanels();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const notebookRef = React.useRef(null);

  useEffect(() => {
    // If we have a notebook id, navigate to it
    if (notebook?.id) {
      navigate(`/notebooks/${notebook?.id}`);
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
    // If we have a notebook id, fetch the notebook
    if (notebookIdParam && notebookIdParam !== "new") {
      fetchNotebook(notebookIdParam);
    }
  }, [notebookIdParam]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteNotebook = () => {
    deleteNotebook(notebook?.id);
    navigate("/notebooks");
  };

  const updateNotebookVisibility = (id, visibility) => {
    const out = visibility === "public" ? "private" : "public";

    updateNotebook(id, {
      visibility: out,
    });
  };

  return (
    <Loader isVisible={loadingNotebook}>
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
          <Grid item lg={4}>
            <TextField
              fullWidth
              size="medium"
              placeholder="Notebook Title"
              variant="standard"
              error={!notebookTitle && notebook?.id}
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
                },
              }}
            />
          </Grid>

          {notebook?.id ? (
            <>
              <Grid item sx={{ display: "flex", alignItems: "center" }}>
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
                  disabled={deletingNotebook || updateDisabled}
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
                <div>
                  <span className="title">Owner:</span>
                  <span className="name">
                    {notebook?.user?.firstName} {notebook?.user?.lastName}
                  </span>
                </div>
                <div>
                  <span className="title">Public:</span>
                  <Switch
                    disabled={updateDisabled}
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
              color="success"
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

      <ConfirmModal
        itemName="notebook"
        open={confirmVisible}
        setOpen={setConfirmVisible}
        onConfirm={handleDeleteNotebook}
      />
      {copyModalOpen && <DuplicateNotebookModal setOpen={setCopyModalOpen} />}
    </Loader>
  );
};

export default Notebook;
