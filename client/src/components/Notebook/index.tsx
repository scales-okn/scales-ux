import React, { useEffect, useState } from "react";
import { Col, Container, Row, Form } from "react-bootstrap";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import { useEffectOnce } from "react-use";

import {
  notebookSelector,
  updateNotebook,
  deleteNotebook,
  createNotebook,
} from "store/notebook";
import { useRings } from "store/rings";
import { getPanels, usePanels } from "store/panels";
import AddPanel from "../Panels/AddPanel";

import StandardButton from "components/Buttons/StandardButton";
import ConfirmModal from "components/Modals/ConfirmModal";
import Loader from "components/Loader";
import Panels from "components/Panels";

import "./Notebook.scss";

const Notebook = () => {
  const { getRings } = useRings();
  const { notebook, loadingNotebook, savingNotebook, deletingNotebook } =
    useSelector(notebookSelector);

  const location = useLocation();
  const isNewNotebook = location.pathname.includes("new");

  const defaultTitle = () => {
    if (isNewNotebook) return "";
    return notebook?.title || "";
  };

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [notebookTitle, setNotebookTitle] = useState(defaultTitle());
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { panels, updatePanel } = usePanels(notebook?.id);

  const handleDeleteNotebook = () => {
    dispatch(deleteNotebook(notebook?.id));
    navigate("/notebooks");
  };

  useEffect(() => {
    // TODO: revisit this to reduce extra queries
    if (notebook?.id) {
      dispatch(getPanels(notebook?.id));
    }
  }, [notebook?.id, dispatch]);

  useEffectOnce(() => {
    getRings();

    return () => {
      setNotebookTitle("");
    };
  });

  return (
    <Loader isVisible={loadingNotebook}>
      <>
        <Container className="mb-3">
          <Row className="align-items-center">
            <Col lg="4" className="d-flex align-items-center mb-4">
              <Form.Control
                size="lg"
                type="text"
                placeholder="Notebook Title"
                isInvalid={!notebookTitle && !isNewNotebook}
                onChange={(event) => {
                  setNotebookTitle(event.target.value);
                }}
                value={notebookTitle}
                className="border-top-0 border-end-0 border-start-0 border-2 bg-transparent ps-0 notebook-title rounded-0"
              />
            </Col>

            <Col>
              {notebook && (
                <>
                  <StandardButton
                    className="text-white float-end"
                    variant="success"
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
                  </StandardButton>

                  <StandardButton
                    className="text-white float-end me-2"
                    variant="danger"
                    onClick={() => setConfirmVisible(true)}
                    disabled={deletingNotebook}
                  >
                    {deletingNotebook ? "Deleting..." : "Delete"}
                  </StandardButton>
                </>
              )}

              {!notebook && (
                <StandardButton
                  className="text-white float-end"
                  variant="primary"
                  onClick={() => {
                    if (notebookTitle) {
                      dispatch(createNotebook({ title: notebookTitle }));
                    }
                  }}
                  disabled={savingNotebook || !notebookTitle}
                  style={{
                    background: "var(--sea-green)",
                    border: "none",
                  }}
                >
                  {savingNotebook ? "Loading…" : "Create"}
                </StandardButton>
              )}
            </Col>
          </Row>
        </Container>
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
