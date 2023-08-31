import React, { FunctionComponent, useEffect, useState } from "react";
import { Container, Row, Col, Dropdown } from "react-bootstrap";
import Loader from "../Loader";
import { usePanel } from "store/panels";
import { useRing, useRings } from "store/rings";

import StandardButton from "components/Buttons/StandardButton";

import "./Dataset.scss";

type DatasetProps = {
  panelId: string;
};

const Dataset: FunctionComponent<DatasetProps> = ({ panelId }) => {
  const { updatePanel, setPanelCollapsed } = usePanel(panelId);
  const { rings, loadingRings } = useRings();
  const [selectedRing, setSelectedRing] = useState(null);
  const { ring, loadingRingInfo, info, getRingInfo } = useRing(
    selectedRing?.id,
  );

  useEffect(() => {
    const defaultRing = rings.reduce((prev, curr) => {
      return prev.id < curr.id ? prev : curr;
    });
    if (defaultRing) {
      setSelectedRing(defaultRing);
    }
  }, [rings]);

  useEffect(() => {
    if (!ring || info) return;
    getRingInfo(ring.version);
  }, [selectedRing]); // eslint-disable-line react-hooks/exhaustive-deps

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
                {selectedRing ? selectedRing.name : "None"}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {rings?.map((ring, index) => (
                  <Dropdown.Item
                    key={index}
                    onClick={() => {
                      setSelectedRing(ring);
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
              <StandardButton
                variant="primary"
                size="lg"
                className="text-white rounded-3"
                disabled={!info}
                onClick={() => {
                  updatePanel({ ringId: selectedRing.id });
                  setPanelCollapsed(false);
                }}
              >
                Start Exploring
              </StandardButton>
            </Col>
          </Row>
        </Loader>
      </Container>
    </Loader>
  );
};

export default Dataset;
