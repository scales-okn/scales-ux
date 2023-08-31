import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";

import { usePanel } from "store/panels";
import { useRing } from "store/rings";

import {
  Accordion,
  Col,
  useAccordionButton,
  Form,
  AccordionContext,
  Card,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import uniqid from "uniqid";

import Filters from "../Filters";
import Loader from "../Loader";
import Dataset from "../Dataset";
import Analysis from "../Analysis";

import ConfirmModal from "components/Modals/ConfirmModal";
import StandardButton from "components/Buttons/StandardButton";
import ColumnHeader from "components/ColumnHeader";

import "./Panel.scss";

type ResultsTogglerProps = {
  children: React.ReactNode;
  eventKey: string;
  callback?: (eventKey: string) => void;
};

const ResultsToggler: FunctionComponent<ResultsTogglerProps> = ({
  children,
  eventKey,
  callback,
}) => {
  const decoratedOnClick = useAccordionButton(
    eventKey,
    () => callback && callback(eventKey),
  );

  return (
    <StandardButton variant="link" size="sm" onClick={decoratedOnClick}>
      {children}
    </StandardButton>
  );
};

type PanelProps = {
  panelId: string;
};

type AccordionToggleButtonProps = {
  eventKey: string;
  callback?: (eventKey: string) => void;
};

const AccordionToggleButton = ({
  eventKey,
  callback,
}: AccordionToggleButtonProps) => {
  const { activeEventKey } = useContext(AccordionContext);
  const decoratedOnClick = useAccordionButton(
    eventKey,
    () => callback && callback(eventKey),
  );
  const isCurrentEventKey = activeEventKey === eventKey;

  return (
    <StandardButton
      variant="outline-primary"
      size="sm"
      onClick={decoratedOnClick}
    >
      {isCurrentEventKey ? "Close" : "Open"}
    </StandardButton>
  );
};

const Panel: FunctionComponent<PanelProps> = ({ panelId }) => {
  const {
    panel,
    deletePanel,
    results,
    loadingPanelResults,
    getPanelResults,
    collapsed,
    setPanelResultsCollapsed,
    setPanelDescription,
    resultsCollapsed,
    setPanelCollapsed,
  } = usePanel(panelId);

  const { ring, info, getRingInfo, loadingRingInfo } = useRing(panel?.ringId);

  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    if (!ring || ring.info || loadingRingInfo) return;
    getRingInfo(ring.version);
  }, [ring]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // if (!info || collapsed || loadingPanelResults) return;
    if (!info || collapsed) return;
    getPanelResults();
  }, [collapsed, info]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = results?.results?.map((result) => ({
    ...result,
    id: uniqid(),
  }));

  const columns = useMemo(() => {
    const out =
      info?.columns
        ?.filter((c) => c.key !== "case_id")
        ?.map((column) => ({
          field: column.key,
          headerName: column.nicename,
          width: 200,
          sortable: false,
          renderHeader: (params) => {
            return (
              <ColumnHeader
                title={params.colDef.headerName}
                dataKey={params.colDef.field}
                withTooltip
              />
            );
          },
        })) || [];

    out.unshift({
      field: "button",
      headerName: "Docket ID",
      sortable: false,
      width: 180,
      renderCell: (item) => {
        return (
          <Link
            to={`/document/${ring.rid}/${ring.version}/Case/${item.row.__uniqueId.ucid}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.row.case_id}
          </Link>
        );
      },
      renderHeader: (params) => {
        return (
          <ColumnHeader
            title={params.colDef.headerName}
            dataKey="case_id"
            withTooltip
          />
        );
      },
    });

    return out;
  }, [info, ring]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!panel?.ringId) return <Dataset panelId={panel.id} />;

  return (
    <Accordion
      defaultActiveKey={collapsed === true ? null : panel.id}
      className="mb-4"
    >
      <Card>
        <Card.Header className="d-flex align-items-center py-3">
          <div
            className="notebook-ring-name"
            style={{
              fontSize: "1.1rem",
            }}
          >
            {ring?.name}
          </div>
          <div className="ms-auto">
            <StandardButton
              variant="outline-danger"
              size="sm"
              onClick={() => setConfirmVisible(true)}
              className="me-1"
            >
              Delete
            </StandardButton>
            <AccordionToggleButton
              eventKey={panel.id}
              callback={() => setPanelCollapsed(!collapsed)}
            />
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
                value={panel?.description || ""}
                style={{
                  fontSize: "0.9rem",
                }}
                className="border-0 bg-light border-bottom p-3 panel-description font-italic text-muted"
              />

              <Filters panelId={panel.id} />
              <div className="p-0 bg-light border-bottom border-top">
                <Loader
                  animation="border"
                  contentHeight={resultsCollapsed ? "60px" : "400px"}
                  isVisible={loadingPanelResults}
                >
                  <>
                    {results && (
                      <Accordion
                        defaultActiveKey={
                          resultsCollapsed === true
                            ? "results-summary"
                            : "results"
                        }
                      >
                        <Accordion.Collapse eventKey="results">
                          <>
                            <div
                              style={{
                                width: "100%",
                                overflowX: "hidden",
                              }}
                            >
                              {!resultsCollapsed && (
                                <DataGrid
                                  rows={rows}
                                  onPaginationModelChange={(model) => {
                                    getPanelResults([], model.page);
                                  }}
                                  paginationModel={{
                                    page: results?.page,
                                    pageSize: results?.batchSize,
                                  }}
                                  disableColumnMenu
                                  disableColumnFilter
                                  pageSizeOptions={[10]}
                                  columns={columns}
                                  rowCount={results?.totalCount}
                                  checkboxSelection={false}
                                  className="bg-white border-0 rounded-0"
                                  paginationMode="server"
                                />
                              )}
                            </div>
                            <div className="p-3">
                              {results?.totalCount?.toLocaleString()} Dockets
                              Found
                              <ResultsToggler
                                eventKey="results-summary"
                                callback={() =>
                                  setPanelResultsCollapsed(!resultsCollapsed)
                                }
                              >
                                (collapse)
                              </ResultsToggler>
                            </div>
                          </>
                        </Accordion.Collapse>
                        <Accordion.Collapse eventKey="results-summary">
                          <div className="p-3">
                            Available data based on filters:{" "}
                            {results?.totalCount?.toLocaleString()} Dockets
                            <ResultsToggler
                              eventKey="results"
                              callback={() =>
                                setPanelResultsCollapsed(!resultsCollapsed)
                              }
                            >
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
                  <Analysis panelId={panelId} />
                </Col>
              </div>
            </Card.Body>
          </>
        </Accordion.Collapse>
      </Card>
      <ConfirmModal
        itemName="panel"
        open={confirmVisible}
        setOpen={setConfirmVisible}
        onConfirm={deletePanel}
      />
    </Accordion>
  );
};

export default Panel;
