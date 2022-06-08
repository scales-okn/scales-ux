import React, { memo } from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Col, Accordion } from "react-bootstrap";
import Loader from "components/Loader";

const Answers = ({
  data,
  satyrn,
  loadingAnswers
}) => {
  console.log({
    data,
  });

  // TODO: show linechart if timeseries from parameters are present data length > 1 if not answer.
  return (
    <div className="answers">
      <Loader isVisible={loadingAnswers} animation="border">
        <>
          {
            data &&
            <Col lg="12" className="answers mt-5" >
              {data.length > 1 &&
                <BarChart
                  width={1250}
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
              }
              <div className="mb-4 mt-3"><i>Answer: </i>{satyrn.responseManager.generate(data)}</div>
              <Accordion defaultActiveKey="0" style={{
                width: "600px"
              }}>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Response Payload</Accordion.Header>
                  <Accordion.Body>
                    <code className="mt-5">
                      {
                        JSON.stringify(data)
                      }
                    </code>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Col>
          }
        </>
      </Loader>
    </div>
  )
}

export default memo(Answers);