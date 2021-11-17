import { Col, Container, Row } from "react-bootstrap";
//@ts-nocheck
import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";

import Filters from "./Filters";
import { useNotebookContext } from "./NotebookContext";

const columns = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "caseName", headerName: "caseName", width: 200 },
  { field: "circuit", headerName: "circuit", width: 200 },
  { field: "dateFiled", headerName: "dateFiled", width: 210 },
  { field: "role", headerName: "Role", width: 140 },
];

const NewNotebook: FunctionComponent = () => {
  const { filterInputs, setFilterInputs, filters } = useNotebookContext();
  const [results, setResults] = useState([]);
  const fetchResults = async () => {
    // setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/results/?page=0&batchSize=10&sortBy=dateFiled&sortDirection=desc&`
      );
      const data = await response.json();

      console.log(data);
    } catch (error) {
      // TODO: Impelment Error handling
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

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
