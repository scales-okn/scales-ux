import React from "react";
import { Link } from "react-router-dom";
import { useRings } from "src/store/rings";

import { useEffectOnce } from "react-use";
import { DataGrid, GridCellParams } from "@mui/x-data-grid";
import dayjs from "dayjs";

import ColumnHeader from "src/components/ColumnHeader";
import Loader from "src/components/Loader";
import StandardButton from "src/components/Buttons/StandardButton";

const RingsPage: React.FC = () => {
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
        <Link to={`/admin/rings/${params.row.id}`} className="ms-2">
          {params.row.name}
        </Link>
      ),
      renderHeader,
    },
    {
      field: "rid",
      headerName: "Ring ID",
      width: 200,
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
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Link
            to="/admin/rings/create"
            className="text-white text-decoration-none"
          >
            <StandardButton
              variant="primary"
              className="mb-3 text-white float-end me-3"
              style={{
                minWidth: "200px",
                background: "var(--sea-green)",
                border: "none",
              }}
            >
              Create Ring
            </StandardButton>
          </Link>
          <div style={{ height: "60vh", width: "100%", margin: "0 auto" }}>
            <DataGrid
              rows={rings}
              columns={columns}
              disableColumnMenu
              disableColumnFilter
              hideFooterPagination
              checkboxSelection={false}
              className="bg-white p-0"
            />
          </div>
        </div>
      </Loader>
    </>
  );
};

export default RingsPage;
