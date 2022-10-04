import React, { FunctionComponent, useState, useEffect, useContext, useMemo } from "react";
import {
  Accordion,
  Container,
  Row,
  Col,
  Button,
  useAccordionButton,
  Form,
  AccordionContext,
  Card
} from "react-bootstrap";
import { DataGrid } from "@material-ui/data-grid";
import { IconButton } from "@material-ui/core";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

import Filters from "../Filters";
import Loader from "../Loader";

import Dataset from "../Dataset";

import { usePanel } from "../../store/panels";
import { useRing } from "../../store/rings";
import Analysis from "../Analysis";
import "./Panel.scss"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import uniqid from "uniqid";

type ResultsTogglerProps = {
  children: React.ReactNode;
  eventKey: string;
  callback?: (eventKey: string) => void;
}

const ResultsToggler: FunctionComponent<ResultsTogglerProps> = ({ children, eventKey, callback }) => {
  const decoratedOnClick = useAccordionButton(eventKey, () => callback && callback(eventKey));

  return (
    <Button variant="link" size="sm" onClick={decoratedOnClick}>
      {children}
    </Button>
  );
};

type PanelProps = {
  panelId: string;
}

type AccordionToggleButtonProps = {
  eventKey: string;
  callback?: (eventKey: string) => void;
}

const AccordionToggleButton = ({ eventKey, callback }: AccordionToggleButtonProps) => {
  const { activeEventKey } = useContext(AccordionContext);
  const decoratedOnClick = useAccordionButton(
    eventKey,
    () => callback && callback(eventKey),
  );
  const isCurrentEventKey = activeEventKey === eventKey;

  return (
    <Button
      variant="outline-primary"
      size="sm"
      onClick={decoratedOnClick}
    >
      {
        isCurrentEventKey ? "Close" : "Open"
      }
    </Button>
  );
}

