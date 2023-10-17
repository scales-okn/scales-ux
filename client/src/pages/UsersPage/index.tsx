import React from "react";
import { useSelector } from "react-redux";

import { DataGrid, GridColDef, GridCellParams } from "@mui/x-data-grid";
import { Tooltip, Typography } from "@mui/material";
import { useEffectOnce } from "react-use";
import dayjs from "dayjs";

import { sessionUserSelector } from "src/store/auth";
import { useUser } from "src/store/user";

import UserFieldToggle from "./UserFieldToggle";
import NotAuthorized from "src/components/NotAuthorized";
import ColumnHeader from "src/components/ColumnHeader";
import DeleteUser from "./DeleteUser";
import Pagination from "src/components/Pagination";

const AdminUsersPages = () => {
  const { role, id } = useSelector(sessionUserSelector);
  const { fetchUsers, users, usersPaging } = useUser();

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
    { field: "id", headerName: "ID", width: 50, renderHeader },
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
      field: "createdAt",
      headerName: "Created At",
      width: 120,
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
      field: "userIsVerified",
      headerName: "Verified",
      width: 140,
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
          <Pagination paging={usersPaging} fetchData={fetchUsers} />
          <DataGrid
            rows={users}
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
