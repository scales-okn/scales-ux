import React from "react";
import { Link } from "react-router-dom";
import { useRings } from "src/store/rings";

import { useEffectOnce } from "react-use";
import { DataGrid, GridCellParams } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import dayjs from "dayjs";

import ColumnHeader from "src/components/ColumnHeader";
import Loader from "src/components/Loader";

const RingsPage = () => {
  const { getRings, rings, loadingRings } = useRings();

  useEffectOnce(() => {
    if (loadingRings) return null;
    getRings();
  });

  const renderHeader = (params) => {
    return (
      <ColumnHeader
        title={params.colDef.headerName}
        dataKey={params.colDef.field}
      />
    );
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 150,
      renderCell: (params: GridCellParams) => (
        <Link to={`/admin/rings/${params.row.rid}`} className="ms-2">
          {params.row.name}
        </Link>
      ),
      renderHeader,
    },
    {
      field: "description",
      headerName: "Description",
      width: 200,
      renderHeader,
    },
    {
      field: "createdAt",
      headerName: "Created at",
      width: 200,
      renderCell: (params: GridCellParams) => (
        <>{dayjs(params.row.createdAt).format("M/D/YYYY")}</>
      ),
      renderHeader,
    },
    {
      field: "updatedAt",
      headerName: "Updated at",
      width: 200,
      renderCell: (params: GridCellParams) => (
        <>{dayjs(params.row.updatedAt).format("M/D/YYYY")}</>
      ),
      renderHeader,
    },
    {
      field: "visibility",
      headerName: "Visibility",
      width: 150,
      renderHeader,
    },
  ];

  return (
    <>
      <Loader isVisible={loadingRings}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            marginBottom: "80px",
          }}
        >
          <Link
            to="/admin/rings/create"
            className="text-white text-decoration-none"
          >
            <Button
              color="primary"
              variant="contained"
              sx={{
                minWidth: "200px",
                marginBottom: "24px",
              }}
            >
              Create Ring
            </Button>
          </Link>
          <div
            style={{
              height: "60vh",
              width: "100%",
              margin: "0 auto",
            }}
          >
            <DataGrid
              rows={rings}
              columns={columns}
              rowHeight={80}
              disableColumnMenu
              disableColumnFilter
              hideFooterPagination
              hideFooter
              checkboxSelection={false}
              className="bg-white p-0"
              autoHeight
            />
          </div>
        </div>
      </Loader>
    </>
  );
};

export default RingsPage;
