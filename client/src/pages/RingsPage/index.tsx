import React from "react";
import PageLayout from "components/PageLayout";
import Loader from "components/Loader";
import { useRings } from "store/rings";
import { DataGrid } from "@material-ui/data-grid";
import { Row, Button } from "react-bootstrap";
import dayjs from "dayjs";
import { GridCellParams } from "@material-ui/data-grid";
import { Link } from "react-router-dom";
import { useEffectOnce } from "react-use";

const RingsPage: React.FC = () => {
  const { getRings, rings, loadingRings } = useRings();

  useEffectOnce(() => {
    if (loadingRings) return null;
    getRings();
  });

  return (
    <PageLayout>
      <Loader animation="border" isVisible={loadingRings}>
        <Link to="/rings/create" className="text-white text-decoration-none">
          <Button
            variant="primary"
            className="mb-3 text-white float-end me-3"
            style={{
              minWidth: "200px",
              background: "var(--sea-green)",
              border: "none",
            }}
          >
            Create Ring
          </Button>
        </Link>
        <Row style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={rings}
            columns={[
              {
                field: "name",
                headerName: "Name",
                width: 150,
                renderCell: (params: GridCellParams) => (
                  <Link to={`/rings/${params.row.id}`} className="ms-2">
                    {params.row.name}
                  </Link>
                ),
              },
              {
                field: "rid",
                headerName: "Ring ID",
                width: 200,
              },
              {
                field: "description",
                headerName: "Description",
                width: 200,
              },
              {
                field: "createdAt",
                headerName: "Created at",
                width: 200,
                renderCell: (params: GridCellParams) => (
                  <>{dayjs(params.row.createdAt).format("M/D/YYYY")}</>
                ),
              },
              {
                field: "updatedAt",
                headerName: "Updated at",
                width: 200,
                renderCell: (params: GridCellParams) => (
                  <>{dayjs(params.row.updatedAt).format("M/D/YYYY")}</>
                ),
              },
              {
                field: "visibility",
                headerName: "Visibility",
                width: 150,
              },
            ]}
            rowsPerPageOptions={[5]}
            pageSize={5}
            checkboxSelection={false}
            className="bg-white p-0"
          />
        </Row>
      </Loader>
    </PageLayout>
  );
};

export default RingsPage;
