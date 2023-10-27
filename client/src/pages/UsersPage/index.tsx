import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { DataGrid, GridColDef, GridCellParams } from "@mui/x-data-grid";
import {
  Tooltip,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material/styles";
import { useEffectOnce } from "react-use";
import dayjs from "dayjs";

import useDebounce from "src/hooks/useDebounce";

import { sessionUserSelector } from "src/store/auth";
import { useUser } from "src/store/user";

import NewUserModal from "./NewUserModal";
import UserFieldToggle from "./UserFieldToggle";
import NotAuthorized from "src/components/NotAuthorized";
import ColumnHeader from "src/components/ColumnHeader";
import DeleteUser from "./DeleteUser";
import Pagination from "src/components/Pagination";

const AdminUsersPages = () => {
  const { role, id } = useSelector(sessionUserSelector);
  const { fetchUsers, users, usersPaging } = useUser();
  const theme = useTheme();

  const [rawSearch, setRawSearch] = useState(null);
  const debouncedSearch = useDebounce(rawSearch, 1000);

  useEffect(() => {
    fetchUsers({ search: debouncedSearch });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const isAdmin = role === "admin";

  useEffectOnce(() => {
    fetchUsers({ page: 1 });
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
      field: "id",
      headerName: "ID",
      headerAlign: "center",
      align: "center",
      width: 50,
      renderHeader,
    },
    {
      field: "fullName",
      headerName: "User",
      description: "This column has a value getter and is not sortable.",
      sortable: false,
      minWidth: 200,
      flex: 2,
      renderHeader,
      renderCell: (params: GridCellParams) => {
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
              {params.row.firstName} {params.row.lastName}
            </Typography>
            <Typography sx={{ fontStyle: "italic" }}>
              {params.row.email}
            </Typography>
          </div>
        );
      },
    },
    {
      field: "usage",
      headerName: "Usage",
      minWidth: 120,
      flex: 1,
      renderHeader,
      renderCell: (params: GridCellParams) => (
        <Tooltip title={params.row.usage}>
          <Typography noWrap variant="body2">
            {params.row.usage}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 110,
      renderHeader,
      renderCell: (params: GridCellParams) => (
        <Tooltip title={params.row.createdAt}>
          <Typography noWrap variant="body2">
            <div>{dayjs(params.row.createdAt).format("MM/DD/YYYY")}</div>
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "userIsVerified",
      headerName: "Verified",
      headerAlign: "center",
      align: "center",
      width: 110,
      renderHeader,
      renderCell: (params: GridCellParams) => (
        <UserFieldToggle
          userId={params.row.id}
          fieldName="emailIsVerified"
          value={params.row.emailIsVerified}
          disabled={params.row.emailIsVerified === true}
        />
      ),
    },
    {
      field: "blocked",
      headerName: "Blocked",
      headerAlign: "center",
      align: "center",
      width: 110,
      renderHeader,
      renderCell: (params: GridCellParams) => (
        <UserFieldToggle
          userId={params.row.id}
          fieldName="blocked"
          value={params.row.blocked}
          disabled={params.row.id === id}
        />
      ),
    },
  ];

  if (isAdmin) {
    columns.push({
      field: "admin",
      headerName: "Admin",
      headerAlign: "center",
      align: "center",
      width: 110,
      renderHeader,
      renderCell: (params: GridCellParams) => {
        return (
          <UserFieldToggle
            disabled={params.row.id === id}
            userId={params.row.id}
            fieldName="role"
            value={params.row.role === "admin"}
          />
        );
      },
    });
    columns.push({
      field: "delete",
      headerName: "Delete",
      headerAlign: "center",
      align: "center",
      width: 110,
      renderHeader,
      renderCell: (params: GridCellParams) => {
        return (
          <DeleteUser userId={params.row.id} disabled={params.row.id === id} />
        );
      },
    });
  }

  return (
    <Box sx={{ paddingBottom: "80px" }}>
      <NewUserModal />
      {!isAdmin ? (
        <NotAuthorized />
      ) : (
        <div
          style={{
            minHeight: "300px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <Pagination
            paging={usersPaging}
            fetchData={fetchUsers}
            leftContent={
              <TextField
                placeholder="Filter Users"
                value={rawSearch}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setRawSearch(event.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    border: "none",
                    height: "42px",
                    background: "white",
                  },

                  borderRadius: "4px",
                }}
              />
            }
          />
          <DataGrid
            rows={users}
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
      )}
    </Box>
  );
};

export default AdminUsersPages;
