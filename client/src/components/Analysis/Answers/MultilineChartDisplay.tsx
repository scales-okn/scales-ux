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
import _ from "lodash";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import getRandomColor from "src/helpers/getRandomColor";
import { formatXUnits, stringIsNumber } from "src/helpers/stringHelpers";
import { addMissingYears } from "./helpers";

type AnswersT = {
  data: any;
  chartMargins: Record<string, number>;
  expanded: boolean;
  containerWidth: number;
  panelId: string;
  answerText: React.ReactNode;
};

const Answers = ({
  data,
  chartMargins,
  expanded,
  containerWidth,
  panelId,
  answerText,
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

  const xLabels = useMemo(() => {
    const allValues = data.results.reduce((acc: any[], result: any) => {
      const values = result.series?.map((series: any) => {
        return series[0].toString();
      });
      return acc.concat(values);
    }, []);

    const uniqueValues = [...new Set(allValues)];

    if (stringIsNumber(uniqueValues[0])) {
      return addMissingYears(uniqueValues.sort());
    } else {
      return uniqueValues;
    }
  }, [data.results]);

  const domain = () => {
    if (!expanded && stringIsNumber(xLabels[0])) {
      return ["dataMin", "dataMax"];
    }
    if (stringIsNumber(xLabels[0])) {
      return [xLabels[0], xLabels[xLabels.length - 1]] as number[];
    }
    return null;
  };

  const chartWidth = useMemo(() => {
    const width = Math.max(
      containerWidth,
      containerWidth * (xLabels.length / 17),
    );

    const out = expanded ? width : containerWidth;
    return out - 40;
  }, [containerWidth, expanded, xLabels.length]);

  return (
    <Box
      sx={{ width: chartWidth, background: "white" }}
      id={`data-chart-${panelId}`}
    >
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {answerText}
      </Typography>
      <ResponsiveContainer height="80%">
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
            content={multiLineTooltip}
          />
          {/* hack */}
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          {data.results?.map((ld) => {
            const line_data = _.cloneDeep(ld);
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
    </Box>
  );
};

export default memo(Answers);
