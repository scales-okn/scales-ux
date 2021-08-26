import { Col, Container, Row } from "react-bootstrap";
//@ts-nocheck
import React, { FunctionComponent, ReactNode, useState } from "react";

import Filters from "./Filters";
import { useNotebookContext } from "./NotebookContext";

const NewNotebook: FunctionComponent = () => {
  const { filterInputs, setFilterInputs, filters } = useNotebookContext();
  const [results, setResults] = useState([]);
  const fetchResults = async (type, query) => {
    // setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/results/?page=0&batchSize=10&sortBy=dateFiled&sortDirection=desc&`
      );
      const data = await response.json();

      setAutoCompleteSuggestions(
        data.map((value) => ({ label: value, value }))
      );
      // setIsLoading(false);
    } catch (error) {
      // TODO: Impelment Error handling
    }
  };

  return (
    <Container className="bg-light">
      <Filters />
      <Row className="p-3">
        <Col>Results</Col>
      </Row>
      <Row className="bg-white p-3">
        <Col>Analysis</Col>
      </Row>
    </Container>
  );
};

export default NewNotebook;
