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
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { UnfoldLess, UnfoldMore } from "@mui/icons-material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import uniqid from "uniqid";
import dayjs from "dayjs";

import Pagination from "src/components/Pagination";
import Filters from "../Filters";
import Loader from "../Loader";
import Dataset from "../Dataset";
import Analysis from "../Analysis";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import ColumnHeader from "src/components/ColumnHeader";
import DeleteButton from "../Buttons/DeleteButton";
import DownloadButton from "../Buttons/DownloadButton";
import { useEffectOnce } from "react-use";

type PanelT = {
  panelId: string;
  defaultCollapsed: boolean;
  sessionUserCanEdit: boolean;
};

const Panel = ({ panelId, defaultCollapsed, sessionUserCanEdit }: PanelT) => {
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

  const paging = {
    totalCount: results?.totalCount || 0,
    totalPages: results ? Math.ceil(results.totalCount / results.batchSize) : 0,
    currentPage: results?.page,
    pageSize: results?.batchSize,
  };

  // Pop first panel on page load
  useEffectOnce(() => {
    if (!defaultCollapsed) {
      setPanelCollapsed(false);
    }
  });

  const { ring, info, getRingInfo } = useRing(panel?.ringRid);

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
      if (panel.page) {
        getPanelResults({ page: panel.page });
      } else {
        getPanelResults({});
      }
      panelIdRef.current = panel.id;
    }
  }, [collapsed, info, panel.id, getPanelResults, panel.page]);

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
          flex: 1,
          renderHeader: (params) => {
            return (
              <ColumnHeader
                title={params.colDef.headerName}
                dataKey={params.colDef.field}
                withTooltip
              />
            );
          },
          renderCell: (item) => {
            let value = item.value;
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(value)) {
              value = dayjs(value).format("MMM D, YYYY");
            }
            return (
              <Tooltip
                title={value}
                componentsProps={{
                  tooltip: {
                    sx: {
                      fontSize: "14px",
                      lineHeight: "24px",
                    },
                  },
                }}
              >
                <Typography
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: ".85rem",
                  }}
                >
                  {value}
                </Typography>
              </Tooltip>
            );
          },
        })) || [];

    out.unshift({
      field: "button",
      headerName: "Docket ID",
      width: 180,
      flex: 1,
      renderCell: (item) => {
        return (
          <Tooltip
            title="Open Docket in New Tab"
            componentsProps={{
              tooltip: {
                sx: {
                  fontSize: "14px",
                  lineHeight: "24px",
                },
              },
            }}
          >
            <Link
              to={`/document/${ring.rid}/${ring.version}/Case/${item.row.__uniqueId.ucid}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: (theme) => theme.palette.primary.dark,
                  fontWeight: "bold",
                }}
              >
                {item.row.case_id}
                <OpenInNewIcon
                  sx={{
                    fontSize: "16px",
                    marginLeft: "8px",
                    color: (theme) => theme.palette.primary.dark,
                    fontWeight: "bold",
                  }}
                />
              </Box>
            </Link>
          </Tooltip>
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

  const getSortArg = (arg) => {
    if (arg.field === panel.sort.field) {
      if (panel.sort.sort === "desc") {
        return { field: arg.field, sort: "asc" };
      } else {
        return { field: "filing_date", sort: "desc" };
      }
    }
    return { field: arg.field, sort: "desc" };
  };

  const handleColumnHeaderClick = (arg) => {
    const sort = getSortArg(arg);

    updatePanel({ sort });
    getPanelResults({ sortOverride: sort });
  };

  if (!panel?.ringRid)
    return (
      <Dataset panelId={panel.id} sessionUserCanEdit={sessionUserCanEdit} />
    );

  return (
    <Accordion expanded={!collapsed} sx={{ marginBottom: "1.5rem" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "white",
          border: "1px solid #e5e5e5",
          borderRadius: "4px 4px 0 0",
          boxShadow: "0px 1px 8px rgba(0, 0, 0, 0.06)",
          padding: "1rem",
          position: "relative",
          width: "100%",
          zIndex: 1,
          height: "80px",
          marginTop: "24px",
          ".buttonRow": {
            display: "flex",
            alignItems: "center",
          },
        }}
      >
        <Tooltip title="Dataset Name">
          <Typography
            sx={{
              fontSize: "1.1rem",
              fontStyle: "italic",
              cursor: "default",
            }}
          >
            {ring?.name}
          </Typography>
        </Tooltip>
        <div className="buttonRow">
          <DeleteButton
            onClick={() => {
              setConfirmVisible(true);
            }}
            sx={{ height: "30.75px", width: "30.75px" }}
            variant="outlined"
            titleAddon="Panel"
            disabled={!sessionUserCanEdit}
          />
          <DownloadButton
            onClick={() => downloadCsv()}
            downloading={downloadingCsv}
            variant="outlined"
            sx={{ marginLeft: "8px", height: "30.75px", width: "30.75px" }}
          />
          <Tooltip title={collapsed ? "Expand Panel" : "Collapse Panel"}>
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
      </Box>

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
              className="description"
              onBlur={() => {
                if (panel?.description !== description) {
                  updatePanel({ description: panel?.description });
                  setDescription(panel?.description);
                }
              }}
              sx={{
                background: "#F8F9FA",
                height: "56px",
                "& fieldset": {
                  borderRadius: "0",
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  fontSize: "0.9rem",
                },
              }}
            />
          </FormControl>
          <Filters panelId={panel.id} sessionUserCanEdit={sessionUserCanEdit} />
          <Box
            sx={{
              p: 0,
              bgcolor: "background.paper",
              borderTop: 1,
              borderColor: "divider",
              borderRadius: "0px",
              "& .MuiPaper-root": {
                borderRadius: "0px",
                borderBottom: "1px solid rgba(0, 0, 0, 0.3)",
                boxShadow: "none",
              },
            }}
          >
            <Loader
              contentHeight={resultsCollapsed ? "60px" : "400px"}
              isVisible={
                loadingPanelResults || (!results && !loadingPanelResults)
              }
            >
              {results && (
                <Accordion expanded={resultsCollapsed === true}>
                  <AccordionDetails sx={{ padding: "0px" }}>
                    <>
                      <Box
                        sx={{
                          width: "100%",
                          overflowX: "hidden",
                        }}
                      >
                        {!resultsCollapsed && (
                          <>
                            <Pagination
                              paging={paging}
                              zeroIndex
                              fetchData={({ page }) => {
                                getPanelResults({ page });
                                updatePanel({ page });
                              }}
                              noShadow
                              noBorderRadius
                            />
                            <DataGrid
                              rows={rows}
                              onPaginationModelChange={(model) => {
                                getPanelResults({ page: model.page });
                              }}
                              paginationModel={{
                                page: results?.page,
                                pageSize: results?.batchSize,
                              }}
                              initialState={{
                                sorting: {
                                  sortModel: [panel.sort],
                                },
                              }}
                              sortingOrder={["desc", "asc", null]}
                              disableColumnMenu
                              hideFooterPagination
                              hideFooter
                              rowHeight={60}
                              onColumnHeaderClick={handleColumnHeaderClick}
                              pageSizeOptions={[10]}
                              columns={columns}
                              rowCount={results?.totalCount}
                              checkboxSelection={false}
                              sortingMode="server"
                              paginationMode="server"
                              sx={{
                                border: "none",
                                paddingTop: "24px",
                                "& .MuiDataGrid-virtualScroller": {
                                  minHeight: "400px",
                                },
                              }}
                            />
                          </>
                        )}
                      </Box>
                      <Box
                        sx={{
                          padding: "18px",
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                      >
                        <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                          {results?.totalCount?.toLocaleString()}
                        </Typography>
                        <Typography sx={{ margin: "12px 6px" }}>
                          Dockets Found
                        </Typography>
                        <Tooltip
                          title={
                            collapsed ? "Expand Results" : "Collapse Results"
                          }
                        >
                          <Button
                            variant="outlined"
                            onClick={() =>
                              setPanelResultsCollapsed(!resultsCollapsed)
                            }
                            sx={{
                              marginLeft: "8px",
                              width: "32px",
                              height: "24px",
                              minWidth: "0",
                            }}
                          >
                            {resultsCollapsed ? (
                              <UnfoldMore sx={{ height: "20px" }} />
                            ) : (
                              <UnfoldLess sx={{ height: "20px" }} />
                            )}
                          </Button>
                        </Tooltip>
                      </Box>
                    </>
                  </AccordionDetails>
                </Accordion>
              )}
            </Loader>
          </Box>

          <Box
            sx={{
              bgcolor: "white",
              p: 3,
            }}
          >
            <Grid>
              <Analysis
                panelId={panelId}
                sessionUserCanEdit={sessionUserCanEdit}
              />
            </Grid>
          </Box>
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
