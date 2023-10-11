// @ts-nocheck
import React, { useEffect, FunctionComponent, useState } from "react";

import { usePanel } from "src/store/panels";
import { useRing } from "src/store/rings";
import { useSessionUser } from "src/store/auth";

import { Grid, Paper, Button, Box, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import uniqid from "uniqid";
import _ from "lodash";

import { Satyrn } from "src/models/Satyrn";
import { makeRequest } from "src/helpers/makeRequest";

import DeleteButton from "src/components/Buttons/DeleteButton";
import { useNotify } from "../Notifications";
import Answers from "./Answers";
import Parameters from "./Parameters";
import Statements from "./Statements";

import "./style.scss";

type Props = {
  panelId: string;
};

const Analysis: FunctionComponent<Props> = ({ panelId }) => {
  const { panel, analysis, updatePanel, filters } = usePanel(panelId);

  const { ring, info } = useRing(panel?.ringId);

  const sessionUser = useSessionUser();
  const sessionUserCanEdit = sessionUser?.id === panel?.userId;

  const [statements, setStatements] = useState([]);

  const [answersLoading, setAnswersLoading] = useState({});

  const [loadingAutosuggestions, setLoadingAutosuggestions] =
    useState<boolean>(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<
    string[]
  >([]);

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

  // useEffect(() => {
  //   if (_.isEmpty(statements) || !info) return;

  //   Object.keys(analysis).map((statementId) => {
  //     const noExistingResults = _.isEmpty(analysis[statementId].results);
  //     const hasStatement = analysis[statementId].statement;

  //     if (hasStatement) {
  //       getAnswers(analysis[statementId], statementId, !noExistingResults);
  //     }
  //     return null;
  //   });
  // }, [info, statements]); // eslint-disable-line react-hooks/exhaustive-deps

  const getAnswers = async (statement, analysisId, skipFetch = false) => {
    try {
      const statementSrc = statements.find((s) => {
        // TODO: hacky, why does this vary?
        return (
          s.statement === statement.statement.statement ||
          s.statement === statement.statement
        );
      });

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

      if (!skipFetch) {
        setAnswersLoading(() => {
          return { ...answersLoading, [analysisId]: true };
        });

        const fetchStem =
          import.meta.env.VITE_REACT_APP_SATYRN_ENV === "development"
            ? "http://127.0.0.1:5000/api"
            : "/proxy";

        const response = await makeRequest.post(
          `${fetchStem}/analysis/${ring.rid}/${ring.version}/${info?.defaultEntity}/`,
          resPlan,
        );

        updatePanel({
          analysis: {
            ...analysis,
            [analysisId]: { ...statement, results: response },
          },
        });
        setTimeout(() => {
          setAnswersLoading(() => {
            return { ...answersLoading, [analysisId]: false };
          });
        }, 500);
      }

      setPlans((prev) => {
        return { ...prev, [analysisId]: resPlan };
      });
    } catch (error) {
      console.log("🚀 ~ file: index.tsx:203 ~ error:", error); // eslint-disable-line no-console
      setAnswersLoading(() => {
        return { ...answersLoading, [analysisId]: false };
      });
      notify("Could not fetch results", "error");
    }
  };

  const fetchAutocompleteSuggestions = async (type, query) => {
    setLoadingAutosuggestions(true);
    setAutoCompleteSuggestions([]);
    try {
      const response = await makeRequest.get(
        `/proxy/autocomplete/${ring.rid}/${ring.version}/${info?.defaultEntity}/${type}?query=${query}`,
      );

      // TODO: Do we need this?
      if (response.status === "OK") {
        response instanceof Array && setAutoCompleteSuggestions(response);
        response?.success === false &&
          notify(
            response?.message || "Could not fetch autocomplete suggestions",
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
    updatePanel({ analysis: _.omit(analysis, id) });
  };

  return (
    <div className="analysis">
      {Object.keys(analysis).map((id) => {
        console.log(analysis[id]);
        return (
          <Grid key={id} container className="analysis-item">
            <Grid
              item
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                width: "100%",
                padding: 0,
              }}
            >
              <Grid item sm={8}>
                <Statements
                  statements={statements}
                  setPanelStatement={(statement) => {
                    updatePanel({
                      analysis: {
                        ...analysis,
                        [id]: { ...analysis[id], statement, results: {} },
                      },
                    });
                  }}
                  selectedStatement={analysis[id].statement}
                />
                <Parameters
                  autoCompleteSuggestions={autoCompleteSuggestions}
                  parameters={analysis[id]?.parameters}
                  selectedParameter={analysis[id]?.selectedParameter}
                  setPanelStatement={(params) => {
                    const newStatement = {
                      ...analysis[id].statement,
                      parameters: params,
                    };
                    updatePanel({
                      analysis: {
                        ...analysis,
                        [id]: {
                          ...analysis[id],
                          statement: newStatement,
                          results: {},
                        },
                      },
                    });
                  }}
                  fetchAutocompleteSuggestions={fetchAutocompleteSuggestions}
                  loadingAutosuggestions={loadingAutosuggestions}
                />
              </Grid>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "16px",
                }}
              >
                <Button
                  variant="contained"
                  disabled={
                    Object.values(answersLoading).some(
                      (value) => value === true,
                    ) || !analysis[id].statement
                  }
                  onClick={() => getAnswers(analysis[id], id)}
                >
                  Run Analysis
                </Button>
                <DeleteButton
                  onClick={() => handleRemoveAnalysis(id)}
                  disabled={!sessionUserCanEdit}
                  sx={{
                    marginLeft: "12px",
                  }}
                  variant="outlined"
                  titleAddon="Analysis"
                />
              </Box>
            </Grid>

            <Answers
              panelId={panelId}
              plan={plans[id]}
              statement={analysis[id]}
              data={analysis[id].results}
              satyrn={satyrn}
              loadingAnswers={answersLoading[id]}
            />
          </Grid>
        );
      })}

      <Paper
        elevation={3}
        sx={{
          paddingLeft: "8px",
          boxShadow: "none",
          alignItems: "center",
          marginTop: "12px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Button
          variant="outlined"
          onClick={() => {
            updatePanel({
              analysis: {
                ...analysis,
                [uniqid()]: {},
              },
            });
          }}
          disabled={!sessionUserCanEdit}
          sx={{
            border: "1px solid black",
            color: "black",
            marginRight: "12px",
            width: "36px",
            height: "36px",
            minWidth: 0,
          }}
        >
          <AddIcon fontSize="medium" />
        </Button>
        <Typography
          sx={{
            color: sessionUserCanEdit ? "black" : "GrayText",
          }}
        >
          Add Analysis
        </Typography>
      </Paper>
    </div>
  );
};

export default Analysis;
