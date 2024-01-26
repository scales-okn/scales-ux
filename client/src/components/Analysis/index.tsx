// @ts-nocheck
import React, { useEffect, useState } from "react";

import { usePanel } from "src/store/panels";
import { useRing } from "src/store/rings";

import { Grid, Paper, Button, Box, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import uniqid from "uniqid";
import _ from "lodash";
import { useEffectOnce } from "react-use";

import { Satyrn } from "src/models/Satyrn";
import { makeRequest } from "src/helpers/makeRequest";
import useWindowSize from "src/hooks/useWindowSize";

import DeleteButton from "src/components/Buttons/DeleteButton";
import { useNotify } from "../Notifications";
import Answers from "./Answers";
import Parameters from "./Parameters";
import Statements from "./Statements";
import { queryBuilder } from "./queryBuilder";

import "./style.scss";

type AnalysisT = {
  panelId: string;
  sessionUserCanEdit: boolean;
};

const Analysis = ({ panelId, sessionUserCanEdit }: AnalysisT) => {
  const { panel, analysis, updatePanel, filters } = usePanel(panelId);

  const { ring, info } = useRing(panel?.ringRid);

  const { width } = useWindowSize();
  const isTablet = width < 660;

  const [statementOptions, setStatementOptions] = useState([]);

  const [answersLoading, setAnswersLoading] = useState({});

  const [loadingAutosuggestions, setLoadingAutosuggestions] =
    useState<boolean>(false);

  // autocomplete suggestions related to parameters which don't seem to exist. We may want to remove this in the future.
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
    setStatementOptions(satyrnRes.planManager.generate());
  }, [info]); // eslint-disable-line react-hooks/exhaustive-deps

  const getAnswers = async (analysisId) => {
    try {
      const statementSrc = statementOptions.find((s) => {
        return s.statement === analysis[analysisId].statement;
      });

      const resPlan = statementSrc?.plan;
      resPlan.rings = [ring.rid];

      // inject value on param slot path
      analysis[analysisId]?.parameters?.forEach((param) => {
        if (
          param.slot instanceof Array &&
          param.slot.length > 0 &&
          analysis[analysisId].selectedParameter
        ) {
          _.set(
            resPlan,
            `${param.slot.join(".")}`,
            analysis[analysisId].selectedParameter,
          );
        }
      });

      resPlan.query = queryBuilder({
        filters,
        info,
      });

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
          [analysisId]: { ...analysis[analysisId], results: response },
        },
      });
      setTimeout(() => {
        setAnswersLoading(() => {
          return { ...answersLoading, [analysisId]: false };
        });
      }, 500);

      setPlans((prev) => {
        return { ...prev, [analysisId]: resPlan };
      });
    } catch (error) {
      console.error("🚀 ~ file: index.tsx:203 ~ error:", error); // eslint-disable-line no-console
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

  useEffectOnce(() => {
    // TEMP to solve data issue
    // Remove after 11/15/23
    const malformedAnalyses = Object.keys(analysis).map((a) => {
      if (analysis[a].statement?.statement) {
        return true;
      } else {
        return false;
      }
    });

    const shouldResetAnalyses = malformedAnalyses.some((a) => a === true);

    if (shouldResetAnalyses) {
      updatePanel({
        analysis: {},
      });
    }
  });

  return (
    <div className="analysis">
      {Object.keys(analysis).map((id) => {
        return (
          <Grid key={id} container sx={{ padding: "24px 2px" }}>
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
                  disabled={!sessionUserCanEdit}
                  statements={statementOptions}
                  setPanelStatement={(selectedStatement) => {
                    updatePanel({
                      analysis: {
                        ...analysis,
                        [id]: {
                          ...analysis[id],
                          ...selectedStatement,
                          results: {},
                        },
                      },
                    });
                  }}
                  selectedStatement={analysis[id]}
                />
                <Parameters
                  autoCompleteSuggestions={autoCompleteSuggestions}
                  parameters={analysis[id]?.parameters}
                  disabled={!sessionUserCanEdit}
                  selectedParameter={analysis[id]?.selectedParameter}
                  setPanelStatement={(params) => {
                    const newStatement = {
                      ...analysis[id],
                      selectedParameter: params,
                    };
                    updatePanel({
                      analysis: {
                        ...analysis,
                        [id]: {
                          ...analysis[id],
                          ...newStatement,
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
                  ...(isTablet ? { flexDirection: "column" } : {}),
                  marginTop: "16px",
                }}
              >
                <Button
                  variant="contained"
                  disabled={
                    Object.values(answersLoading).some(
                      (value) => value === true,
                    ) || !analysis[id]?.statement
                  }
                  onClick={() => getAnswers(id)}
                  sx={
                    isTablet
                      ? {
                          height: "36px",
                          width: "36px",
                          minWidth: "36px",
                          padding: 0,
                          marginBottom: "12px",
                          marginLeft: "12px",
                        }
                      : {}
                  }
                >
                  {isTablet ? <PlayCircleFilledIcon /> : "Run Analysis"}
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
          marginTop: "32px",
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
            fontWeight: "600",
            display: "inline",
            textTransform: "uppercase",
            fontSize: "14px",
          }}
        >
          Add Analysis
        </Typography>
      </Paper>
    </div>
  );
};

export default Analysis;
