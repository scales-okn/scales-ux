//@ts-nocheck
import React, { FunctionComponent, ReactNode, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNotebookContext } from "./NotebookContext";
import Filters from "./Filters";

const NewNotebook: FunctionComponent = () => {
  const { filterInputs, setFilterInputs, filters } = useNotebookContext();
  const [results, setResults] = useState([]);
  useEffect(() => {
    https://satyrn.nulab.org/api/results/?page=0&batchSize=10&sortBy=dateFiled&sortDirection=desc&
      fetch(

  })

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
