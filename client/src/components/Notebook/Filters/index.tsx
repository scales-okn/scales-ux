import React, { FunctionComponent } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Filter from "./Filter";

import uniqid from "uniqid";
import { useNotebookContext } from "../NotebookContext";

const Filters: FunctionComponent = () => {
  const {
    ring,
    setFilterInputs,
    filterInputs = [],
    fetchResults,
  } = useNotebookContext();

  return (
    <Row className="notebook-filters bg-white p-3 pt-4">
      <Col>
        {filterInputs.map((filterInput, key) => (
          <Filter key={key} filterInput={filterInput} />
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
            <Button
              variant="primary"
              className="text-white"
              onClick={() => fetchResults(ring, filterInputs)}
            >
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
