import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import {
  Col,
  Container,
  Row,
  Accordion,
  useAccordionButton,
  Button,
  Form,
  ListGroup,
} from "react-bootstrap";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridValueGetterParams,
} from "@material-ui/data-grid";
import Filters from "./Filters";
import { useNotebookContext } from "./NotebookContext";
import Loader from "../Loader";
import "./Notebook.scss";

function ResultsToggler({ children, eventKey }) {
  const decoratedOnClick = useAccordionButton(eventKey, () =>
    console.log(eventKey)
  );

  return (
    <Button variant="link" size="sm" onClick={decoratedOnClick}>
      {children}
    </Button>
  );
}

const Notebook: FunctionComponent = () => {
  const {
    columns,
    filterInputs,
    results,
    fetchResults,
    loadingResults,
    notebook,
  } = useNotebookContext();

  const [notebookTitle, setNotebookTitle] = useState(
    notebook?.title || "New Notebook"
  );

  return (
    <Loader animation="border" isVisible={!results}>
      <>
        <div className="mb-3">
          <Form.Control
            size="lg"
            type="text"
            placeholder="Your Notebook Title Here"
            onChange={(event) => {
              setNotebookTitle(event.target.value);
            }}
            value={notebookTitle}
            className="border-0 bg-transparent ps-0 notebook-title"
          />
        </div>
        <Container className="bg-light">
          <Filters />

          <Row className="p-3">
            <Loader animation="border" isVisible={loadingResults}>
              <>
                {!!results && (
                  <Col>
                    <Accordion defaultActiveKey="1">
                      <Accordion.Collapse eventKey="0">
                        <div style={{ height: 400, width: "100%" }}>
                          <DataGrid
                            onPageChange={(params) =>
                              fetchResults(filterInputs, params.page)
                            }
                            rows={results.results}
                            columns={columns.map((column) => ({
                              field: column.key,
                              headerName: column.nicename,
                              width: 200, //column?.width,
                              sortable: column.sortable,
                            }))}
                            pageSize={results.batchSize}
                            rowCount={results.totalCount}
                            checkboxSelection={false}
                            className="bg-white border-0 rounded-0"
                          />
                        </div>
                      </Accordion.Collapse>
                      <Accordion.Collapse eventKey="1">
                        <>
                          Available data based on filters: {results.totalCount}{" "}
                          Dockets
                          <ResultsToggler eventKey="0">
                            (expand to browse data)
                          </ResultsToggler>
                        </>
                      </Accordion.Collapse>
                    </Accordion>
                  </Col>
                )}
              </>
            </Loader>
          </Row>
          <Row className="bg-white p-3">
            <Col>Analysis</Col>
          </Row>
        </Container>
      </>
    </Loader>
  );
};

export default Notebook;
