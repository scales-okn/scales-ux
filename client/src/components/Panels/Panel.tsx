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
import { StatementManager } from "../../StatementManager";
import { ringsSelector } from "../../store/rings";
import { useSelector, useDispatch } from "react-redux";
import { fetchRings } from "../../store/rings";
import { infoSelector } from "../../store/info";
import appendQuery from "append-query";
import dayjs from "dayjs";
import { deletePanel, updatePanel } from "../../store/panels";

const ResultsToggler = ({ children, eventKey }) => {
  const decoratedOnClick = useAccordionButton(eventKey, () =>
    console.log(eventKey)
  );

  return (
    <Button variant="link" size="sm" onClick={decoratedOnClick}>
      {children}
    </Button>
  );
};

const TableContentLoader = <ContentLoader
  width={1500}
  height={400}
  viewBox="0 0 1500 400"
  backgroundColor="#f3f3f3"
  foregroundColor="#ecebeb"

>
  <rect x="27" y="139" rx="4" ry="4" width="20" height="20" />
  <rect x="67" y="140" rx="10" ry="10" width="85" height="19" />
  <rect x="188" y="141" rx="10" ry="10" width="169" height="19" />
  <rect x="402" y="140" rx="10" ry="10" width="85" height="19" />
  <rect x="523" y="141" rx="10" ry="10" width="169" height="19" />
  <rect x="731" y="139" rx="10" ry="10" width="85" height="19" />
  <rect x="852" y="138" rx="10" ry="10" width="85" height="19" />
  <rect x="1424" y="137" rx="10" ry="10" width="68" height="19" />
  <rect x="26" y="196" rx="4" ry="4" width="20" height="20" />
  <rect x="66" y="197" rx="10" ry="10" width="85" height="19" />
  <rect x="187" y="198" rx="10" ry="10" width="169" height="19" />
  <rect x="401" y="197" rx="10" ry="10" width="85" height="19" />
  <rect x="522" y="198" rx="10" ry="10" width="169" height="19" />
  <rect x="730" y="196" rx="10" ry="10" width="85" height="19" />
  <rect x="851" y="195" rx="10" ry="10" width="85" height="19" />
  <circle cx="1456" cy="203" r="12" />
  <rect x="26" y="258" rx="4" ry="4" width="20" height="20" />
  <rect x="66" y="259" rx="10" ry="10" width="85" height="19" />
  <rect x="187" y="260" rx="10" ry="10" width="169" height="19" />
  <rect x="401" y="259" rx="10" ry="10" width="85" height="19" />
  <rect x="522" y="260" rx="10" ry="10" width="169" height="19" />
  <rect x="730" y="258" rx="10" ry="10" width="85" height="19" />
  <rect x="851" y="257" rx="10" ry="10" width="85" height="19" />
  <circle cx="1456" cy="265" r="12" />
  <rect x="26" y="316" rx="4" ry="4" width="20" height="20" />
  <rect x="66" y="317" rx="10" ry="10" width="85" height="19" />
  <rect x="187" y="318" rx="10" ry="10" width="169" height="19" />
  <rect x="401" y="317" rx="10" ry="10" width="85" height="19" />
  <rect x="522" y="318" rx="10" ry="10" width="169" height="19" />
  <rect x="730" y="316" rx="10" ry="10" width="85" height="19" />
  <rect x="851" y="315" rx="10" ry="10" width="85" height="19" />
  <circle cx="1456" cy="323" r="12" />
  <rect x="26" y="379" rx="4" ry="4" width="20" height="20" />
  <rect x="66" y="380" rx="10" ry="10" width="85" height="19" />
  <rect x="187" y="381" rx="10" ry="10" width="169" height="19" />
  <rect x="401" y="380" rx="10" ry="10" width="85" height="19" />
  <rect x="522" y="381" rx="10" ry="10" width="169" height="19" />
  <rect x="730" y="379" rx="10" ry="10" width="85" height="19" />
  <rect x="851" y="378" rx="10" ry="10" width="85" height="19" />
  <circle cx="1456" cy="386" r="12" />
  <rect x="978" y="138" rx="10" ry="10" width="169" height="19" />
  <rect x="977" y="195" rx="10" ry="10" width="169" height="19" />
  <rect x="977" y="257" rx="10" ry="10" width="169" height="19" />
  <rect x="977" y="315" rx="10" ry="10" width="169" height="19" />
  <rect x="977" y="378" rx="10" ry="10" width="169" height="19" />
  <rect x="1183" y="139" rx="10" ry="10" width="85" height="19" />
  <rect x="1182" y="196" rx="10" ry="10" width="85" height="19" />
  <rect x="1182" y="258" rx="10" ry="10" width="85" height="19" />
  <rect x="1182" y="316" rx="10" ry="10" width="85" height="19" />
  <rect x="1182" y="379" rx="10" ry="10" width="85" height="19" />
  <rect x="1305" y="137" rx="10" ry="10" width="85" height="19" />
  <rect x="1304" y="194" rx="10" ry="10" width="85" height="19" />
  <rect x="1304" y="256" rx="10" ry="10" width="85" height="19" />
  <rect x="1304" y="314" rx="10" ry="10" width="85" height="19" />
  <rect x="1304" y="377" rx="10" ry="10" width="85" height="19" />
  <circle cx="37" cy="97" r="11" />
  <rect x="26" y="23" rx="5" ry="5" width="153" height="30" />
  <circle cx="1316" cy="88" r="11" />
  <rect x="1337" y="94" rx="0" ry="0" width="134" height="3" />
  <circle cx="77" cy="96" r="11" />
