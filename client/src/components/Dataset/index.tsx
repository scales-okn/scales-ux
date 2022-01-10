import { tsIndexSignature } from "@babel/types";
import React, { FunctionComponent, useState, useEffect } from "react";
import { Container, Row, Col, Dropdown, Button } from "react-bootstrap";
import Loader from "../Loader";
import { useDispatch, useSelector } from "react-redux";
import { fetchInfo, infoSelector } from "../../store/info";
import "./Dataset.scss";
import { ringsSelector } from "../../store/rings";
import { updatePanel } from "../../store/panels";

const Dataset = ({ panel, selectedRing, setSelectedRing }) => {
  const dispatch = useDispatch();
  const { info, loadingInfo, hasErrors } = useSelector(infoSelector);
  const { rings, loadingRings } = useSelector(ringsSelector);

  useEffect(() => {
    if (!selectedRing) return;
    dispatch(fetchInfo(selectedRing.rid));
  }, [selectedRing]);

  useEffect(() => {
    if (!Object.keys(info).length || !selectedRing) return;
  }, [info, selectedRing]);

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
                    dispatch(updatePanel(panel.id, { rid: ring.rid }));
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

      <Loader animation="border" isVisible={selectedRing && loadingInfo}>
        <Row className="justify-content-md-center mb-4 mt-3">
          <Col className="justify-content-center d-flex">
            <Button
              variant="primary"
              size="lg"
              className="text-white rounded-3"
              disabled={!Object.keys(info).length}
              onClick={() => {
                // setShowResults(true);
              }}
            >
              Start Exploring
            </Button>
          </Col>
        </Row>
      </Loader>
    </Container>
  );
};

export default Dataset;
