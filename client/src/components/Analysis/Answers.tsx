import React, { memo, useEffect, useState } from "react";
import { BarChart, Bar, Label, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Col } from "react-bootstrap";
import Loader from "components/Loader";
import { usePanel } from "store/panels";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import renderHTML from "helpers/renderHTML";

const Answers = ({ panelId, data, satyrn, loadingAnswers, statement, plan }) => {
  const [answerType, setAnswerType] = useState("bar");
  const [answer, setAnswer] = useState(null);
  const { filters } = usePanel(panelId);

  const getAnswersDisplayType = (plan, results) => {
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
            acc[type] = `[${value?.map((date) => dayjs(date).format("YYYY-M-DD"))}]`;
          } else {
            acc[type] = value;
          }

          return acc;
        }, {})
      : {};

    setAnswer(satyrn.responseManager.generate(formattedFilters, statement?.plan, data));
  }, [data, plan, satyrn, statement, filters]); // eslint-disable-line react-hooks/exhaustive-deps



  // for multiline, assumes the order of unit names is line label, x, y
  const xUnits = data?.units?.results?.[answerType=='multiline' ? 1 : 0]?.[0];
  let yUnits = data?.units?.results?.[answerType=='multiline' ? 2 : 1]?.[1];
  if (yUnits=='Case' || yUnits=='Judge') yUnits += 's'; // unlike attributes, entities seem not to have nicenames

  const formatBarData = (result) => {
    return {
      name: String(result?.[0]),
      [yUnits]: result?.[1],
    };
  };

  //unsure why result?.[1] is returned twice, & how non-ints (eg dates) are handled, but ignoring for now & just adding carveout for str x-vals
  const formatLineData = (result) => {
    return {
      name: result?.[1],
      [xUnits]: /^[a-zA-Z ]+$/.test(result?.[0]) ? result?.[0] : parseInt(result?.[0]),
      [yUnits]: parseInt(result?.[1]),
    };
  };

  // const isYearType = data.fieldNames.some((fieldName) => fieldName.dateTransform === "year");
  // const scaleType = () => {
  //   return isYearType ? "time" : "auto";
  // };

  const convertDate = (dateString: string) => {
    return dayjs(dateString, "YYYY/MM").toDate().valueOf();
  };
  
  const formatMultilineData = (result, label) => {
    return {
      name: result?.[1],
      [xUnits]:/^[a-zA-Z ]+$/.test(result?.[0]) ? result?.[0] : (result?.[0].includes('/') ? convertDate(result?.[0]) : parseInt(result?.[0])),
      [label]: parseInt(result?.[1]),
    }
  }

  const getColor = () => { // from stackoverflow.com/questions/43193341/how-to-generate-random-pastel-or-brighter-color-in-javascript
    return "hsl(" + 360 * Math.random() + ',' +
               (20 + 75 * Math.random()) + '%,' + 
               (10 + 60 * Math.random()) + '%)'
  }



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
                  data={data.results.map((result) => {
                    return formatBarData(result);
                  })}
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
                  <Tooltip formatter={(value) => new Intl.NumberFormat("en").format(value)} />
                  <Legend />
                  <Bar dataKey={yUnits} fill="#82ca9d" />
                </BarChart>
              )}

              {answerType === "line" && (
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart
                    data={data.results.map((result) => {
                      return formatLineData(result);
                    })}
                  >
                    <XAxis height={80} scale="auto" dataKey={xUnits}>
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
                    <Tooltip formatter={(value) => new Intl.NumberFormat("en").format(value)} />
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey={yUnits} stroke="#82ca9d" />
                    {/* the below was plotting x-values (e.g. years) as y-values; not sure what the intended outcome was */}
                    {/* <Line
                    type="monotone"
                    dataKey={data.units.results[0]?.[0]}
                    stroke="#82ca9d"
                  /> */}
                  </LineChart>
                </ResponsiveContainer>
              )}

              {answerType === "multiline" && (
                <ResponsiveContainer width="100%" height="80%">
                 <LineChart>
                    {/* not sure why all these props are needed when plotting multiple lines despite not being needed above */}
                    <XAxis height={80} scale="auto" dataKey={xUnits} interval={0}
                    type={/^[a-zA-Z ]+$/.test(data.results?.[0]?.series?.[0][0]) ? 'category' : 'number'} /* hack */
                    domain={/^[a-zA-Z ]+$/.test(data.results?.[0]?.series?.[0][0]) ? undefined : ['dataMin', 'dataMax']} /* hack */
                    allowDuplicatedCategory={false} tickFormatter={(value) => data.results?.[0]?.series?.[0][0]?.includes('/') ? /* hack */
                    dayjs(value).format("M/YYYY") : value}>
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
                    <Tooltip formatter={(value) => new Intl.NumberFormat("en").format(value)} 
                    labelFormatter={(value) => data.results?.[0]?.series?.[0][0]?.includes('/') ?
                    dayjs(value).format("M/YYYY") : value} /> {/* hack */}
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    {data.results?.map((line_data) => {
                      return (<Line key={line_data.label} dot={!data.results?.[0]?.series?.[0][0]?.includes('/')} /* hack */
                        data={line_data.series?.map((result) => {return formatMultilineData(result, line_data.label);})}
                        type="monotone" dataKey={line_data.label} stroke={getColor()} />);
                    })}
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