</ContentLoader>;


export type FilterInput = {
  id: string;
  value: string | number;
  type: string;
};


const Panel = ({ panel }) => {
  const [selectedRing, setSelectedRing] = useState(null);
  const [panelDescription, setPanelDescription] = useState(panel?.description || null);
  const [loadingResults, setLoadingResults] = useState(false);
  const dispatch = useDispatch();
  const [results, setResults] = useState(null);
  const { info, hasErrors, loadingInfo } = useSelector(infoSelector);
  const { filters = [], columns = [], defaultEntity } = info;
  const { rings, loadingRings } = useSelector(ringsSelector);
  const [filterInputs, setFilterInputs] = useState([]);

  const fetchResults = async (
    ring,
    filterInputs: [],
    page = 0,
    batchSize = 10
  ) => {
    setLoadingResults(true);
    try {
      const response = await fetch(
        appendQuery(
          `${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/results/${ring.rid}/1/${defaultEntity}?page=${page}&batchSize=${batchSize}&sortBy=dateFiled&sortDirection=desc`,
          filterInputs?.reduce((acc, filterInput: FilterInput) => {
            acc[filterInput.type] =
              filterInput.type === "dateFiled"
                ? //@ts-ignore
                //   filterInput.value?.map((date) =>
                //   dayjs(date).format("YYYY-MM-DD")
                // )
                //@ts-ignore
                `[${filterInput.value?.map((date) =>
                  dayjs(date).format("YYYY-M-DD")
                )}]`
                : filterInput.value;

            return acc;
          }, {}),
          { encodeComponents: false }
        )
      );
      const data = await response.json();

      setResults(data);
      setLoadingResults(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    dispatch(fetchRings());
  }, []);

  useEffect(() => {
    if (panel.ringId) {
      setSelectedRing(rings.find((ring) => ring.id === panel.ringId));
    }
  }, [rings]);

  useEffect(() => {
    if (selectedRing) {
      //@ts-ignore
      fetchResults(selectedRing, filterInputs);
    }
  }, [selectedRing, filterInputs]);


  if (!selectedRing) return <Dataset panel={panel} setSelectedRing={setSelectedRing} selectedRing={selectedRing} />;

  const SM = new StatementManager();
  console.log(SM);

  return (
    <Accordion defaultActiveKey={panel.id} flush className="mb-4">
      <Accordion.Item eventKey={panel.id} key={panel.id}>
        <Accordion.Header>
          {selectedRing.name}
          <FontAwesomeIcon
            icon={faTrashAlt}
            size="lg"
            className="text-danger ms-3 me-3 text-right"
            onClick={(event) => {
              event.preventDefault();
              dispatch(deletePanel(panel.id));
              setSelectedRing(null);
            }
            }
          />
          <FontAwesomeIcon
            icon={faSave}
            size="lg"
            className="text-sucess me-3 text-right"
            onClick={(event) => {
              event.preventDefault();
              dispatch(updatePanel(panel.id, { description: panelDescription, ringId: selectedRing.id }));
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
              // @ts-ignore
              selectedRing={selectedRing}
              fetchResults={fetchResults}
              filterInputs={filterInputs}
              setFilterInputs={setFilterInputs}
            />
            <Row className="p-3">
              <Loader animation="border" isVisible={loadingResults} loaderContent={TableContentLoader}>
                <>
                  {!!results && (
                    <Col>
                      <Accordion defaultActiveKey="0">
                        <Accordion.Collapse eventKey="0">
                          <div style={{ height: 400, width: "100%" }}>
                            <DataGrid
                              // onPageChange={(params) => { }
                              //   // fetchResults(
                              //   //   selectedRing,
                              //   //   filterInputs,
                              //   //   // @ts-ignore
                              //   //   params.page
                              //   // )
                              // }
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
    </Accordion>
  );
};

export default Panel;
