import React, { useEffect, useState } from "react";

import {
  Container,
  Grid,
  Tooltip,
  MenuItem,
  Select,
  Button,
} from "@mui/material";

import { usePanel } from "src/store/panels";
import { useRing, useRings } from "src/store/rings";
import { useSessionUser } from "src/store/auth";

import Loader from "../Loader";

import "./Dataset.scss";

type DatasetProps = {
  panelId: string;
};

const Dataset = ({ panelId }: DatasetProps) => {
  const { updatePanel, panel, setPanelCollapsed } = usePanel(panelId);
  const { rings, loadingRings } = useRings();

  const [selectedRing, setSelectedRing] = useState(null);

  const sessionUser = useSessionUser();
  const sessionUserCanEdit = sessionUser?.id === panel?.userId;
  const updatesDisabled = !sessionUserCanEdit;

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
      <Container
        className="bg-light border p-5 mb-4"
        sx={{
          "*": {
            transition: ".2s all",
          },
        }}
      >
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
              disabled={updatesDisabled}
              sx={{
                background: "white",
                div: { padding: "12px 10px 10px 12px" },
              }}
              MenuProps={{
                disableScrollLock: true,
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
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={6} className="justify-content-center d-flex">
              {ring && loadingRingInfo ? (
                <div style={{ marginTop: "12px" }} />
              ) : (
                <Button
                  variant="contained"
                  disabled={!info || updatesDisabled}
                  onClick={() => {
                    updatePanel({ ringId: selectedRing.id });
                    setPanelCollapsed(false);
                  }}
                  sx={{ marginTop: "12px" }}
                >
                  Start Exploring
                </Button>
              )}
            </Grid>
          </Grid>
        </Loader>
      </Container>
    </Loader>
  );
};

export default Dataset;
