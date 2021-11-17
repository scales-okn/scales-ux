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
import appendQuery from "append-query";

import Filters from "./Filters";
import { useNotebookContext } from "./NotebookContext";
import Loader from "../Loader";
import Accordion from "react-bootstrap";

type ResultsResponse = {
  activeCacheRange: Array<number>;
  batchSize: number;
  results: Array<any>;
  totalCount: number;
};

const NewNotebook: FunctionComponent = () => {
  const { columns, filterInputs } = useNotebookContext();
  const [resultsResponse, setResultsResponse] = useState<ResultsResponse>();

  console.log(filterInputs);
  const fetchResults = async (page = 0, batchSize = 10) => {
    // setIsLoading(true);
    try {
      const response = await fetch(
        appendQuery(
          `${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/results/?page=${page}&batchSize=${batchSize}&sortBy=dateFiled&sortDirection=desc`,
          filterInputs?.reduce((acc, current) => {
            acc[current.type] = current.value;
            return acc;
          }, {})
        )
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
    <Loader animation="border" isVisible={!resultsResponse}>
      <Container className="bg-light">
        <Filters />
        <Accordion defaultActiveKey="0">
  <Accordion.Item eventKey="0">
    <Accordion.Header>Accordion Item #1</Accordion.Header>
    <Accordion.Body>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
      est laborum.
    </Accordion.Body>
  </Accordion.Item>
        <Row className="p-3">
          <Col style={{ height: 400, width: "100%" }}>
            {!!resultsResponse && (
              <DataGrid
                onPageChange={(params) => fetchResults(params.page)}
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
            )}
          </Col>
        </Row>
        <Row className="bg-white p-3">
          <Col>Analysis</Col>
        </Row>
      </Container>
    </Loader>
  );
};

export default NewNotebook;
