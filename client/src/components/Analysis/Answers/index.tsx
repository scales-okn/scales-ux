import React, { memo, useEffect, useState, useRef, useMemo } from "react";
import { usePanel } from "src/store/panels";

import { css } from "@emotion/css";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import { Button, Tooltip, Typography, Box } from "@mui/material";
import { CameraAlt, UnfoldLess, UnfoldMore } from "@mui/icons-material";
import * as htmlToImage from "html-to-image";
import download from "downloadjs";

import renderHTML from "src/helpers/renderHTML";
import useContainerDimensions from "src/hooks/useContainerDimensions";

import Loader from "src/components/Loader";
import MultilineChartDisplay from "./MultilineChartDisplay";
import LineChartDisplay from "./LineChartDisplay";
import BarChartDisplay from "./BarChartDisplay";

const Answers = ({
  panelId,
  data,
  satyrn,
  loadingAnswers,
  statement,
  plan,
}) => {
  const [answerType, setAnswerType] = useState("bar");
  const [answer, setAnswer] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const { filters } = usePanel(panelId);

  const containerRef = useRef(null);
  const { width: containerWidth } = useContainerDimensions(containerRef);

  const getAnswersDisplayType = (plan, results) => {
    if (isEmpty(plan) || isEmpty(results)) return null;
    return satyrn.responseManager.pickVisType(plan, results);
  };

  useEffect(() => {
    setExpanded(true);
  }, [answer]);

  useEffect(() => {
    if (!data || !statement || !plan || !satyrn) return;
    setAnswerType(getAnswersDisplayType(plan, data.results));

    const currentFilters = statement?.plan?.query?.["AND"];

    const formatString = (str) => {
      return str.replace(/\|/g, "");
    };

    const formattedFilters = currentFilters
      ? currentFilters.reduce((acc, andFilter) => {
          const aggregateString = (type, value, connector = "AND") => {
            if (!type || !value) return;

            if (type === "dateFiled") {
              value = `[${value?.map((date) =>
                dayjs(date).format("YYYY-M-DD"),
              )}]`;
            }

            if (acc[type]) {
              acc[type] = formatString(
                acc[type].concat(` ${connector} ${value}`),
              );
            } else {
              acc[type] = formatString(value);
            }
          };

          if (Array.isArray(andFilter)) {
            const type = andFilter[0].field;
            const value = andFilter[1];
            aggregateString(type, value);
          } else {
            andFilter["OR"]?.forEach((item, idx) => {
              const type = item[0].field;
              const value = item[1];
              const connector = idx === 0 ? "AND" : "OR";
              aggregateString(type, value, connector);
            });
          }
          return acc;
        }, {})
      : {};

    setAnswer(
      satyrn.responseManager.generate(formattedFilters, statement?.plan, data),
    );
  }, [data, plan, satyrn, statement, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const chartMargins = {
    top: 5,
    right: 30,
    left: 20,
    bottom: 5,
  };

  const isBarChart =
    data?.length > 0 &&
    data?.results?.[0]?.length === 2 &&
    answerType === "bar";
  const isLineChart = data?.length > 0 && answerType === "line";
  const isMultilineChart = data?.length > 0 && answerType === "multiline";
  const plainTextAnswer = !isBarChart && !isLineChart && !isMultilineChart;

  const chartWidth = useMemo(() => {
    const divisor = isBarChart ? 15 : 12;
    const width = Math.max(
      containerWidth,
      containerWidth * (data?.results?.length / divisor),
    );

    const out = expanded ? width : containerWidth;
    return out - 40;
  }, [containerWidth, data?.results?.length, expanded, isBarChart]);

  const collapseIsVisible = useMemo(() => {
    if (isMultilineChart || !expanded) return true;

    const chartOverflow = chartWidth > containerWidth;

    return chartOverflow && (isBarChart || isLineChart);
  }, [
    chartWidth,
    containerWidth,
    isBarChart,
    isLineChart,
    isMultilineChart,
    expanded,
  ]);

  const styles = css`
    width: 100%;
    margin-bottom: 20px;
  `;

  const onCapture = () => {
    htmlToImage
      .toPng(document.getElementById(`data-chart-${panelId}`))
      .then(function (dataUrl) {
        download(dataUrl, "data.png");
      });
  };

  const answerText = answer && (
    <Box
      sx={{
        padding: plainTextAnswer ? "0 16px 16px 0px" : "16px",
        boxShadow: "none",
        display: "flex",
        alignItems: "center",
        background: "white",
      }}
    >
      <Typography sx={{ fontSize: "20px", textTransform: "capitalize" }}>
        {renderHTML(answer)}
      </Typography>
    </Box>
  );

  return (
    <>
      <div ref={containerRef} className={`$answers ${styles}`}>
        <Loader isVisible={loadingAnswers}>
          <>
            {data && (
              <div
                style={{
                  overflowX: "auto",
                  overflowY: "visible",
                  marginTop: "48px",
                }}
              >
                {plainTextAnswer ? answerText : null}
                {isBarChart && (
                  <BarChartDisplay
                    data={data}
                    chartWidth={chartWidth}
                    chartMargins={chartMargins}
                    panelId={panelId}
                    answerText={answerText}
                  />
                )}

                {isLineChart && (
                  <LineChartDisplay
                    data={data}
                    expanded={expanded}
                    statement={statement}
                    chartWidth={chartWidth}
                    chartMargins={chartMargins}
                    panelId={panelId}
                    answerText={answerText}
                  />
                )}

                {isMultilineChart && (
                  <MultilineChartDisplay
                    data={data}
                    expanded={expanded}
                    containerWidth={containerWidth}
                    chartMargins={chartMargins}
                    panelId={panelId}
                    answerText={answerText}
                  />
                )}
              </div>
            )}
          </>
        </Loader>
      </div>
      {isBarChart || isLineChart || isMultilineChart ? (
        <Tooltip title="Save Snapshot">
          <Button onClick={onCapture} variant="outlined">
            <CameraAlt />
          </Button>
        </Tooltip>
      ) : null}
      {collapseIsVisible && (
        <div>
          <Tooltip title={expanded ? "Collapse" : "Expand"}>
            <Button
              variant="outlined"
              onClick={() => setExpanded((prev) => !prev)}
              sx={{
                marginLeft: "12px",
                width: "48px",
                minWidth: "0",
                "& svg": {
                  transform: "rotate(90deg)",
                },
              }}
            >
              {expanded ? <UnfoldLess /> : <UnfoldMore />}
            </Button>
          </Tooltip>
        </div>
      )}
    </>
  );
};

export default memo(Answers);
