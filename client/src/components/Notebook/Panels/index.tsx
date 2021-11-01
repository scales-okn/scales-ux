import React, { FunctionComponent, useState } from "react";
import {
  Accordion,
  Container,
  Row,
  Col,
  Button,
  useAccordionButton,
  Badge,
  Form,
} from "react-bootstrap";
import { useNotebookContext } from "../NotebookContext";
import { DataGrid } from "@material-ui/data-grid";
import Filters from "../Filters";
import Loader from "../../Loader";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";

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

const Panels: FunctionComponent = () => {
  const {
    panels,
    setPanels,
    ring,
    columns,
    filterInputs,
    results,
    fetchResults,
    loadingResults,
    notebook,
    notebookTitle,
    setNotebookTitle,
    saveNotebook,
    savingNotebook,
  } = useNotebookContext();

  return (
    <Accordion defaultActiveKey="0" flush>
      {panels.map((panel, key) => {
        return (
          <Accordion.Item eventKey={key} key={key}>
            <Accordion.Header>
              {ring.name}
              <Form.Control
                // size="sm"
                type="text"
                onClick={(event) => {
                  event.stopPropagation();
                }}
                placeholder="Your Panel Description Here"
                onChange={(event) => {
                  setPanels((prevPanels) =>
                    prevPanels.map((prevPanel) => {
                      if (prevPanel.id === panel.id) {
                        return {
                          ...prevPanel,
                          description: event.target.value,
                        };
                      }
                    })
                  );
                }}
                value={panel.description}
                className="border-0 bg-transparent ps-0 panel-description"
              />

              <FontAwesomeIcon
                icon={faTrashAlt}
                className="text-danger ms-3 me-3"
                onClick={() =>
                  setPanels((prevPanels) =>
                    prevPanels.filter((prevPanel) => prevPanel.id !== panel.id)
                  )
                }
              />
            </Accordion.Header>
            <Accordion.Body>
              <Container className="bg-light">
                {/* <Row className="mb-3 p-3">
                  <Form.Group as={Col} controlId="ringState">
                    <Form.Label>Ring</Form.Label>
                    <Form.Select defaultValue={ring.name} disabled>
                      <option>Choose...</option>
                      <option selected>{ring.name}</option>
                    </Form.Select>
                  </Form.Group>
                </Row> */}
                <Filters />
                <Row className="p-3">
                  <Loader animation="border" isVisible={loadingResults}>
                    <>
                      {!!results && (
                        <Col>
                          <Accordion defaultActiveKey="0">
                            <Accordion.Collapse eventKey="0">
                              <div style={{ height: 400, width: "100%" }}>
                                <DataGrid
                                  onPageChange={(params) =>
                                    fetchResults(
                                      ring.id,
                                      filterInputs,
                                      params.page
                                    )
                                  }
                                  rows={results.results.map((result, id) => ({
                                    ...result,
                                    id: `${results.page}-${id}`,
                                  }))}
                                  columns={columns.map((column) => ({
                                    field: column.key,
                                    headerName: column.nicename,
                                    width: 200, //column?.width,
                                    sortable: column.sortable,
                                  }))}
                                  page={results.page}
                                  pageSize={results.batchSize}
                                  rowCount={results.totalCount}
                                  checkboxSelection={false}
                                  className="bg-white border-0 rounded-0"
                                />
                              </div>
                            </Accordion.Collapse>
                            <Accordion.Collapse eventKey="1">
                              <>
                                Available data based on filters:{" "}
                                {results.totalCount} Dockets
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
            </Accordion.Body>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
};

export default Panels;
