// @ts-nocheck
import React, { useEffect, FunctionComponent, useState, useRef } from "react";
import { usePanel } from "store/panels";
import { Button, Col, Row, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import uniqid from "uniqid";
import { Satyrn } from "statement-mananger";
import { useNotify } from "../Notifications";
import "./style.scss";
import { useRing } from "../../store/rings";
import Answers from "./Answers";
import Parameters from "./Parameters";
import Statements from "./Statements";
import _ from "lodash";

type Props = {
  panelId: string;
};

const Analysis: FunctionComponent<Props> = ({ panelId }) => {
  const { panel, analysis, addPanelAnalysis, removePanelAnalysis, filters } = usePanel(panelId);

  const { ring, info } = useRing(panel?.ringId);

  const [selectedStatements, setSelectedStatements] = useState([]);
  const [selectedParameter, setSelectedParameter] = useState(null);

  const [statements, setStatements] = useState([]);
  // const [parameters, setParameters] = useState([]);

  const [loadingAnswers, setAnswersLoading] = useState(false);
  const [loadingAutosuggestions, setLoadingAutosuggestions] = useState<boolean>(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<string[]>([]);

  const [data, setData] = useState(null);
  const [satyrn, setSatyrn] = useState(null);
  const [plans, setPlans] = useState([]);

  const { notify } = useNotify();

  useEffect(() => {
    if (!info) return;
    const satyrn = new Satyrn(info.defaultEntity, info.operations, info.analysisSpace, ring);
    setSatyrn(satyrn);
    setStatements(satyrn.planManager.generate());
  }, [info]); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatement = (statement) => {
    return statements.find((s) => s.statement === statement);
  };

  const getAnswers = async (statement, id) => {
    try {
      setData(null);
      setAnswersLoading(true);
      const statementSrc = getStatement(statement.statement); // probably unnecessary
      const resPlan = statementSrc?.plan;
      resPlan.rings = [ring.rid];
      // inject value on param slot path
      statement.parameters?.forEach((param) => {
        if (param.slot instanceof Array && param.slot.length > 0 && selectedParameter) {
          _.set(resPlan, `${param.slot.join(".")}`, selectedParameter);
        }
      });

      const queryFilters = filters
        ? filters?.map((filter) => {
            if (filter.type === "dateFiled") {
              /* this will need to change once we implement multiple dateFiled filters */
              filter.value = `[${filter.value?.map((date) => dayjs(date).format("YYYY-M-DD"))}]`;
            }
            return filter;
          })
        : {};

      if (queryFilters.length > 0) {
        const entity = info.defaultEntity;
        resPlan.query = {
          /* beware of changing this, as it needs to match convertFilters in viewHelpers.py on the backend :/ */
          AND: [
            ...queryFilters.map((filter) => {
              return filter.value.includes("|")
                ? {
                    OR: [
                      ...filter.value
                        .split("|")
                        .filter((i) => i)
                        .map((or_filter_value) => {
                          return [
                            {
                              entity,
                              field: filter.type,
                            },
                            filter.type === "ontology_labels" && or_filter_value !== "" ? "|" + or_filter_value + "|" : filter.type === "case_type" ? { civil: "cv", criminal: "cr", "": "" }[or_filter_value] : or_filter_value,
                            "contains",
                          ];
                        }),
                    ],
                  }
                : [
                    {
                      entity,
                      field: filter.type,
                    },
                    filter.type === "ontology_labels" && filter.value !== "" ? "|" + filter.value + "|" : filter.type === "case_type" ? { civil: "cv", criminal: "cr", "": "" }[filter.value] : filter.value,
                    "contains",
                  ];
            }),
          ],
        };
      } else {
        resPlan.query = {};
      }
      setPlans({ ...plans, [id]: resPlan });
      const response = await fetch(`/proxy/analysis/${ring.rid}/${ring.version}/${info?.defaultEntity}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resPlan),
      });
      const resData = await response.json();
      setData({ ...data, [id]: resData });
      setAnswersLoading(false);
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
      setData(null);
      setAnswersLoading(false);
      notify("Could not fetch results", "error");
    }
  };

  // const oldSelectedStatement = useRef(null);
  // const oldSelectedParameter = useRef(null);

  // useEffect(() => {
  //   // TODO: Readd check
  //   // const freshStatement = selectedStatement !== oldSelectedStatement;
  //   // const freshParameter = selectedParameter !== oldSelectedParameter;
  //   // if (selectedStatement && (freshStatement || freshParameter)) {
  //   // getAnswers(parameters, selectedStatement, selectedParameter);
  //   // }
  // }, [selectedStatement, selectedParameter, parameters, panel.results]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAutocompleteSuggestions = async (type, query) => {
    setLoadingAutosuggestions(true);
    setAutoCompleteSuggestions([]);
    try {
      const response = await fetch(`/proxy/autocomplete/${ring.rid}/${ring.version}/${info?.defaultEntity}/${type}?query=${query}`);
      if (response.status === 200) {
        const resData = await response.json();
        resData instanceof Array && setAutoCompleteSuggestions(resData);
        resData?.success === false && notify(resData?.message || "Could not fetch autocomplete suggestions", "error");
        setLoadingAutosuggestions(false);
      } else {
        notify("Could not fetch autocomplete suggestions", "error");
      }
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
      notify("Could not fetch autocomplete suggestions", "error");
    } finally {
      setLoadingAutosuggestions(false);
    }
  };

  const handleRemoveAnalysis = (id) => {
    removePanelAnalysis(id);
  };

  return (
    <div className="analysis">
      {analysis.map(({ id }) => (
        <Row key={id} className="analysis-item" style={{ padding: "16px" }}>
          <Col lg="11">
            <Statements
              statements={statements}
              setSelectedStatement={(statement) => {
                setSelectedStatements({ ...selectedStatements, [id]: statement });
                getAnswers(statement, id);
              }}
              selectedStatement={selectedStatements[id]?.statement}
            />
            <Parameters autoCompleteSuggestions={autoCompleteSuggestions} parameters={selectedStatements[id]?.parameters} selectedParameter={selectedParameter} setSelectedParameter={setSelectedParameter} fetchAutocompleteSuggestions={fetchAutocompleteSuggestions} loadingAutosuggestions={loadingAutosuggestions} />
          </Col>
          <Col lg="1" className="text-end">
            <Button size="sm" variant="outline-danger" onClick={() => handleRemoveAnalysis(id)}>
              Remove
            </Button>
          </Col>
          <Answers panelId={panelId} plan={plans[id]} statement={selectedStatements[id]} data={data?.[id]} satyrn={satyrn} loadingAnswers={loadingAnswers} />
        </Row>
      ))}

      <Card.Footer className="d-flex align-items-center py-3">
        <Button
          variant="outline-dark"
          className="me-2"
          onClick={() => {
            addPanelAnalysis({
              id: uniqid(),
            });
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
        </Button>
        Add Analysis
      </Card.Footer>
    </div>
  );
};

export default Analysis;
