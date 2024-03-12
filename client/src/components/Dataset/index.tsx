import React, { useEffect, useState } from "react";

import {
  Grid,
  Tooltip,
  MenuItem,
  Select,
  Button,
  Typography,
  Box,
} from "@mui/material";

import { usePanel } from "src/store/panels";
import { useRing, useRings } from "src/store/rings";

import Loader from "../Loader";

type DatasetProps = {
  panelId: string;
  sessionUserCanEdit: boolean;
};

const Dataset = ({ panelId, sessionUserCanEdit }: DatasetProps) => {
  const { updatePanel, setPanelCollapsed } = usePanel(panelId);
  const { rings, loadingRings } = useRings();

  const [selectedRing, setSelectedRing] = useState(null);

  const updatesDisabled = !sessionUserCanEdit;

  const { ring, loadingRingInfo, info, getRingInfo } = useRing(
    selectedRing?.rid,
  );

  useEffect(() => {
    const defaultRing = rings.reduce((prev, curr) => {
      return prev.id < curr.id ? prev : curr;
    }, []);
    if (defaultRing) {
      setSelectedRing((prev) => {
        if (!prev) {
          return defaultRing;
        }
        return prev;
      });
    }
  }, [rings]);

  useEffect(() => {
    if (!ring || info) return;
    getRingInfo(ring.version);
  }, [selectedRing]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Loader isVisible={loadingRings}>
      <Box
        sx={{
          padding: "3rem",
          background: "white",
          marginBottom: "1.5rem",
          marginTop: "24px",

          "*": {
            transition: ".2s all",
          },
        }}
      >
        <Grid
          container
          sx={{
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: "18px",
              marginRight: "18px",
              textAlign: "center",
              marginBottom: "12px",
            }}
          >
            Select a dataset:
          </Typography>
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
              minWidth: "300px",
              marginBottom: "24px",
            }}
            MenuProps={{
              disableScrollLock: true,
            }}
          >
            {rings?.map((ring, index) => (
              <MenuItem key={index} value={ring.name}>
                <Tooltip title={<Typography>{ring.description}</Typography>}>
                  <span>{ring.name}</span>
                </Tooltip>
              </MenuItem>
            ))}
          </Select>
        </Grid>

        <Loader isVisible={ring && loadingRingInfo}>
          <Grid container justifyContent="center">
            <Grid
              item
              xs={12}
              sm={6}
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              {ring && loadingRingInfo ? (
                <Box sx={{ marginTop: "12px" }} />
              ) : (
                <Button
                  variant="contained"
                  disabled={!info || updatesDisabled}
                  onClick={() => {
                    updatePanel({ ringRid: selectedRing.rid });
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
      </Box>
    </Loader>
  );
};

export default Dataset;
