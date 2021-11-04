import { tsIndexSignature } from "@babel/types";
import React, { FunctionComponent, useState } from "react";
import { Container, Row, Col, Dropdown, Button } from "react-bootstrap";
import "./Dataset.scss";
import { useNotebookContext } from "../NotebookContext";
import { useAuthHeader, useAuthUser } from "react-auth-kit";

const Dataset = (panel) => {
  const [selectedRing, setSelectedRing] = useState(null);
  const authHeader = useAuthHeader();
  const auth = useAuthUser();
  const user = auth();
  const {
    notebookTitle,
    setNotebookTitle,
    saveNotebook,
    savingNotebook,
    results,
    rings,
    setPanels,
  } = useNotebookContext();

  const updatePanel = async (payload) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/panels/`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const { data } = await response.json();
      const { panel } = data;
      setPanels((prev) => [
        prev.filter((prevPanel) => prevPanel.id !== panel.id),
        panel,
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container className="bg-light border p-5 mb-4">
      <Row className="justify-content-md-center mb-3">
        <Col className="d-flex justify-content-center">
          <span className="text-muted pt-2 fs-6">Select a dataset:</span>
          <Dropdown className="dataset-dropdown">
            <Dropdown.Toggle
              variant="link"
              id="dropdown-dataset"
              className="pt-2"
            >
              {selectedRing ? selectedRing.name : "None"}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {rings?.map((ring, index) => (
                <Dropdown.Item
                  key={index}
                  onClick={() => {
                    setSelectedRing(ring);
                    updatePanel({
                      ringId: ring.id,
                    });
                  }}
                >
                  <h6>{ring.name}</h6>
                  {ring.description && (
                    <p className="text-wrap">{ring.description}</p>
                  )}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
      <Row className="justify-content-md-center mb-4">
        There are a total of 1234 records.
      </Row>
      <Row className="justify-content-md-center mb-4">
        <Col className="justify-content-center d-flex">
          <Button
            variant="primary"
            size="lg"
            className="text-white rounded-3"
            disabled={!!setSelectedRing}
          >
            Start Exploring
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Dataset;
