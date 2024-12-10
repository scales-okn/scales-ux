/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { Map, GeoJson } from "pigeon-maps";
import statesGeoJSON from "./statesGeoJSON.js";


type BarChartDisplayT = {
  data: any;
  chartWidth: number;
  chartMargins: Record<string, number>;
  panelId: string;
  answerText: React.ReactNode;
};

const Answers = ({
  data,
  chartWidth,
  chartMargins,
  panelId,
  answerText,
}: BarChartDisplayT) => {
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


  const colorScale = (label) => {
    const maxValue = Math.max(...data.results.map((i) => parseInt(i[1])))
    const maxLightness = 40
    const maxChroma = 0.1351
    const hue = 297.29

    const match = data?.results.find(([i, value]) => i == label) || ['', 0]
    const labeledValue = parseInt(match[1])
    console.log(match)

    return labeledValue/maxValue
  }
  console.log(data.results)

  return (
    <Box
      sx={{ width: chartWidth, minHeight: "700px", background: "white" }}
      id={`data-chart-${panelId}`}
    >
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {answerText}
      </Typography>
      <Map height={500} 
          defaultCenter={[37.8, -96]} 
          defaultZoom={4}>
        <GeoJson
        data={statesGeoJSON}
        styleCallback={(feature, hover) => {
          if (feature.geometry.type === "LineString") {
            return { strokeWidth: "1", stroke: "black" };
          }
          return {
            fill: "#4f2f83",
            strokeWidth: "1",
            stroke: "white",
            r: "20",
            opacity: colorScale(feature.properties.name)
          };
        }}
      />
      </Map>
    </Box>
  );
};

export default memo(Answers);
