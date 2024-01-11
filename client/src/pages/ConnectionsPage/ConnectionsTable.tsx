import React, { useState, useEffect } from "react";

import { DataGrid, GridColDef, GridCellParams } from "@mui/x-data-grid";
import {
  Tooltip,
  Typography,
  Box,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material/styles";
import { useEffectOnce } from "react-use";
import dayjs from "dayjs";

import useWindowSize from "src/hooks/useWindowSize";
import useDebounce from "src/hooks/useDebounce";

import { useSessionUser } from "src/store/auth";
import { useConnection } from "src/store/connection";

import ColumnHeader from "src/components/ColumnHeader";
import Pagination from "src/components/Pagination";
import NewConnectionModal from "./NewConnectionModal";

const ConnectionsTable = () => {
  // const { fetchUsers, users, usersPaging } = useUser();
  const { fetchConnections, connections, connectionsPaging } = useConnection();
  const theme = useTheme();
  const { role, id: userId } = useSessionUser();

  const [filterType, setFilterType] = useState("all");
  const [rawSearch, setRawSearch] = useState(null);
  const debouncedSearch = useDebounce(rawSearch, 1000);

  const { width } = useWindowSize();
  const isMobile = width < 500;

  useEffect(() => {
    fetchConnections({
      userId,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(filterType === "pending" ? { pending: true } : {}),
      ...(filterType === "approved" ? { approved: true } : {}),
      ...(filterType === "declined" ? { approved: false } : {}),
    });
  }, [debouncedSearch, filterType]); // eslint-disable-line react-hooks/exhaustive-deps

  // const isAdmin = role === "admin";

  useEffectOnce(() => {
    fetchConnections({ userId });
  });

  const renderHeader = (params) => {
    return (
      <ColumnHeader
        title={params.colDef.headerName}
        dataKey={params.colDef.field}
      />
    );
  };

  const columns: GridColDef[] = [
    {
      field: "fullName",
      headerName: "Name",
      sortable: false,
      minWidth: 200,
      flex: 2,
      renderHeader,
      renderCell: (params: GridCellParams) => {
        const userToDisplay =
          params.row.senderUser?.id === userId
            ? params.row.receiverUser
            : params.row.senderUser;

        return (
          <div>
            <Typography
              noWrap
              sx={{
                color: theme.palette.primary.dark,
                fontWeight: "bold",
                overflow: "ellipses",
              }}
            >
              {userToDisplay?.firstName} {userToDisplay?.lastName}
            </Typography>
            <Typography sx={{ fontStyle: "italic" }}>
              {userToDisplay?.email}
            </Typography>
          </div>
        );
      },
    },
    {
      field: "note",
      headerName: "Note",
      sortable: false,
      minWidth: 200,
      flex: 2,
      renderHeader,
      renderCell: (params: GridCellParams) => (
        <Typography noWrap variant="body2">
          {params.row.note}
        </Typography>
      ),
    },
    {
      field: "createdAt",
      headerName: "Sent On",
      minWidth: 150,
      sortable: false,
      flex: 1,
      renderHeader,
      renderCell: (params: GridCellParams) => (
        <Typography noWrap variant="body2">
          {dayjs(params.row.createdAt).format("MMMM DD, YYYY")}
        </Typography>
      ),
    },
    {
      field: "pending",
      headerName: "Status",
      width: 150,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderHeader,
      renderCell: (params: GridCellParams) => {
        const bgColor = params.row.pending === true ? "orange" : "green";

        return (
          <Tooltip title={params.row.usage}>
            <Box
              sx={{
                background: bgColor,
                color: "white",
                padding: "4px 8px",
                borderRadius: "4px",
              }}
            >
              {params.row.pending ? "Pending" : "Approved"}
            </Box>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Box sx={{ paddingBottom: "80px" }}>
      <NewConnectionModal />
      <div
        style={{
          minHeight: "300px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <Pagination
          paging={connectionsPaging}
          fetchData={fetchConnections}
          leftContent={
            <Grid container sx={{ flexDirection: isMobile ? "column" : "row" }}>
              <Select
                MenuProps={{
                  disableScrollLock: true,
                }}
                value={filterType}
                onChange={(event) => {
                  setFilterType(event.target.value as string);
                  setRawSearch("");
                }}
                sx={{
                  background: "white",
                  borderRadius: "4px",
                  height: "42px",
                  width: isMobile ? "100%" : "180px",
                }}
              >
                <MenuItem value="all">All Connections</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="declined">Declined</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </Grid>
          }
        />
        <DataGrid
          rows={connections}
          columns={columns}
          rowHeight={80}
          disableColumnMenu
          disableColumnFilter
          hideFooter
          hideFooterPagination
          checkboxSelection={false}
          className="bg-white p-0"
          autoHeight
        />
      </div>
    </Box>
  );
};

export default ConnectionsTable;
