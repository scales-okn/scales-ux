/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo, useMemo } from "react";
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
import { formatXUnits } from "helpers/stringHelpers";

type AnswersT = {
  data: any;
  containerWidth: number;
  chartMargins: Record<string, number>;
  expanded: boolean;
};

const Answers = ({
  data,
  chartMargins,
  containerWidth,
  expanded,
}: AnswersT) => {
  // for multiline, assumes the order of unit names is line label, x, y
  const xUnits = data?.units?.results?.[1]?.[0];
  let yUnits = data?.units?.results?.[2]?.[1];
  if (yUnits === "Case" || yUnits === "Judge") yUnits += "s"; // unlike attributes, entities seem not to have nicenames

  const formatMultilineData = (result, label) => {
    const resultLabel = result?.[0];
    const resultValue = result?.[1];

    return {
      name: resultValue,
      [xUnits]: formatXUnits(resultLabel, { formatMonths: false }),
      [label]: parseInt(resultValue),
    };
  };

  const multiLineTooltip = ({ active, payload, label }) => {
    const tooltipHeader = data.results?.[0]?.series?.[0][0]?.includes("/")
      ? dayjs(label).format("M/YYYY")
      : label;

    if (active && payload && payload.length) {
      return (
        <div className="analysis-tooltip">
          <p className="header">{tooltipHeader}</p>
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

  const stringIsNumber = (str) => isFinite(+str);

  const xLabels = useMemo(() => {
    const allValues = data.results.reduce((acc: any[], result: any) => {
      const values = result.series.map((series: any) => {
        return series[0].toString();
      });
      return acc.concat(values);
    }, []);

    const uniqueValues = [...new Set(allValues)];

    if (stringIsNumber(uniqueValues[0])) {
      return uniqueValues.sort();
    } else {
      return uniqueValues;
    }
  }, [data.results]);

  const domain = () => {
    if (!expanded) {
      return ["dataMin", "dataMax"];
    }
    if (stringIsNumber(xLabels[0])) {
      return [xLabels[0], xLabels[xLabels.length - 1]] as number[];
    } else {
      return null;
    }
  };

  const chartWidth = Math.max(
    containerWidth,
    containerWidth * (xLabels.length / 15),
  );

  const width = expanded ? chartWidth : containerWidth;

  return (
    <ResponsiveContainer width={width - 40} height="80%">
      <LineChart margin={chartMargins}>
        <XAxis
          height={80}
          scale="auto"
          dataKey={xUnits}
          interval={expanded ? 0 : undefined}
          type={
            /^[a-zA-Z ]+$/.test(data.results?.[0]?.series?.[0][0])
              ? "category"
              : "number"
          }
          domain={domain()}
          tickCount={xLabels.length}
          allowDuplicatedCategory={false}
          tickFormatter={(value) => {
            return data.results?.[0]?.series?.[0][0]?.includes("/") /* hack */
              ? dayjs(value).format("M/YYYY")
              : value;
          }}
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
