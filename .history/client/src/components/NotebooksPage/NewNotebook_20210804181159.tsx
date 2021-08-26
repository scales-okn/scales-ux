import { Col, Container, Row } from "react-bootstrap";
import ReactDataGrid from "react-data-grid";
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
        <Row className="p-3">
          <Col>
            {!!resultsResponse && (
              <ReactDataGrid
                // onPageChange={(params) => fetchResults(params.page)}
                rows={resultsResponse.results}
                columns={columns.map((column) => ({
                  key: column.key,
                  name: column.nicename,
                  width: 200, //column?.width,
                  sortable: column.sortable,
                }))}
                minHeight={500}
                // pageSize={resultsResponse.batchSize}
                // rowCount={resultsResponse.totalCount}
                // checkboxSelection={false}
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
