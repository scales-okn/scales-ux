import React, { FunctionComponent } from "react";
import { Container, Row, Col, Dropdown, Button } from "react-bootstrap";
import Loader from "../Loader";
import { usePanel } from "../../store/panels";
import type { IPanel } from "../../store/panels";
import { useRing, useRings } from "../../store/rings";
import "./Dataset.scss";

type DatasetProps = {
  panelId: string;
};

const Dataset: FunctionComponent<DatasetProps> = ({ panelId }) => {
  const { panel, updatePanel } = usePanel(panelId);
  const { rings, loadingRings } = useRings();
  const { ring, loadingRingInfo, info } = useRing(panel.ringId);

  return (
    <Loader animation="border" isVisible={loadingRings}>
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
                {ring ? ring.name : "None"}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {rings?.map((ring, index) => (
                  <Dropdown.Item
                    key={index}
                    onClick={() => {
                      updatePanel({ ringId: ring.id });
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

        <Loader animation="border" isVisible={ring && loadingRingInfo}>
          <Row className="justify-content-md-center mb-4 mt-3">
            <Col className="justify-content-center d-flex">
              <Button
                variant="primary"
                size="lg"
                className="text-white rounded-3"
                disabled={!info}
              >
                Start Exploring
              </Button>
            </Col>
          </Row>
        </Loader>
      </Container>
    </Loader>
  );
};

export default Dataset;
