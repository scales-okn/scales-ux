import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffectOnce } from "react-use";

import { useRings } from "src/store/rings";
import { useNotebook } from "src/store/notebook";
import { useUser } from "src/store/user";
import { usePanels } from "src/store/panels";
import { sessionUserSelector } from "src/store/auth";

import { Grid, TextField, Button, Autocomplete, Switch } from "@mui/material";
import DeleteButton from "src/components/Buttons/DeleteButton";

import AddPanel from "src/components/Panels/AddPanel";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import Loader from "src/components/Loader";
import Panels from "src/components/Panels";

const Notebook = () => {
  const { getRings } = useRings();
  const { fetchUsers, users } = useUser();
  const sessionUser = useSelector(sessionUserSelector);

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

  const updateDisabled =
    notebook?.userId !== sessionUser.id &&
    notebook?.collaborators?.indexOf(sessionUser.id) === -1;

  const { getPanels } = usePanels(notebook?.id);

  const { notebookId: notebookIdParam } = useParams();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [notebookTitle, setNotebookTitle] = useState(notebook?.title || "");
  const navigate = useNavigate();

  useEffectOnce(() => {
    clearNotebook();
    getRings();
    fetchUsers();

    return () => {
      clearNotebook();
    };
  });

  useEffect(() => {
    if (notebook?.id) {
      navigate(`/notebooks/${notebook?.id}`);
    }
  }, [notebook?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (notebookIdParam && notebookIdParam !== "new") {
      fetchNotebook(notebookIdParam);
    }
  }, [notebookIdParam]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteNotebook = () => {
    deleteNotebook(notebook?.id);
    navigate("/notebooks");
  };

  useEffect(() => {
    if (notebook?.title && !notebookTitle) {
      setNotebookTitle(notebook.title);
    }
  }, [notebook]); // eslint-disable-line react-hooks/exhaustive-deps

  const notebookRef = React.useRef(null);

  useEffect(() => {
    if (notebook?.id && notebookRef.current !== notebook?.id) {
      getPanels();
      notebookRef.current = notebook?.id;
    }
  }, [notebook?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateNotebookCollaborators = (e, selectedCollaborators) => {
    updateNotebook(notebook.id, {
      collaborators: selectedCollaborators.map((u) => u.id),
    });
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
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          sx={{ marginBottom: "36px" }}
        >
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
                input: {
                  fontSize: "36px",
                  color: "#333",
                  paddingBottom: "0",
                },
              }}
            />
          </Grid>

          <Grid item>
            {notebook && (
              <DeleteButton
                onClick={() => setConfirmVisible(true)}
                disabled={deletingNotebook || updateDisabled}
                variant="outlined"
              />
            )}

            {!notebook && (
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
        </Grid>

        {notebook?.id && (
          <>
            <Grid
              item
              xs={12}
              sm={6}
              md={6}
              sx={{
                "& h6": {
                  fontWeight: "700",
                },
              }}
            >
              <Grid
                container
                direction="column"
                alignItems="flex-start"
                sx={{ paddingRight: "56px" }}
              >
                <Grid item>
                  <h6>Collaborators:</h6>
                </Grid>
                <Grid item sx={{ width: "100%" }}>
                  <Autocomplete
                    multiple
                    id="collaborators"
                    disabled={updateDisabled}
                    options={users}
                    value={
                      notebook?.collaborators?.map((collaboratorId) => {
                        return users.find((u) => u.id === collaboratorId);
                      }) || []
                    }
                    onChange={updateNotebookCollaborators}
                    getOptionLabel={(option) => {
                      return `${option.firstName} ${option.lastName}`;
                    }}
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" />
                    )}
                    sx={{
                      width: "100%",
                      background: "white",
                      pointerEvents: updateDisabled ? "none" : "auto",
                      "& .MuiAutocomplete-root": {
                        border: "none",
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid
              item
              xs={3}
              md={1.5}
              sx={{
                "& h6": {
                  fontWeight: "700",
                },
              }}
            >
              <Grid container direction="column" alignItems="flex-start">
                <Grid item>
                  <h6>Public:</h6>
                </Grid>
                <Grid
                  item
                  sx={{
                    height: "56px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
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
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              sm={3}
              md={3}
              sx={{
                "& h6": {
                  fontWeight: "700",
                },
              }}
            >
              <Grid container direction="column" alignItems="flex-start">
                <Grid item>
                  <h6>Owner:</h6>
                </Grid>
                <Grid
                  item
                  sx={{
                    height: "56px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "& span": {
                      color: "GrayText",
                      fontSize: "16px",
                      fontWeight: "600",
                    },
                  }}
                >
                  <span>
                    {notebook?.user?.firstName} {notebook?.user?.lastName}
                  </span>
                </Grid>
              </Grid>
            </Grid>
          </>
        )}
      </Grid>

      {notebook && <Panels notebookId={notebook?.id} />}
      <AddPanel notebookId={notebook?.id} />

      <ConfirmModal
        itemName="notebook"
        open={confirmVisible}
        setOpen={setConfirmVisible}
        onConfirm={handleDeleteNotebook}
      />
    </Loader>
  );
};

export default Notebook;
