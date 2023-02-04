// @ts-nocheck
import React, { useEffect, FunctionComponent, useState, useRef } from "react";
import { usePanel } from "store/panels";
import { Button, Col, Row } from "react-bootstrap";
import { Satyrn } from "statement-mananger";
import { useNotify } from "../Notifications";
import "./style.scss";
import Answers from "./Answers";
import Parameters from "./Parameters";
import Statements from "./Statements";
import _ from "lodash";
// import appendQuery from "append-query";
import ConfirmModal from "components/SharedElements/ConfirmModal";

type Props = {
  panelId: string;
  ring: IRing;
  info: IRingInfo;
};

const Analysis: FunctionComponent<Props> = ({ panelId, ring, info }) => {
  const {
    panel,
    analysis,
    addPanelAnalysis,
    removePanelAnalysis,
    setPanelAnalysisStatement,
    filters,
  } = usePanel(panelId);

  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [statements, setStatements] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [loadingAnswers, setAnswersLoading] = useState(false);
  const [loadingAutosuggestions, setLoadingAutosuggestions] =
    useState<boolean>(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<
    string[]
  >([]);
  const { notify } = useNotify();
  const [data, setData] = useState(null);
  const [satyrn, setSatyrn] = useState(null);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    if (!info) return;
    const satyrn = new Satyrn(
      info.defaultEntity,
      info.operations,
      info.analysisSpace,
      ring,
    );
    setSatyrn(satyrn);
    setStatements(satyrn.planManager.generate());
  }, [info]);

  const getStatement = (statement) => {
    return statements.find((s) => s.statement === statement);
  };

  const getAnswers = async (parameters, statement, value) => {
    try {
      setData(null);
      setAnswersLoading(true);
      const statementSrc = getStatement(statement);
      const plan = statementSrc?.plan;
      plan.rings = [ring.rid];
      // inject value on param slot path
      parameters.forEach((param) => {
        if (param.slot instanceof Array && param.slot.length > 0 && value) {
          _.set(plan, `${param.slot.join(".")}`, value);
        }
      });

      const queryFilters = filters
        ? filters?.reduce((acc, filterInput: FilterInput) => {
            acc[filterInput.type] =
              filterInput.type === "dateFiled"
                ? `[${filterInput.value?.map((date) =>
                    dayjs(date).format("YYYY-M-DD"),
                  )}]`
                : filterInput.value;

            return acc;
          }, {})
        : {};

      if (Object.keys(queryFilters).length > 0) {
        const entity = info.defaultEntity;
        plan.query = {
          AND: [
            ...Object.keys(queryFilters).map((key) => {
              return [
                {
                  entity,
                  field: key,
                },
                queryFilters[key],
                "contains",
              ];
            }),
          ],
        };
      }

      setPlan(plan);
      const response = await fetch(
        `/proxy/analysis/${ring.rid}/${ring.version}/${info?.defaultEntity}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(plan),
        },
      );
      const data = await response.json();
      setData(data);
      setAnswersLoading(false);
    } catch (error) {
      console.warn(error);
      setData(null);
      setAnswersLoading(false);
      notify("Could not fetch results", "error");
    }
  };

  const oldSelectedStatement = useRef(null);
  const oldSelectedParameter = useRef(null);

  useEffect(() => {
    const freshStatement = selectedStatement !== oldSelectedStatement;
    const freshParameter = selectedParameter !== oldSelectedParameter;

    if (selectedStatement && (freshStatement || freshParameter)) {
      getAnswers(parameters, selectedStatement, selectedParameter);
    }
  }, [selectedStatement, selectedParameter, parameters]);

  const fetchAutocompleteSuggestions = async (type, query) => {
    setLoadingAutosuggestions(true);
    setAutoCompleteSuggestions([]);
    try {
      const response = await fetch(
        `/proxy/autocomplete/${ring.rid}/${ring.version}/${info?.defaultEntity}/${type}?query=${query}`,
      );
      if (response.status === 200) {
        const data = await response.json();
        data instanceof Array && setAutoCompleteSuggestions(data);
        data?.success === false &&
          notify(
            data?.message || "Could not fetch autocomplete suggestions",
            "error",
          );
        setLoadingAutosuggestions(false);
      } else {
        notify("Could not fetch autocomplete suggestions", "error");
      }
    } catch (error) {
      console.warn(error);
      notify("Could not fetch autocomplete suggestions", "error");
    } finally {
      setLoadingAutosuggestions(false);
    }
  };

  const handleRemoveAnalysis = () => {
    removePanelAnalysis(selectedAnalysisId);
    setSelectedAnalysisId(null);
  };

  return (
    <div className="analysis">
      {analysis.length > 0 ? (
        analysis.map(({ id }) => (
          <Row key={id} className="analysis-item" style={{ padding: "16px" }}>
            <Col lg="11">
              <Statements
                statements={statements}
                setSelectedStatement={setSelectedStatement}
                selectedStatement={selectedStatement}
                setParameters={setParameters}
                getStatement={getStatement}
              />
              <Parameters
                autoCompleteSuggestions={autoCompleteSuggestions}
                parameters={parameters}
                selectedParameter={selectedParameter}
                setSelectedParameter={setSelectedParameter}
                fetchAutocompleteSuggestions={fetchAutocompleteSuggestions}
                loadingAutosuggestions={loadingAutosuggestions}
              />
            </Col>
            <Col lg="1" className="text-end">
              <Button
                size="sm"
                variant="outline-danger"
                onClick={() => setSelectedAnalysisId(id)}
              >
                Remove
              </Button>
            </Col>
            <Answers
              panelId={panelId}
              plan={plan}
              statement={getStatement(selectedStatement)}
              data={data}
              satyrn={satyrn}
              loadingAnswers={loadingAnswers}
            />
          </Row>
        ))
      ) : (
        <div>No analysis added.</div>
      )}
      <ConfirmModal
        itemName="analysis"
        open={!!selectedAnalysisId}
        setOpen={setSelectedAnalysisId}
        onConfirm={handleRemoveAnalysis}
      />
    </div>
  );
};

export default Analysis;
