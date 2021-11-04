import React, { FunctionComponent, useState } from "react";
import { Col, Container, Row, Button, Form } from "react-bootstrap";
import { useNotebookContext } from "./NotebookContext";

import Loader from "../Loader";
import "./Notebook.scss";
import Panels from "./Panels";
import Dataset from "./Dataset";

const Notebook: FunctionComponent = () => {
  const {
    notebookTitle,
    setNotebookTitle,
    saveNotebook,
    savingNotebook,
    results,
    rings,
    setPanels,
  } = useNotebookContext();

  return (
    <Loader animation="border" isVisible={!rings}>
      <>
        <Container className="mb-3">
          <Row className="align-items-center">
            <Col lg="4" className="d-flex align-items-center mb-4">
              <Form.Control
                size="lg"
                type="text"
                placeholder="Your Notebook Title Here"
                onChange={(event) => {
                  setNotebookTitle(event.target.value);
                  // saveNotebook();
                }}
                value={notebookTitle}
                className="border-top-0 border-end-0 border-start-0 border-2 bg-transparent ps-0 notebook-title rounded-0"
              />
            </Col>

            <Col>
              <Button
                className="text-white float-end"
                variant="primary"
                onClick={() => saveNotebook()}
                disabled={savingNotebook}
              >
                {savingNotebook ? "Loading…" : "Save"}
              </Button>

              <Button
                className="text-white float-end me-2"
                variant="danger"
                onClick={() => saveNotebook()}
                disabled={savingNotebook}
              >
                {savingNotebook ? "Loading…" : "Delete"}
              </Button>
            </Col>
          </Row>
        </Container>
        <Panels />
      </>
    </Loader>
  );
};

export default Notebook;
