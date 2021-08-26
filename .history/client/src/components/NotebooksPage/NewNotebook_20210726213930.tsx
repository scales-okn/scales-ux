import { Col, Container, Row } from "react-bootstrap";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridValueGetterParams,
} from "@material-ui/data-grid";
//@ts-nocheck
import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";

import Filters from "./Filters";
import { useNotebookContext } from "./NotebookContext";

type ResultsResponse = {
  activeCacheRange: Array<number>;
  batchSize: number;
  results: Array<any>;
  totalCount: number;
};

const NewNotebook: FunctionComponent = () => {
  const { columns } = useNotebookContext();
  const [resultsResponse, setResultsResponse] = useState<ResultsResponse>();
  const fetchResults = async () => {
    // setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/results/?page=0&batchSize=10&sortBy=dateFiled&sortDirection=desc&`
      );
      const data = await response.json();

      console.log(data);
      setResultsResponse(data);
    } catch (error) {
      // TODO: Implement Error handling
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return (
    <Container className="bg-light">
      <Filters />
      <Row className="p-3">
        <Col style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={resultsResponse.results}
            columns={columns.map((column) => ({
              field: column.key,
              headerName: column.nicename,
              width: 200, //column?.width,
              sortable: column.sortable,
            }))}
            pageSize={resultsResponse.batchSize}
            rowCount={resultsResponse.totalCount}
            checkboxSelection={false}
            className="bg-white"
          />
        </Col>
      </Row>
      <Row className="bg-white p-3">
        <Col>Analysis</Col>
      </Row>
    </Container>
  );
};

export default NewNotebook;
