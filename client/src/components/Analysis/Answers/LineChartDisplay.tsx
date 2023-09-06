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
import { numberToMonth, formatXUnits } from "@helpers/stringHelpers";

type LineChartDisplayT = {
  data: any;
  statement: any;
  chartWidth: number;
  chartMargins: Record<string, number>;
  expanded: boolean;
};

const LineChartDisplay = ({
  data,
  statement,
  chartMargins,
  chartWidth,
  expanded,
}: LineChartDisplayT) => {
  const xUnits = data?.units?.results?.[0]?.[0];
  let yUnits = data?.units?.results?.[1]?.[1];
  if (yUnits === "Case" || yUnits === "Judge") yUnits += "s"; // unlike attributes, entities seem not to have nicenames

  // unsure why result?.[1] is returned twice, & how non-ints (eg dates) are handled, but ignoring for now & just adding carveout for str x-vals
  const formatLineData = (result) => {
    const resultLabel = result?.[0];
    const resultValue = result?.[1];

    return {
      name: resultValue === -1 ? "criminal" : String(resultLabel),
      [xUnits]: formatXUnits(resultLabel, { formatMonths: true }),
      [yUnits]: parseInt(resultValue),
    };
  };

  const renderMonthAndYear = (payload) => {
    const both = payload[0].payload?.name?.split("/");
    const month = numberToMonth(both[1]);
    return `${month}, ${both[0]}`;
  };

  const singleLineTooltip = ({ active, payload, label }) => {
    const isMonthOverMonth = statement.selectedParameter === "month";

    if (active && payload && payload.length) {
      const payloadKeys = Object.keys(payload[0].payload);

      const xValue = isMonthOverMonth ? renderMonthAndYear(payload) : label;

      return (
        <div className="analysis-tooltip">
          <p className="label">{`${payloadKeys[1]}: ${xValue}`}</p>
          <p className="label">{`${payloadKeys[2]}: ${payload[0].value}`}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer width={chartWidth}>
      <LineChart
        data={data.results.map((result) => {
          return formatLineData(result);
        })}
        margin={chartMargins}
      >
        <XAxis height={80} scale="auto" dataKey={xUnits}>
          <Label
            angle={0}
            value={xUnits}
            position={expanded ? "left" : "insideBottom"}
            offset={expanded ? -500 : 0}
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
            new Intl.NumberFormat("en").format(value as number)
          }
          content={singleLineTooltip}
        />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Line
          type="monotone"
          dataKey={yUnits}
          stroke="#82ca9d"
          dot={false}
          activeDot={{ stroke: "white", strokeWidth: 2, r: 5 }}
        />
        {/* the below was plotting x-values (e.g. years) as y-values; not sure what the intended outcome was */}
        {/* <Line
                    type="monotone"
                    dataKey={data.units.results[0]?.[0]}
                    stroke="#82ca9d"
                  /> */}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default memo(LineChartDisplay);