const Panel: FunctionComponent<PanelProps> = ({ panelId }) => {
  const {
    filters,
    panel,
    deletePanel,
    updatePanel,
    results,
    loadingPanelResults,
    getPanelResults,
    collapsed,
    setPanelResultsCollapsed,
    setPanelDescription,
    resultsCollapsed,
    setPanelCollapsed,
    addPanelAnalysis,
  } = usePanel(panelId);

  const { ring, info, getRingInfo, loadingRingInfo } = useRing(panel?.ringId);

  useEffect(() => {
    if (!ring || ring.info || loadingRingInfo) return;
    getRingInfo(ring.version);
  }, [ring]);

  useEffect(() => {
    if (!info || collapsed || loadingPanelResults) return;
    getPanelResults();
  }, [collapsed, info]);

  const onRowClick = (params, e) => {
    e.defaultMuiPrevented = true
  }

  const handleSortModelChange = (e, a) => {
    debugger; // eslint-disable-line no-debugger
  }

  const rows = results?.results?.map((result) => ({
    ...result,
    id: uniqid(),
  }));

  const columnCount = useMemo(() => {
    return info?.columns?.length;
  }, [info]);

  const dataTableWidth = useMemo(() => {
    const defaultColumnWidth = 200;
    return (defaultColumnWidth * (columnCount+1));
  }, [info]);

  const fullTableWidth = useMemo(() => {
    return (info?.includesRenderer) ? dataTableWidth + 100 : dataTableWidth;
  }, [info]);

  const columns = useMemo(() => {
    let cols = info?.columns?.map((column) => ({
      field: column.key,
      headerName: column.nicename,
      filterable: false,
      width: (dataTableWidth * (Number(column.width.replace("%", "")) / 100)) || (dataTableWidth / columnCount),
      sortable: column.sortable
    })) || [];

    if (info?.includesRenderer) {
      cols = [...cols, {
        field: "action",
        headerName: " ",
        sortable: false,
        filterable: false,
        width: 100,
        minWidth: 100,
        renderCell: (params) => {
          return (
          <IconButton
            onClick={(event) => {
                // only supports single ids for now, as that's all the document API can support too
                const idVal = Object.values(params.row.__uniqueId)[0];
                const docUrl = `/document/${ring.rid}/${ring.version}/${params.row.__entType}/${idVal}`;
                window.open(docUrl)
            }}
          >
            <OpenInNewIcon />
          </IconButton>
        )}
      }]
    }

    return cols

  }, [info]);

  if (!panel?.ringId) return <Dataset panelId={panel.id} />;
  return (
    <Accordion defaultActiveKey={collapsed === true ? null : panel.id} className="mb-4">
      <Card>
        <Card.Header className="d-flex align-items-center py-3">
          <div className="notebook-ring-name" style={{
            fontSize: "1.1rem",
          }}>
            {ring?.name}
          </div>
          <div className="ms-auto">
            <Button variant="outline-danger" size="sm" onClick={() => deletePanel()} className="me-1">Delete</Button>
            <AccordionToggleButton eventKey={panel.id} callback={() => setPanelCollapsed(!collapsed)} />
          </div>
        </Card.Header>
        <Accordion.Collapse eventKey={panel.id}>
          <>
            <Card.Body className="p-0 mx-0">
              <Form.Control
                type="textarea"
                onClick={(event) => {
                  event.stopPropagation();
                }}
                placeholder="Your Panel Description Here"
                onChange={(event) => {
                  setPanelDescription(event.target.value);
                }}
                value={panel?.description}
                style={{
                  fontSize: "0.9rem",
                }}
                className="border-0 bg-light border-bottom p-3 panel-description font-italic text-muted"
              />

              <Filters
                panelId={panel.id}
              />
              <div className="p-0 bg-light border-bottom border-top">
                <Loader animation="border" contentHeight={resultsCollapsed ? "60px" : "400px"} isVisible={loadingPanelResults}>
                  <>
                    {results && (
                      <Accordion defaultActiveKey={resultsCollapsed === true ? "results-summary" : "results"}>
                        <Accordion.Collapse eventKey="results">
                          <>
                            <div style={{ height: 400, width: "100%", overflowX: "auto" }}>
                              <DataGrid
                                onPageChange={(page) => getPanelResults([], page)}
                                rows={rows}
                                columns={columns}
                                page={results?.page}
                                rowsPerPageOptions={[10]}
                                sortingMode="server"
                                onSortModelChange={handleSortModelChange}
                                pageSize={results?.batchSize}
                                rowCount={results?.totalCount}
                                checkboxSelection={false}
                                className="bg-white border-0 rounded-0"
                                paginationMode="server"
                                style={{ width: fullTableWidth, overflowX: "auto", display: "flex", flexShrink: 0 }}
                                onRowClick={onRowClick}
                              />
                            </div>
                            {/* <div className="p-3">
                              <ResultsToggler eventKey="results-summary" callback={() => setPanelResultsCollapsed(!resultsCollapsed)}>
                                (collapse)
                              </ResultsToggler>
                            </div> */}
                          </>
                        </Accordion.Collapse>
                        <Accordion.Collapse eventKey="results-summary">
                          <div className="p-3">
                            Available data based on filters: {results?.totalCount} Dockets
                            <ResultsToggler eventKey="results" callback={() => setPanelResultsCollapsed(!resultsCollapsed)}>
                              (expand to browse data)
                            </ResultsToggler>
                          </div>
                        </Accordion.Collapse>
                      </Accordion>

                    )}
                  </>
                </Loader>
              </div>

              <div className="bg-white p-3">
                <Col>
                  <Analysis panelId={panelId} ring={ring} info={info} />
                </Col>
              </div>

            </Card.Body>
            <Card.Footer className="d-flex align-items-center py-3">
              <Button
                variant="outline-dark"
                className="me-2"
                onClick={() => {
                  addPanelAnalysis({
                    id: uniqid()
                  })
                }}
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button> Add Analysis
            </Card.Footer>
          </>
        </Accordion.Collapse>

      </Card>
    </Accordion>
  );
};

export default Panel;
