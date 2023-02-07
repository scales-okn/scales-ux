import React, { memo, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  // Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  // ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Col } from "react-bootstrap";
import Loader from "components/Loader";
import { usePanel } from "store/panels";
import dayjs from "dayjs";
import { isEmpty } from "lodash";

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

    const formatedFilters = filters
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
      satyrn.responseManager.generate(formatedFilters, statement?.plan, data),
    );
  }, [data, plan, satyrn, statement, filters]);

  return (
    <div className="answers">
      <Loader isVisible={loadingAnswers} animation="border">
        <>
          {answer && (
            <div className="mb-3 mt-4">
              <i>Answer: </i>
              {answer}
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
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={data.units.results[1]} fill="#82ca9d" />
                </BarChart>
              )}

              {answerType === "line" && (
                <LineChart
                  width={1000}
                  height={600}
                  data={data.results.map((result) => ({
                    name: result?.[1],
                    [data.units.results[1]]: result?.[1],
                    [data.units.results[2]]: result?.[2],
                  }))}
                >
                  <XAxis dataKey={data.units.results[1]} />
                  <YAxis />
                  <Tooltip />
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                  <Line
                    type="monotone"
                    dataKey={data.units.results[2]}
                    stroke="#82ca9d"
                  />
                  <Line
                    type="monotone"
                    dataKey={data.units.results[1]}
                    stroke="#82ca9d"
                  />
                </LineChart>
              )}
            </Col>
          )}
        </>
      </Loader>
    </div>
  );
};

export default memo(Answers);
