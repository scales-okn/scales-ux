/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo, useMemo, useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import GeoMapPlot from "./GeoMapPlot";


type GeoMapDisplayT = {
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
}: GeoMapDisplayT) => {
  const geoLevel = data.fieldNames[0].field;
  if (!['court_abbrev', 'state_abbrev', 'circuit_abbrev', 'county_code'].includes(geoLevel)) return;

  const resultsMap = new Map(data.results);
  const units = data.units.results;

  return (
    <Box
      sx={{ width: chartWidth, minHeight: "700px", background: "white" }}
      id={`data-chart-${panelId}`}
    >
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {answerText}
      </Typography>
      
      <GeoMapPlot resultsMap={resultsMap} geoLevel={geoLevel} units={units} />
    </Box>
  );
};

export default memo(Answers);
