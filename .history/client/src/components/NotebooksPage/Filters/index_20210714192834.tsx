// @ts-nocheck
import React, { FunctionComponent } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Row, Col, Button } from "react-bootstrap";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Filter from "./Filter";
import { useNotebookContext } from "../NotebookContext";
import uniqid from "uniqid";
import "./styles.scss";

const Filters: FunctionComponent = () => {
  const { setFilterInputs, filterInputs } = useNotebookContext();

  return (
    <Row className="notebook-filters bg-white p-3">
      <Col>
        {filterInputs.map((filterInput, key) => (
          <Filter key={key} id={filterInput.id} type={filterInput.type} />
        ))}
        <div className="d-inline-block">
          <Button
            variant="outline-dark"
            className="me-2"
            onClick={() => {
              setFilterInputs([...filterInputs, { id: uniqid(), value: "" }]);
            }}
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
          {filterInputs.length > 0 ? (
            <Button variant="primary" className="text-white">
              Update Results
            </Button>
          ) : (
            <small>Add a filter</small>
          )}
        </div>
      </Col>
    </Row>
  );
};

export default Filters;
