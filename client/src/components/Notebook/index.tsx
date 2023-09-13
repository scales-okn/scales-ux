import React, { useEffect, useState } from "react";
import { Grid, TextField } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffectOnce } from "react-use";

import {
  notebookSelector,
  updateNotebook,
  deleteNotebook,
  createNotebook,
} from "src/store/notebook";
import { useRings } from "src/store/rings";
import { getPanels, usePanels } from "src/store/panels";

import { Button } from "@mui/material";

import AddPanel from "../Panels/AddPanel";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import Loader from "src/components/Loader";
import Panels from "src/components/Panels";

const Notebook = () => {
  const { getRings } = useRings();
  const { notebook, loadingNotebook, savingNotebook, deletingNotebook } =
    useSelector(notebookSelector);

  const location = useLocation();
  const isNewNotebook = location.pathname.includes("new");

  useEffect(() => {
    if (isNewNotebook) {
      setNotebookTitle("");
    }
  }, [isNewNotebook]); // eslint-disable-line react-hooks/exhaustive-deps

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [notebookTitle, setNotebookTitle] = useState(notebook?.title || "");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { panels, updatePanel } = usePanels(notebook?.id);

  const handleDeleteNotebook = () => {
    dispatch(deleteNotebook(notebook?.id));
    navigate("/notebooks");
  };

  useEffect(() => {
    if (notebook?.title && !notebookTitle) {
      setNotebookTitle(notebook.title);
    }
  }, [notebook]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (notebook?.id) {
      dispatch(getPanels(notebook?.id));
    }
  }, [notebook?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffectOnce(() => {
    getRings();

    return () => {
      setNotebookTitle("");
    };
  });

  return (
    <Loader isVisible={loadingNotebook}>
      <>
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          sx={{
            marginBottom: "32px",
            padding: "18px 16px",
            borderRadius: "6px",
          }}
        >
          <Grid item lg={4}>
            <TextField
              fullWidth
              size="medium"
              placeholder="Notebook Title"
              variant="standard"
              error={!notebookTitle && !isNewNotebook}
              onChange={(event) => {
                setNotebookTitle(event.target.value);
              }}
              value={notebookTitle}
              sx={{ input: { fontSize: "22px" } }}
            />
          </Grid>

          <Grid item>
            {notebook && (
              <>
                <Button
                  variant="contained"
                  onClick={() => setConfirmVisible(true)}
                  disabled={deletingNotebook}
                  sx={{ marginRight: "12px" }}
                  color="error"
                >
                  {deletingNotebook ? "Deleting..." : "Delete"}
                </Button>
                <Button
                  color="success"
                  variant="contained"
                  onClick={() => {
                    if (notebookTitle) {
                      dispatch(
                        updateNotebook(notebook?.id, {
                          title: notebookTitle,
                        }),
                      );
                      panels.forEach((panel) => {
                        updatePanel(panel.id, panel);
                      });
                    }
                  }}
                  disabled={savingNotebook || !notebookTitle}
                >
                  {savingNotebook ? "Loading…" : "Save"}
                </Button>
              </>
            )}

            {!notebook && (
              <Button
                size="large"
                color="success"
                variant="contained"
                onClick={() => {
                  if (notebookTitle) {
                    dispatch(createNotebook({ title: notebookTitle }));
                  }
                }}
                disabled={savingNotebook || !notebookTitle}
              >
                {savingNotebook ? "Loading…" : "Create"}
              </Button>
            )}
          </Grid>
        </Grid>

        {notebook && <Panels notebookId={notebook?.id} />}
        <AddPanel notebookId={notebook?.id} />
      </>
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
