import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePanel } from "src/store/panels";
import { useRing } from "src/store/rings";

import {
  Accordion,
  CardContent,
  Typography,
  FormControl,
  TextField,
  Button,
  Grid,
  AccordionDetails,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { UnfoldLess, UnfoldMore } from "@mui/icons-material";
import uniqid from "uniqid";

import Filters from "../Filters";
import Loader from "../Loader";
import Dataset from "../Dataset";
import Analysis from "../Analysis";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import ColumnHeader from "src/components/ColumnHeader";
import DeleteButton from "../Buttons/DeleteButton";
import DownloadButton from "../Buttons/DownloadButton";
import { panelHeaderStyles } from "./styles";
import { useEffectOnce } from "react-use";

type PanelT = {
  panelId: string;
  defaultCollapsed: boolean;
};

const Panel = ({ panelId, defaultCollapsed }: PanelT) => {
  const {
    panel,
    deletePanel,
    results,
    loadingPanelResults,
    getPanelResults,
    collapsed,
    setPanelResultsCollapsed,
    setPanelDescription,
    resultsCollapsed,
    setPanelCollapsed,
    downloadCsv,
    downloadingCsv,
    updatePanel,
  } = usePanel(panelId);

  // Pop first panel on page load
  useEffectOnce(() => {
    if (!defaultCollapsed) {
      setPanelCollapsed(false);
    }
  });

  const { ring, info, getRingInfo } = useRing(panel?.ringId);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [description, setDescription] = useState(panel?.description);

  const ringIdRef = React.useRef(null);
  useEffect(() => {
    if (ring && !ring.info && ringIdRef.current !== ring.version) {
      getRingInfo(ring.version);
      ringIdRef.current = ring.id;
    }
  }, [ring]); // eslint-disable-line react-hooks/exhaustive-deps

  const panelIdRef = React.useRef(null);
  useEffect(() => {
    if (info && !collapsed && panel.id !== panelIdRef.current) {
      getPanelResults();
      panelIdRef.current = panel.id;
    }
  }, [collapsed, info, panel.id, getPanelResults]);

  const rows = results?.results?.map((result) => ({
    ...result,
    id: uniqid(),
  }));

  const columns = useMemo(() => {
    const out =
      info?.columns
        ?.filter((c) => c.key !== "case_id")
        ?.map((column) => ({
          field: column.key,
          headerName: column.nicename,
          width: 200,
          sortable: false,
          renderHeader: (params) => {
            return (
              <ColumnHeader
                title={params.colDef.headerName}
                dataKey={params.colDef.field}
                withTooltip
              />
            );
          },
        })) || [];

    out.unshift({
      field: "button",
      headerName: "Docket ID",
      sortable: false,
      width: 180,
      renderCell: (item) => {
        return (
          <Link
            to={`/document/${ring.rid}/${ring.version}/Case/${item.row.__uniqueId.ucid}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.row.case_id}
          </Link>
        );
      },
      renderHeader: (params) => {
        return (
          <ColumnHeader
            title={params.colDef.headerName}
            dataKey="case_id"
            withTooltip
          />
        );
      },
    });

    return out;
  }, [info, ring]);

  if (!panel?.ringId) return <Dataset panelId={panel.id} />;

  return (
    <Accordion expanded={!collapsed} className="mb-4">
      <div className={`panelHeaderStyles ${panelHeaderStyles}`}>
        <Typography
          sx={{
            fontSize: "1.1rem",
          }}
        >
          {ring?.name}
        </Typography>
        <div className="buttonRow">
          <DeleteButton
            onClick={() => {
              setConfirmVisible(true);
            }}
            sx={{ height: "30.75px", width: "30.75px" }}
            variant="outlined"
            titleAddon="Panel"
          />
          <DownloadButton
            onClick={() => downloadCsv()}
            downloading={downloadingCsv}
            variant="outlined"
            sx={{ marginLeft: "8px", height: "30.75px", width: "30.75px" }}
          />
          <Tooltip title={collapsed ? "Expand" : "Collapse"}>
            <Button
              variant="outlined"
              onClick={() => setPanelCollapsed(!collapsed)}
              sx={{
                marginLeft: "8px",
                width: "52px",
                height: "30.75px",
                minWidth: "0",
              }}
            >
              {collapsed ? <UnfoldMore /> : <UnfoldLess />}
            </Button>
          </Tooltip>
        </div>
      </div>

      <AccordionDetails sx={{ padding: 0 }}>
        <CardContent
          sx={{
            padding: 0,
            marginX: 0,
          }}
        >
          <FormControl sx={{ width: "100%" }}>
            <TextField
              onClick={(event) => {
                event.stopPropagation();
              }}
              placeholder="Enter Panel Description"
              onChange={(event) => {
                setPanelDescription(event.target.value);
              }}
              value={panel?.description || ""}
              style={{
                fontSize: "0.9rem",
              }}
              className="description"
              onBlur={() => {
                if (panel?.description !== description) {
                  updatePanel({ description: panel?.description });
                  setDescription(panel?.description);
                }
              }}
              sx={{
                background: "var(--light-grey)",
                height: "56px",
                "& fieldset": {
                  borderRadius: "0",
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                },
              }}
            />
          </FormControl>

          <Filters panelId={panel.id} />
          <div className="p-0 bg-light border-top">
            <Loader
              contentHeight={resultsCollapsed ? "60px" : "400px"}
              isVisible={loadingPanelResults}
            >
              <>
                {results && (
                  <Accordion expanded={resultsCollapsed === true}>
                    <AccordionDetails sx={{ padding: "0px" }}>
                      <>
                        <div
                          style={{
                            width: "100%",
                            overflowX: "hidden",
                          }}
                        >
                          {!resultsCollapsed && (
                            <DataGrid
                              rows={rows}
                              onPaginationModelChange={(model) => {
                                getPanelResults([], model.page);
                              }}
                              paginationModel={{
                                page: results?.page,
                                pageSize: results?.batchSize,
                              }}
                              disableColumnMenu
                              disableColumnFilter
                              pageSizeOptions={[10]}
                              columns={columns}
                              rowCount={results?.totalCount}
                              checkboxSelection={false}
                              className="bg-white border-0 rounded-0"
                              paginationMode="server"
                              sx={{
                                "& .MuiDataGrid-virtualScroller": {
                                  minHeight: "400px",
                                },
                              }}
                            />
                          )}
                        </div>
                        <div className="p-3">
                          {results?.totalCount?.toLocaleString()} Dockets Found
                          <Button
                            size="small"
                            onClick={() =>
                              setPanelResultsCollapsed(!resultsCollapsed)
                            }
                            sx={{ textTransform: "none" }}
                          >
                            ({resultsCollapsed ? "Expand" : "Collapse"})
                          </Button>
                        </div>
                      </>
                    </AccordionDetails>
                  </Accordion>
                )}
              </>
            </Loader>
          </div>

          <div className="bg-white p-3">
            <Grid>
              <Analysis panelId={panelId} />
            </Grid>
          </div>
        </CardContent>
      </AccordionDetails>

      <ConfirmModal
        itemName="panel"
        open={confirmVisible}
        setOpen={setConfirmVisible}
        onConfirm={deletePanel}
      />
    </Accordion>
  );
};

export default Panel;
