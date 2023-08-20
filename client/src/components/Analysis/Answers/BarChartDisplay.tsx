/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type AnswersT = {
  data: any;
  containerWidth: number;
  chartMargins: Record<string, number>;
  expanded: boolean;
};

const Answers = ({
  data,
  containerWidth,
  chartMargins,
  expanded,
}: AnswersT) => {
  const xUnits = data?.units?.results?.[0]?.[0];
  let yUnits = data?.units?.results?.[1]?.[1];
  if (yUnits === "Case" || yUnits === "Judge") yUnits += "s"; // unlike attributes, entities seem not to have nicenames

  const formatBarData = (result) => {
    return {
      name: result?.[0] === -1 ? "criminal" : String(result?.[0]),
      [yUnits]: result?.[1],
    };
  };

  const orderCourtCircuitData = () => {
    const copy = [...data.results];
    copy.sort((a, b) => {
      const ordinalA = parseInt(a[0]);
      const ordinalB = parseInt(b[0]);

      return ordinalA - ordinalB;
    });

    return copy;
  };

  const barData = useMemo(() => {
    if (!data) return;

    const isCourtCircuit = xUnits === "Court Circuit";
    const out = isCourtCircuit ? orderCourtCircuitData() : data.results;

    return out.map((result) => {
      return formatBarData(result);
    });
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const chartWidth = Math.max(
    containerWidth,
    containerWidth * (data.results.length / 20),
  );

  const width = expanded ? chartWidth : containerWidth;

  return (
    <BarChart
      width={width - 40}
      height={600}
      data={barData}
      margin={chartMargins}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis
        domain={[0, Math.max(...data.results.map((i) => parseInt(i[1])))]}
        tickFormatter={(value) =>
          new Intl.NumberFormat("en-US", {
            notation: "compact",
            compactDisplay: "short",
          }).format(value)
        }
      />
      <Tooltip
        formatter={(value) => new Intl.NumberFormat("en").format(value)}
      />
      <Legend />
      <Bar dataKey={yUnits} fill="#82ca9d" />
    </BarChart>
  );
};

export default memo(Answers);
