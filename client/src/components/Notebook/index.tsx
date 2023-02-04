import React, { FunctionComponent, useState, useEffect } from "react";
import { Col, Container, Row, Button, Form } from "react-bootstrap";
import Loader from "components/Loader";
import Panels from "components/Panels";
import { useSelector } from "react-redux";
import {
  notebookSelector,
  updateNotebook,
  deleteNotebook,
  createNotebook,
} from "store/notebook";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import "./Notebook.scss";
import { useRings } from "../../store/rings";
import AddPanel from "../Panels/AddPanel";
import { getPanels, usePanels } from "../../store/panels";
import ConfirmModal from "components/SharedElements/ConfirmModal";

const Notebook: FunctionComponent = () => {
  const { getRings } = useRings();
  const {
    notebook,
    loadingNotebook,
    savingNotebook,
    deletingNotebook,
    // hasErrors,
  } = useSelector(notebookSelector);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [notebookTitle, setNotebookTitle] = useState(notebook?.title || "");
  const [notebookTitleIsValid, setNotebookTitleIsValid] = useState(true);
  const dispatch = useDispatch();
  const history = useHistory();
  const { panels, updatePanel } = usePanels(notebook?.id);

  const handleDeleteNotebook = () => {
    dispatch(deleteNotebook(notebook?.id));
    history.push("/notebooks");
  };

  useEffect(() => {
    getRings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (notebook) {
      dispatch(getPanels(notebook.id));
    }
  }, [notebook]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Loader animation="border" isVisible={loadingNotebook}>
      <>
        <Container className="mb-3">
          <Row className="align-items-center">
            <Col lg="4" className="d-flex align-items-center mb-4">
              <Form.Control
                size="lg"
                type="text"
                placeholder="Your Notebook Title Here"
                isInvalid={!notebookTitleIsValid}
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
                  <Button
                    className="text-white float-end"
                    variant="success"
                    onClick={() => {
                      dispatch(
                        updateNotebook(notebook?.id, { title: notebookTitle }),
                      );
                      panels.forEach((panel) => {
                        updatePanel(panel.id, panel);
                      });
                    }}
                    disabled={savingNotebook}
                  >
                    {savingNotebook ? "Loading…" : "Save"}
                  </Button>

                  <Button
                    className="text-white float-end me-2"
                    variant="danger"
                    onClick={() => setConfirmVisible(true)}
                    disabled={deletingNotebook}
                  >
                    {deletingNotebook ? "Deleting..." : "Delete"}
                  </Button>
                </>
              )}

              {!notebook && (
                <Button
                  className="text-white float-end"
                  variant="primary"
                  onClick={() => {
                    if (!notebookTitle) {
                      setNotebookTitleIsValid(false);
                    } else {
                      setNotebookTitleIsValid(true);
                      dispatch(createNotebook({ title: notebookTitle }));
                    }
                  }}
                  disabled={savingNotebook}
                >
                  {savingNotebook ? "Loading…" : "Create"}
                </Button>
              )}
            </Col>
          </Row>
        </Container>
        {notebook && <Panels notebookId={notebook?.id} />}
        <AddPanel notebookId={notebook?.id} />
      </>
      <ConfirmModal
        open={confirmVisible}
        setOpen={setConfirmVisible}
        onConfirm={handleDeleteNotebook}
      />
    </Loader>
  );
};

export default Notebook;
