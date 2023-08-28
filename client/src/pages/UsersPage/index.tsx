import React, { FunctionComponent, useState } from "react";
import { useSelector } from "react-redux";

import { DataGrid, GridColDef, GridCellParams } from "@mui/x-data-grid";
import { Tooltip, Typography } from "@material-ui/core";
import { useEffectOnce } from "react-use";
import { Row } from "react-bootstrap";

import { useAuthHeader, userSelector } from "store/auth";

import UserFieldToggle from "./UserFieldToggle";
import NotAuthorized from "components/NotAuthorized";
import ColumnHeader from "components/ColumnHeader";
import DeleteUser from "./DeleteUser";

const AdminUsersPages: FunctionComponent = () => {
  const authorizationHeader = useAuthHeader();

  const [rows, setRows] = useState([]);
  const { role, id } = useSelector(userSelector);

  const isAdmin = role === "admin";

  const renderHeader = (params) => {
    return (
      <ColumnHeader
        title={params.colDef.headerName}
        dataKey={params.colDef.field}
        withTooltip
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
    fetch(`/api/users`, {
      headers: {
        ...authorizationHeader,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setRows(response.data.users);
      });
  });

  // TODO: add pagination?

  return (
    <>
      {!isAdmin ? (
        <NotAuthorized />
      ) : (
        <Row
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
        </Row>
      )}
    </>
  );
};

export default AdminUsersPages;
