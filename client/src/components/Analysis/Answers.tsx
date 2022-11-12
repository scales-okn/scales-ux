import React, { memo, useEffect, useState } from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Col, Accordion } from "react-bootstrap";
import Loader from "components/Loader";
import { usePanel } from "store/panels";
import dayjs from "dayjs";

const dataFormatter = (number) => {
  if (number > 1000000000) return (number/1000000000).toString() + 'B';
  if (number > 1000000) return (number/1000000).toString() + 'M';
  if (number > 1000) return (number/1000).toString() + 'K';
  return number.toString();
}

const formatVal = (num) => {
    // if (this.props.question.answerMetadata.units == "%") return `${num.toLocaleString()}%`
    return num.toLocaleString()
  }

const Answers = ({
  panelId,
  data,
  satyrn,
  loadingAnswers,
  statement,
  plan
}) => {
  const [answerType, setAnswerType] = useState("bar");
  const [answer, setAnswer] = useState(null);

  const { filters } = usePanel(panelId);

  const getAnswersDisplayType = (plan, results) => {
    if (!plan || !results) return null;
    return satyrn.responseManager.pickVisType(plan, results);
  }

  useEffect(() => {
    if (!data || !statement || !plan || !satyrn) return;
    setAnswerType(getAnswersDisplayType(plan, data.results));
    
    // debugger; // eslint-disable-line no-debugger

    const formatedFilters = (data.genFilters && data.genFilters !== "null") ? JSON.parse(data.genFilters).reduce((acc, { type, value }) => {
      if (!type || !value) return acc;
      if (type === "dateFiled") {
        acc[type] = `[${value?.map((date) =>
          dayjs(date).format("YYYY-M-DD"),
        )}]`
      } else {
        acc[type] = value;
      }

      return acc;
    }, {}) : {};
    console.log({
      formatedFilters
    })
    // debugger; // eslint-disable-line no-debugger
    setAnswer(satyrn.responseManager.generate(formatedFilters, statement?.plan, data))
  }, [data, plan, satyrn, statement, filters]);

  // console.log({
  //   filters,
  //   data,
  //   statement,
  //   plan,
  //   answer,
  //   answerType
  // });

  // debugger; // eslint-disable-line no-debugger
  return (
    <div className="answers">
      <Loader isVisible={loadingAnswers} animation="border">
        <>
          {answer &&
            <div className="mb-4 mt-3"><i>Answer: </i>
              <p dangerouslySetInnerHTML={{__html: answer}} />
            </div>
          }
          {
            data &&
            <Col lg="12" className="answers mt-5" >
              {data.length > 1 &&
                answerType === "bar" &&
                <BarChart
                  width={1100}
                  height={600}
                  data={data.results.map((result) => ({
                    name: result?.[0],
                    [data.units.results[1]]: Number(result?.[1]),
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
                  <YAxis tickFormatter={dataFormatter} />
                  <Tooltip formatter={formatVal} />
                  <Legend />
                  <Bar dataKey={data.units.results[1]} fill="#82ca9d" />
                </BarChart>
              }

              {answerType === "line" &&
                <LineChart
                  width={800}
                  height={500}
                  data={data.results.map((result) => ({
                    name: result?.[0],
                    [data.units.results[1]]: Number(result?.[1])
                  }))}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 22,
                    bottom: 5,
                  }}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={dataFormatter} />
                  <Tooltip formatter={formatVal} />
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey={data.units.results[1]} stroke="#82ca9d" />
                </LineChart>
              }
            </Col>
          }
        </>
      </Loader>
    </div>
  )
}

export default memo(Answers);