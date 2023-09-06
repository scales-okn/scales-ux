import React, { useEffect, useState } from "react";
import { Container, Grid, Tooltip, MenuItem, Select } from "@mui/material";
import Loader from "../Loader";
import { usePanel } from "@store/panels";
import { useRing, useRings } from "@store/rings";

import StandardButton from "@components/Buttons/StandardButton";

import "./Dataset.scss";

type DatasetProps = {
  panelId: string;
};

const Dataset = ({ panelId }: DatasetProps) => {
  const { updatePanel, setPanelCollapsed } = usePanel(panelId);
  const { rings, loadingRings } = useRings();

  const [selectedRing, setSelectedRing] = useState(null);

  const { ring, loadingRingInfo, info, getRingInfo } = useRing(
    selectedRing?.id,
  );

  useEffect(() => {
    const defaultRing = rings.reduce((prev, curr) => {
      return prev.id < curr.id ? prev : curr;
    });
    if (defaultRing) {
      setSelectedRing(defaultRing);
    }
  }, [rings]);

  useEffect(() => {
    if (!ring || info) return;
    getRingInfo(ring.version);
  }, [selectedRing]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Loader isVisible={loadingRings}>
      <Container className="bg-light border p-5 mb-4">
        <Grid container justifyContent="center" className="mb-4">
          <Grid>
            <span style={{ fontSize: "18px", marginRight: "18px" }}>
              Select a dataset:
            </span>
            <Select
              variant="outlined"
              value={selectedRing ? selectedRing.name : "None"}
              onChange={(event) => {
                setSelectedRing(
                  rings.find((ring) => ring.name === event.target.value),
                );
              }}
              sx={{
                background: "white",
                div: { padding: "12px 10px 10px 12px" },
              }}
            >
              {rings?.map((ring, index) => (
                <MenuItem key={index} value={ring.name}>
                  <Tooltip
                    title={
                      <span style={{ fontSize: "16px" }}>
                        {ring.description}
                      </span>
                    }
                  >
                    <span>{ring.name}</span>
                  </Tooltip>
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>

        <Loader isVisible={ring && loadingRingInfo}>
          <Grid container justifyContent="center" className="mb-4 mt-3">
            <Grid item xs={12} sm={6} className="justify-content-center d-flex">
              <StandardButton
                variant="primary"
                style={{ color: "white" }}
                className="text-white rounded-3"
                disabled={!info}
                onClick={() => {
                  updatePanel({ ringId: selectedRing.id });
                  setPanelCollapsed(false);
                }}
              >
                Start Exploring
              </StandardButton>
            </Grid>
          </Grid>
        </Loader>
      </Container>
    </Loader>
  );
};

export default Dataset;
