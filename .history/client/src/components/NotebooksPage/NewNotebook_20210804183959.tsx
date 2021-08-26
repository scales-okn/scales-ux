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
import { Accordion, useAccordionButton } from "react-bootstrap";

type ResultsResponse = {
  activeCacheRange: Array<number>;
  batchSize: number;
  results: Array<any>;
  totalCount: number;
};

function ResultsToggler({ children, eventKey }) {
  const decoratedOnClick = useAccordionButton(eventKey, () =>
    console.log(eventKey)
  );

  return (
    <Button variant="link" onClick={decoratedOnClick}>
      {children}
    </Button>
  );
}

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
          {!!resultsResponse && (
            <Col>
              <></>
              <Accordion defaultActiveKey="1">
                <Accordion.Collapse eventKey="0">
                  <div style={{ height: 400, width: "100%" }}>
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
                  </div>
                </Accordion.Collapse>
                <Accordion.Collapse eventKey="1">
                  <>
                    Available data based on filters:{" "}
                    {resultsResponse.totalCount} Docket{" "}
                    {
                      <ResultsToggler eventKey="0">
                        (expand to browse data)
                      </ResultsToggler>
                    }
                  </>
                </Accordion.Collapse>
              </Accordion>
            </Col>
          )}
        </Row>
        <Row className="bg-white p-3">
          <Col>Analysis</Col>
        </Row>
      </Container>
    </Loader>
  );
};

export default NewNotebook;
