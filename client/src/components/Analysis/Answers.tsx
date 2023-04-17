import React, { memo, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  Label,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Col } from "react-bootstrap";
import Loader from "components/Loader";
import { usePanel } from "store/panels";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import renderHTML from "helpers/renderHTML";

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
  const { filters } = usePanel(panelId);

  const getAnswersDisplayType = (plan, results) => {
    // TODO(JS): by year graphs not displaying
    if (isEmpty(plan) || isEmpty(results)) return null;
    return satyrn.responseManager.pickVisType(plan, results);
  };

  useEffect(() => {
    if (!data || !statement || !plan || !satyrn) return;
    setAnswerType(getAnswersDisplayType(plan, data.results));

    const formattedFilters = filters
      ? filters.reduce((acc, { type, value }) => {
          if (!type || !value) return acc;
          if (type === "dateFiled") {
            acc[type] = `[${value?.map((date) =>
              dayjs(date).format("YYYY-M-DD"),
            )}]`;
          } else {
            acc[type] = value;
          }

          return acc;
        }, {})
      : {};

    setAnswer(
      satyrn.responseManager.generate(formattedFilters, statement?.plan, data),
    );
  }, [data, plan, satyrn, statement, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const xUnits = data?.units?.results?.[0]?.[0];
  const yUnits = data?.units?.results?.[1]?.[0];

  //unsure why result?.[1] is returned twice, & how non-ints (e.g. dates) are handled, but ignoring for now & just adding carveout for str x-vals
  const formatData = (result) => {
    return {
      name: result?.[1],
      [xUnits]: /^[a-zA-Z ]+$/.test(result?.[0]) ? result?.[0] : parseInt(result?.[0]),
      [yUnits]: parseInt(result?.[1]),
    };
  };

  return (
    <div className="answers">
      <Loader isVisible={loadingAnswers} animation="border">
        <>
          {answer && (
            <div className="mb-3 mt-4">
              <i>Answer: </i>
              {renderHTML(answer)}
            </div>
          )}
          {data && (
            <Col lg="12" className="mt-5">
              {data.length > 1 && answerType === "bar" && (
                <BarChart
                  width={1100}
                  height={600}
                  data={data.results.map((result) => ({
                    name: result?.[0],
                    [data.units.results[1]]: result?.[1],
                  }))}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("en-US", {
                        notation: "compact",
                        compactDisplay: "short",
                      }).format(value)
                    }
                  />
                  <Tooltip
                    formatter={(value) =>
                      new Intl.NumberFormat("en").format(value)
                    }
                  />
                  <Legend />
                  <Bar dataKey={data.units.results[1]} fill="#82ca9d" />
                </BarChart>
              )}
              {answerType === "line" && (
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart
                    data={data.results.map((result) => {
                      return formatData(result);
                    })}
                  >
                    <XAxis dataKey={data.units.results[0]?.[0]} height={80}>
                      <Label
                        style={{
                          textTransform: "capitalize",
                        }}
                        angle={0}
                        value={xUnits}
                        position="insideBottom"
                      />
                    </XAxis>
                    <YAxis
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("en-US", {
                          notation: "compact",
                          compactDisplay: "short",
                        }).format(value)
                      }
                      width={100}
                    >
                      <Label
                        style={{
                          textAnchor: "middle",
                          textTransform: "capitalize",
                        }}
                        position="insideLeft"
                        angle={270}
                        value={yUnits}
                      />
                    </YAxis>
                    <Tooltip
                      formatter={(value) =>
                        new Intl.NumberFormat("en").format(value)
                      }
                    />
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <Line
                      type="monotone"
                      dataKey={data.units.results[1]?.[0]}
                      stroke="#82ca9d"
                    />
                    {/* the below was plotting x-values (e.g. years) as y-values; not sure what the intended outcome was */}
                    {/* <Line
                    type="monotone"
                    dataKey={data.units.results[0]?.[0]}
                    stroke="#82ca9d"
                  /> */}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Col>
          )}
        </>
      </Loader>
    </div>
  );
};

export default memo(Answers);
