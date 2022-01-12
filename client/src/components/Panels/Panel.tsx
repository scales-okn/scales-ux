import React, { FunctionComponent, useState, useEffect } from "react";
import {
  Accordion,
  Container,
  Row,
  Col,
  Button,
  useAccordionButton,
  Form,
} from "react-bootstrap";
import { DataGrid } from "@material-ui/data-grid";
import Filters from "../Filters";
import Loader from "../Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faSave } from "@fortawesome/free-regular-svg-icons";
import Dataset from "../Dataset";
import ContentLoader from 'react-content-loader'
import type { IPanel } from "../../store/panels";
import { usePanel } from "../../store/panels";
import { useRing } from "../../store/rings";

import { StatementManager } from "../../StatementManager";

type ResultsTogglerProps = {
  children: React.ReactNode;
  eventKey: string;
}

const ResultsToggler: FunctionComponent<ResultsTogglerProps> = ({ children, eventKey }) => {
  const decoratedOnClick = useAccordionButton(eventKey, () =>
    console.log(eventKey)
  );

  return (
    <Button variant="link" size="sm" onClick={decoratedOnClick}>
      {children}
    </Button>
  );
};

type PanelProps = {
  panelId: string;
}

const Panel: FunctionComponent<PanelProps> = ({ panelId }) => {
  const { filters, panel, deletePanel, updatePanel, results, loadingPanelResults, getPanelResults } = usePanel(panelId);
  const [panelDescription, setPanelDescription] = useState(panel?.description || null);
  const { ring, info, getRingInfo, loadingRingInfo } = useRing(panel?.ringId);
  const [statements, setStatements] = useState([]);


  useEffect(() => {
    if (!ring || ring.info) return;

    getRingInfo(ring.version);
  }, [ring]);

  useEffect(() => {
    if (!info) return;
    getPanelResults();
  }, [info]);

  useEffect(() => {
    if (!info) return;
    const SM = new StatementManager(info.operations, info.analysisSpace, ring);
    setStatements(SM.generate());
  }, [info]);

  if (!panel?.ringId) return <Dataset panelId={panel.id} />;



  const rows = results?.results?.map((result, id) => ({
    ...result,
    id: `${results.page}-${id}`,
  })) || [];
  const columns = info?.columns?.map((column) => ({
    field: column.key,
    headerName: column.nicename,
    width: 200, //column?.width,
    sortable: column.sortable,
  })) || [];

  console.log(statements)

  return (
    <Loader animation="border" isVisible={loadingRingInfo}>
      <Accordion defaultActiveKey={panel.id} flush className="mb-4">
        <Accordion.Item eventKey={panel.id} key={panel.id}>
          <Accordion.Header>
            {ring.name}
            <FontAwesomeIcon
              icon={faTrashAlt}
              size="lg"
              className="text-danger ms-3 me-3 text-right"
              onClick={(event) => {
                event.preventDefault();
                deletePanel();
              }
              }
            />
            <FontAwesomeIcon
              icon={faSave}
              size="lg"
              className="text-sucess me-3 text-right"
              onClick={(event) => {
                updatePanel({ description: panelDescription, ringId: ring.id, results, filters });
              }
              }
            />
          </Accordion.Header>
          <Accordion.Body>
            <Container className="bg-light">
              <Form.Control
                // size="sm"
                type="text"
                onClick={(event) => {
                  event.stopPropagation();
                }}
                placeholder="Your Panel Description Here"
                onChange={(event) => {
                  setPanelDescription(event.target.value);
                }}
                value={panelDescription}
                className="border-0 bg-transparent ps-0 panel-description"
              />
              <Filters
                panelId={panel.id}
              />
              <Row className="p-3">
                <Loader animation="border" isVisible={false}>
                  <>
                    {results && (
                      <Col>
                        <Accordion defaultActiveKey="0">
                          <Accordion.Collapse eventKey="0">
                            <div style={{ height: 400, width: "100%" }}>
                              <DataGrid
                                onPageChange={(page) => {
                                  getPanelResults(
                                    [],
                                    // @ts-ignore
                                    page
                                  )
                                }
                                }
                                rows={rows}
                                columns={columns}
                                page={results?.page}
                                pageSize={results?.batchSize}
                                rowCount={results?.totalCount}
                                checkboxSelection={false}
                                className="bg-white border-0 rounded-0"
                              />
                            </div>
                          </Accordion.Collapse>
                          <Accordion.Collapse eventKey="1">
                            <>
                              Available data based on filters:{" "}
                              {results?.totalCount} Dockets
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
              <Row className="bg-white p-3">
                <Col>

                  <select>
                    <option>Select a Statement</option>
                    {statements.map((statement) => (
                      <option key={statement.id}>{statement.statement}</option>
                    ))}
                  </select>

                </Col>
              </Row>
            </Container>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Loader>
  );
};

export default Panel;
