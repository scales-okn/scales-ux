import React, { useState } from "react";
import { useSelector } from "react-redux";

import { DataGrid, GridColDef, GridCellParams } from "@mui/x-data-grid";
import { Tooltip, Typography } from "@mui/material";
import { useEffectOnce } from "react-use";

import { userSelector } from "src/store/auth";

import UserFieldToggle from "./UserFieldToggle";
import NotAuthorized from "src/components/NotAuthorized";
import ColumnHeader from "src/components/ColumnHeader";
import DeleteUser from "./DeleteUser";
import { makeRequest } from "src/helpers/makeRequest";

const AdminUsersPages = () => {
  const [rows, setRows] = useState([]);
  const { role, id } = useSelector(userSelector);

  const isAdmin = role === "admin";

  const renderHeader = (params) => {
    return (
      <ColumnHeader
        title={params.colDef.headerName}
        dataKey={params.colDef.field}
      />
    );
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 100, renderHeader },
    {
      field: "fullName",
      headerName: "Full name",
      description: "This column has a value getter and is not sortable.",
      sortable: false,
      width: 200,
      renderHeader,

      renderCell: (params: GridCellParams) => {
        return (
          <div>
            {params.row.firstName} {params.row.lastName}
          </div>
        );
      },
    },
    { field: "email", headerName: "Email", width: 240, renderHeader },
    {
      field: "usage",
      headerName: "Usage",
      width: 120,
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
      field: "approved",
      headerName: "Approved",
      width: 140,
      renderHeader,
      renderCell: (params: GridCellParams) => (
        <UserFieldToggle
          userId={params.row.id}
          fieldName="approved"
          value={params.row.approved}
          disabled={params.row.id === id}
        />
      ),
    },
    {
      field: "blocked",
      headerName: "Blocked",
      width: 140,
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
      width: 140,
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
      width: 150,
      renderCell: (params: GridCellParams) => {
        return (
          <DeleteUser userId={params.row.id} disabled={params.row.id === id} />
        );
      },
    });
  }

  useEffectOnce(() => {
    const fetchData = async () => {
      const response = await makeRequest.get("/api/users");
      setRows(response.data.users);
    };

    fetchData();
  });

  // TODO: add pagination?

  return (
    <>
      {!isAdmin ? (
        <NotAuthorized />
      ) : (
        <div
          style={{
            height: "60vh",
            minHeight: "300px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            disableColumnMenu
            disableColumnFilter
            hideFooterPagination
            checkboxSelection={false}
            className="bg-white p-0"
          />
        </div>
      )}
    </>
  );
};

export default AdminUsersPages;
