// @ts-nocheck
import React, { useEffect, FunctionComponent, useState } from "react";
import { usePanel } from "store/panels";
import { Button, Col, Row, Card } from "react-bootstrap";
import AddIcon from "@mui/icons-material/Add";
import uniqid from "uniqid";
// import { Satyrn } from "statement-mananger";
import { Satyrn } from "models/Satyrn";
import { useNotify } from "../Notifications";
import "./style.scss";
import { useRing } from "../../store/rings";
import Answers from "./Answers";
import Parameters from "./Parameters";
import Statements from "./Statements";
import _ from "lodash";
import { useSelector } from "react-redux";
import { authorizationHeader } from "utils";
import { authSelector } from "store/auth";

type Props = {
  panelId: string;
};

const Analysis: FunctionComponent<Props> = ({ panelId }) => {
  const { panel, analysis, addPanelAnalysis, removePanelAnalysis, filters } =
    usePanel(panelId);
  const { token } = useSelector(authSelector);

  const { ring, info } = useRing(panel?.ringId);

  const [selectedStatements, setSelectedStatements] = useState([]);

  const [statements, setStatements] = useState([]);

  const [answersLoading, setAnswersLoading] = useState(false);
  const [loadingAutosuggestions, setLoadingAutosuggestions] =
    useState<boolean>(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<
    string[]
  >([]);

  const [data, setData] = useState(null);
  const [satyrn, setSatyrn] = useState(null);
  const [plans, setPlans] = useState([]);

  const { notify } = useNotify();

  useEffect(() => {
    if (!info) return;
    const satyrnRes = new Satyrn(
      info.defaultEntity,
      info.operations,
      info.analysisSpace,
      ring,
    );
    setSatyrn(satyrnRes);
    setStatements(satyrnRes.planManager.generate());
  }, [info]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const allTrue = Object.fromEntries(
      Object.entries(answersLoading).map(([key, value]) => [key, true]),
    );
    setAnswersLoading(allTrue);

    Object.keys(selectedStatements).map((statementId) => {
      getAnswers(selectedStatements[statementId], statementId, true);
      return null;
    });
  }, [panel?.results?.results]); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatement = (statement) => {
    return statements.find((s) => s.statement === statement);
  };

  const getAnswers = async (statement, id, withoutLoading = false) => {
    try {
      setData(null);
      if (!withoutLoading) setAnswersLoading({ ...answersLoading, [id]: true });
      const statementSrc = getStatement(statement.statement); // probably unnecessary
      const resPlan = statementSrc?.plan;
      resPlan.rings = [ring.rid];
      // inject value on param slot path
      statement.parameters?.forEach((param) => {
        if (
          param.slot instanceof Array &&
          param.slot.length > 0 &&
          statement.selectedParameter
        ) {
          _.set(
            resPlan,
            `${param.slot.join(".")}`,
            statement.selectedParameter,
          );
        }
      });

      const queryFilters = filters
        ? filters?.map((filter) => {
            if (filter.type === "dateFiled") {
              /* this will need to change once we implement multiple dateFiled filters */
              filter.value = `[${filter.value?.map((date) =>
                dayjs(date).format("YYYY-M-DD"),
              )}]`;
            }
            return filter;
          })
        : {};

      const filterFunc = (filterType, filterValue) => {
        const ontologyType = filterType === "ontology_labels";
        const notEmptyString = filterValue !== "";

        return ontologyType && notEmptyString
          ? "|" + filterValue + "|"
          : filterType === "case_type"
          ? { civil: "cv", criminal: "cr", "": "" }[filterValue]
          : filterValue;
      };

      if (queryFilters.length > 0) {
        const entity = info.defaultEntity;
        resPlan.query = {
          /* beware of changing this, as it needs to match convertFilters in viewHelpers.py on the backend :/ */
          AND: [
            ...queryFilters
              .map((filter) => {
                if (!filter.value) return null;
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
                              filterFunc(filter.type, or_filter_value),
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
                      filterFunc(filter.type, filter.value),
                      "contains",
                    ];
              })
              .filter((n) => n),
          ],
        };
      } else {
        resPlan.query = {};
      }

      setPlans({ ...plans, [id]: resPlan });
      const fetchStem =
        process.env.REACT_APP_SATYRN_ENV === "development"
          ? "http://127.0.0.1:5000/api"
          : "/proxy";
      const authHeader = authorizationHeader(token);
      const response = await fetch(
        `${fetchStem}/analysis/${ring.rid}/${ring.version}/${info?.defaultEntity}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify(resPlan),
        },
      );
      const resData = await response.json();
      setData({ ...data, [id]: resData });
      setAnswersLoading({ ...answersLoading, [id]: false });
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
      setData(null);
      setAnswersLoading({ ...answersLoading, [id]: false });
      notify("Could not fetch results", "error");
    }
  };

  const fetchAutocompleteSuggestions = async (type, query) => {
    setLoadingAutosuggestions(true);
    setAutoCompleteSuggestions([]);
    try {
      const authHeader = authorizationHeader(token);
      const response = await fetch(
        `/proxy/autocomplete/${ring.rid}/${ring.version}/${info?.defaultEntity}/${type}?query=${query}`,
        {
          headers: {
            ...authHeader,
          },
        },
      );
      if (response.status === 200) {
        const resData = await response.json();
        resData instanceof Array && setAutoCompleteSuggestions(resData);
        resData?.success === false &&
          notify(
            resData?.message || "Could not fetch autocomplete suggestions",
            "error",
          );
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
                setSelectedStatements({
                  ...selectedStatements,
                  [id]: statement,
                });
                getAnswers(statement, id);
              }}
              selectedStatement={selectedStatements[id]?.statement}
            />
            <Parameters
              autoCompleteSuggestions={autoCompleteSuggestions}
              parameters={selectedStatements[id]?.parameters}
              selectedParameter={selectedStatements[id]?.selectedParameter}
              setSelectedParameter={(params) => {
                const newStatement = {
                  ...selectedStatements[id],
                  selectedParameter: params,
                };
                setSelectedStatements({
                  ...selectedStatements,
                  [id]: newStatement,
                });
                getAnswers(newStatement, id);
              }}
              fetchAutocompleteSuggestions={fetchAutocompleteSuggestions}
              loadingAutosuggestions={loadingAutosuggestions}
            />
          </Col>
          <Col lg="1" className="text-end">
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => handleRemoveAnalysis(id)}
            >
              Remove
            </Button>
          </Col>
          <Answers
            panelId={panelId}
            plan={plans[id]}
            statement={selectedStatements[id]}
            data={data?.[id]}
            satyrn={satyrn}
            loadingAnswers={answersLoading[id]}
          />
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
          <AddIcon fontSize="medium" />
        </Button>
        Add Analysis
      </Card.Footer>
    </div>
  );
};

export default Analysis;
