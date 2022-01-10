import React, { FunctionComponent, useState } from "react";
import { Col, Container, Row, Button, Form } from "react-bootstrap";
import Loader from "../Loader";
import Panels from "../Panels";
import { useSelector } from "react-redux";
import { notebookSelector, updateNotebook, deleteNotebook, createNotebook } from "../../store/notebook";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import "./Notebook.scss";

const Notebook: FunctionComponent = () => {
  const { notebook, loadingNotebook, savingNotebook, deletingNotebook } = useSelector(notebookSelector);
  const [notebookTitle, setNotebookTitle] = useState(notebook?.title || null);
  const dispatch = useDispatch();
  const history = useHistory();

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
                required
                onChange={(event) => {
                  setNotebookTitle(event.target.value);
                }}
                value={notebookTitle}
                className="border-top-0 border-end-0 border-start-0 border-2 bg-transparent ps-0 notebook-title rounded-0"
              />
            </Col>

            <Col>
              {notebook && <>
                <Button
                  className="text-white float-end"
                  variant="primary"
                  onClick={() => dispatch(updateNotebook(notebook?.id, { title: notebookTitle }))}
                  disabled={savingNotebook}
                >
                  {savingNotebook ? "Loading…" : "Save"}
                </Button>

                <Button
                  className="text-white float-end me-2"
                  variant="danger"
                  onClick={() => {
                    dispatch(deleteNotebook(notebook?.id));
                    history.push("/notebooks");
                  }}
                  disabled={deletingNotebook}
                >
                  {deletingNotebook ? "Deleting..." : "Delete"}
                </Button>
              </>}

              {!notebook && <Button
                className="text-white float-end"
                variant="primary"
                onClick={() => dispatch(createNotebook({ title: notebookTitle }))}
                disabled={savingNotebook}
              >
                {savingNotebook ? "Loading…" : "Create"}
              </Button>}
            </Col>
          </Row>
        </Container>
        <Panels />
      </>
    </Loader>
  );
};

export default Notebook;
