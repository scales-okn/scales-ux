import React, { memo, useMemo, useRef, useEffect } from "react";
import * as Plot from "@observablehq/plot";
import legalAlbers from "./legal-albers-10m.json";
import * as topojson from "topojson-client";

export default function GeoMapPlot({ resultsMap, geoLevel, units }) {
  const containerRef = useRef(null);
  const nation = topojson.feature(legalAlbers, legalAlbers.objects.nation);
  const states = topojson.feature(legalAlbers, legalAlbers.objects.nation);

  let borders = nation;
  if (geoLevel === 'circuit_abbrev') {
    borders = topojson.feature(legalAlbers, legalAlbers.objects.circuits);
  } else if (geoLevel === 'state_abbrev') {
    borders = topojson.feature(legalAlbers, legalAlbers.objects.states);
  } else if (geoLevel === 'court_abbrev') {
    borders = topojson.feature(legalAlbers, legalAlbers.objects.courts);
  } else if (geoLevel === 'county_code') {
    borders = topojson.feature(legalAlbers, legalAlbers.objects.counties);
  }

  console.log(geoLevel, borders)

  const channels = {};
  channels[units[0][0]] = feature => feature.properties.name || feature.id;

  console.log(units, channels)

  useEffect(() => {
    if (resultsMap === undefined) return;
    const plot = Plot.plot({
      label: units[1][1],
      projection: "albers-usa",
      width: 900,
      color: {
        type: "sqrt",
        scheme: "blues",
        legend: true
      },
      marks: [
        Plot.geo(nation),
        Plot.geo(states, {
          stroke: 'black',
          strokeWidth: 0.1,
        }),
        Plot.geo(borders, {
          fill: feature => resultsMap.get(feature.id),
          stroke: 'black',
          strokeWidth: 0.5,
          tip: true,
          channels: channels
        })
        // Plot.geo(circuits, { stroke: 'green' }),
        // Plot.geo(states, { strokeOpacity: 0.25 }),
        // Plot.geo(courts, { stroke: 'red' }),
        // Plot.geo(counties, { strokeOpacity: 0.1 })
      ]
    });
    containerRef.current.append(plot);
    return () => plot.remove();
  }, [resultsMap]);

  return <div ref={containerRef}></div>;
}