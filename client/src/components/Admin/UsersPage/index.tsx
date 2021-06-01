import React, { FunctionComponent, useState, useEffect } from "react";
import { useAuthHeader, useAuthUser } from "react-auth-kit";
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
} from "@material-ui/data-grid";
import PageLayout from "../../PageLayout";
import NotAuthorized from "../../NotAuthorized";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "firstName", headerName: "First name", width: 150 },
  { field: "lastName", headerName: "Last name", width: 150 },
  {
    field: "fullName",
    headerName: "Full name",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 160,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.getValue(params.id, "firstName") || ""} ${
        params.getValue(params.id, "lastName") || ""
      }`,
  },
  { field: "createdAt", headerName: "Created At", width: 200 },
  { field: "updatedAt", headerName: "Updated At", width: 200 },
  { field: "email", headerName: "Email", width: 150 },
  { field: "role", headerName: "Role", width: 140 },
  { field: "approved", headerName: "Approved", width: 140 },
  { field: "blocked", headerName: "Blocked", width: 140 },
];

const AdminUsersPages: FunctionComponent = () => {
  const auth = useAuthUser();
  const authHeader = useAuthHeader();
  const isAdmin = auth()?.user?.role === "admin";
  const [rows, setRows] = useState([]);

  console.log(auth(), authHeader());

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/users`, {
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        setRows(response.data.users);
      });
  }, []);

  return (
    <PageLayout>
      {!isAdmin ? (
        <NotAuthorized />
      ) : (
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            checkboxSelection
          />
        </div>
      )}
    </PageLayout>
  );
};

export default AdminUsersPages;
