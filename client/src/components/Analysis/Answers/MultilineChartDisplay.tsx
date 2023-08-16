/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo } from "react";
import {
  Label,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import dayjs from "dayjs";
import getRandomColor from "helpers/getRandomColor";

type AnswersT = {
  data: any;
};

const Answers = ({ data }: AnswersT) => {
  // for multiline, assumes the order of unit names is line label, x, y
  const xUnits = data?.units?.results?.[1]?.[0];
  let yUnits = data?.units?.results?.[2]?.[1];
  if (yUnits === "Case" || yUnits === "Judge") yUnits += "s"; // unlike attributes, entities seem not to have nicenames

  const convertDate = (dateString: string) => {
    return dayjs(dateString, "YYYY/MM").toDate().valueOf();
  };

  const formatMultilineData = (result, label) => {
    return {
      name: result?.[1],
      [xUnits]: /^[a-zA-Z ]+$/.test(result?.[0])
        ? result?.[0]
        : result?.[0].includes("/")
        ? convertDate(result?.[0])
        : parseInt(result?.[0]),
      [label]: parseInt(result?.[1]),
    };
  };

  const multiLineTooltip = ({ active, payload, label }) => {
    // TODO: reimplement this
    // data.results?.[0]?.series?.[0][0]?.includes("/")
    //   ? dayjs(value).format("M/YYYY")
    //   : value;
    if (active && payload && payload.length) {
      return (
        <div className="analysis-tooltip">
          <p className="header">{label}</p>
          <div className="multiBox">
            {payload.map((pl) => {
              return (
                <p
                  className="label"
                  key={pl.color}
                  style={{ color: pl.color }}
                >{`${pl.name}: ${pl.value}`}</p>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="80%">
      <LineChart margin={{ top: 5, right: 20, left: 15, bottom: 5 }}>
        {/* not sure why all these props are needed when plotting multiple lines despite not being needed above */}
        <XAxis
          height={80}
          scale="auto"
          dataKey={xUnits}
          interval={0}
          type={
            /^[a-zA-Z ]+$/.test(data.results?.[0]?.series?.[0][0])
              ? "category"
              : "number"
          }
          /* hack */ domain={
            /^[a-zA-Z ]+$/.test(data.results?.[0]?.series?.[0][0])
              ? undefined
              : ["dataMin", "dataMax"]
          }
          /* hack */ allowDuplicatedCategory={false}
          tickFormatter={(value) =>
            data.results?.[0]?.series?.[0][0]?.includes("/") /* hack */
              ? dayjs(value).format("M/YYYY")
              : value
          }
        >
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
          formatter={(value) => new Intl.NumberFormat("en").format(value)}
          content={multiLineTooltip}
        />
        {/* hack */}
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        {data.results?.map((line_data) => {
          if (line_data.label === -1) {
            line_data.label = "criminal";
          }
          if (typeof line_data.label == "boolean") {
            line_data.label = String(line_data.label);
          }
          return (
            <Line
              key={line_data.label}
              data={line_data.series?.map((result) => {
                return formatMultilineData(result, line_data.label);
              })}
              type="monotone"
              dataKey={line_data.label}
              stroke={getRandomColor()}
              dot={false}
              activeDot={{ stroke: "white", strokeWidth: 2, r: 5 }}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default memo(Answers);
