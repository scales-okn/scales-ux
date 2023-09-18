import React, { FunctionComponent, useState, useEffect, useMemo } from "react";
import { usePanel } from "src/store/panels";
import { useRing } from "src/store/rings";

import {
  Accordion,
  CardContent,
  Typography,
  FormControl,
  Input,
  Button,
  Grid,
  AccordionDetails,
} from "@mui/material";
import { Link } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import uniqid from "uniqid";

import Filters from "../Filters";
import Loader from "../Loader";
import Dataset from "../Dataset";
import Analysis from "../Analysis";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import ColumnHeader from "src/components/ColumnHeader";

import { panelHeaderStyles } from "./styles";
import DeleteButton from "../Buttons/DeleteButton";

type PanelProps = {
  panelId: string;
};

const Panel: FunctionComponent<PanelProps> = ({ panelId }) => {
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
  } = usePanel(panelId);

  const { ring, info, getRingInfo } = useRing(panel?.ringId);

  const [confirmVisible, setConfirmVisible] = useState(false);

  const ringIdRef = React.useRef(null);
  useEffect(() => {
    if (ring && !ring.info && ringIdRef.current !== ring.version) {
      getRingInfo(ring.version);
      ringIdRef.current = ring.id;
    }
  }, [ring]); // eslint-disable-line react-hooks/exhaustive-deps

  // TODO?
  const panelIdRef = React.useRef(null);
  // this panelIdRef not getting set ever
  useEffect(() => {
    // so the last part of this check doesn't work (not happening anymore?)
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
        <div className="ms-auto">
          <DeleteButton
            onClick={() => {
              setConfirmVisible(true);
            }}
            sx={{ height: "30.75px", width: "30.75px", marginRight: "8px" }}
            variant="outlined"
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => setPanelCollapsed(!collapsed)}
          >
            {collapsed ? "Open" : "Close"}
          </Button>
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
            <Input
              onClick={(event) => {
                event.stopPropagation();
              }}
              placeholder="Your Panel Description Here"
              onChange={(event) => {
                setPanelDescription(event.target.value);
              }}
              value={panel?.description || ""}
              style={{
                fontSize: "0.9rem",
              }}
              className="description"
              sx={{
                background: "var(--light-grey)",
                height: "56px",
                paddingLeft: "16px",
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
