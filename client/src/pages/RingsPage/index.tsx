import React from "react";
import { Link } from "react-router-dom";
import { useRings } from "src/store/rings";

import { useEffectOnce } from "react-use";
import { DataGrid, GridCellParams, GridColDef } from "@mui/x-data-grid";
import { Button, Box, Typography } from "@mui/material";
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

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      minWidth: 150,
      flex: 1,
      renderCell: (params: GridCellParams) => (
        <Link to={`/admin/rings/${params.row.rid}`}>{params.row.name}</Link>
      ),
      renderHeader,
    },
    {
      field: "description",
      headerName: "Description",
      width: 200,
      flex: 2,
      renderHeader,
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params: GridCellParams) => (
        <>{dayjs(params.row.createdAt).format("MMM D, YYYY")}</>
      ),
      renderHeader,
    },
    {
      field: "updatedAt",
      headerName: "Updated",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params: GridCellParams) => (
        <>{dayjs(params.row.updatedAt).format("MMM D, YYYY")}</>
      ),
      renderHeader,
    },
    {
      field: "visibility",
      headerName: "Visibility",
      width: 150,
      renderHeader,
      headerAlign: "center",
      align: "center",
      renderCell: (params: GridCellParams) => (
        <Typography sx={{ textTransform: "capitalize", fontSize: "14px" }}>
          {params.row.visibility}
        </Typography>
      ),
    },
  ];

  return (
    <>
      <Loader isVisible={loadingRings}>
        <Box
          sx={{
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
              sx={{
                bgcolor: "white",
                padding: 0,
              }}
              autoHeight
            />
          </div>
        </Box>
      </Loader>
    </>
  );
};

export default RingsPage;
