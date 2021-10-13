import React, { FunctionComponent, useState } from "react";
import {
  Col,
  Container,
  Row,
  Accordion,
  useAccordionButton,
  Button,
  Form,
} from "react-bootstrap";

import { useNotebookContext } from "./NotebookContext";

import Loader from "../Loader";
import "./Notebook.scss";
import Panels from "./Panels";

const Notebook: FunctionComponent = () => {
  const {
    notebookTitle,
    setNotebookTitle,
    saveNotebook,
    savingNotebook,
    results,
    setPanels,
  } = useNotebookContext();

  return (
    <Loader animation="border" isVisible={!results}>
      <>
        <Container className="mb-3">
          <Row className="align-items-center">
            <Col lg="8">
              <Form.Control
                size="lg"
                type="text"
                placeholder="Your Notebook Title Here"
                onChange={(event) => {
                  setNotebookTitle(event.target.value);
                }}
                value={notebookTitle}
                className="border-0 bg-transparent ps-0 notebook-title"
              />
            </Col>
            <Col>
              <Button
                className="text-white float-end"
                variant="primary"
                onClick={() =>
                  setPanels((prevPanels) => [
                    ...prevPanels,
                    {
                      id: Math.floor(Math.random() * 100),
                      description: `Panel ${Date.now()}`,
                    },
                  ])
                }
                // disabled={savingNotebook}
              >
                {savingNotebook ? "Loading…" : "Add Panel"}
              </Button>
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
