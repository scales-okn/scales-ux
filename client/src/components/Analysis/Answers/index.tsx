import React, { memo, useEffect, useState, useRef } from "react";
import { Col } from "react-bootstrap";
import Loader from "components/Loader";
import { usePanel } from "store/panels";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import renderHTML from "helpers/renderHTML";
import { Button } from "react-bootstrap";

import useContainerDimensions from "hooks/useContainerDimensions";
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

  return (
    <>
      <div className="answers" ref={containerRef}>
        <Loader isVisible={loadingAnswers} animation="border">
          <>
            {answer && (
              <div className="mb-3 mt-4">
                <i>Answer: </i>
                {renderHTML(answer)}
              </div>
            )}
            {data && (
              <Col
                lg="12"
                className="mt-5"
                style={{ overflowX: "auto", overflowY: "visible" }}
              >
                {data.length > 0 &&
                  data.results?.[0]?.length === 2 &&
                  answerType === "bar" && (
                    <BarChartDisplay
                      data={data}
                      expanded={expanded}
                      containerWidth={containerWidth}
                      chartMargins={chartMargins}
                    />
                  )}

                {isLineChart && (
                  <LineChartDisplay
                    data={data}
                    expanded={expanded}
                    statement={statement}
                    containerWidth={containerWidth}
                    chartMargins={chartMargins}
                  />
                )}

                {isMultilineChart && (
                  <MultilineChartDisplay
                    data={data}
                    expanded={expanded}
                    containerWidth={containerWidth}
                    chartMargins={chartMargins}
                  />
                )}
              </Col>
            )}
          </>
        </Loader>
      </div>
      {(isBarChart || isLineChart || isMultilineChart) && (
        <div style={{ width: "300px" }}>
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "collapse" : "expand"}
          </Button>
        </div>
      )}
    </>
  );
};

export default memo(Answers);
