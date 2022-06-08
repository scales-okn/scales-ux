import React, { useEffect } from "react";
import PageLayout from "components/PageLayout";
import Loader from "components/Loader";
import { useRings } from "store/rings";
import { DataGrid } from "@material-ui/data-grid";
import { Row, OverlayTrigger, Tooltip } from "react-bootstrap";
import dayjs from "dayjs";
import {GridCellParams} from "@material-ui/data-grid";
import { Link } from "react-router-dom";

const RingsPage: React.FC = () => {
  const { getRings, rings, loadingRings } = useRings();

  useEffect(() => {
    if (loadingRings) return null;

    getRings();
  }, []);

  return (
    <PageLayout>
      <Loader animation="border" isVisible={loadingRings}>
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
                headerName: "RID",
                width: 300,
              },
              {
                field: "description",
                headerName: "Description",
                width: 300,
              },
              {
                field: "createdAt",
                headerName: "Created at",
                width: 200,
                renderCell: (params: GridCellParams) => (
                  <>{dayjs(params.row.createdAt).format("M/D/YYYY")}</>
                ),
              }, {
                field: "updatedAt",
                headerName: "Updated at",
                width: 200,
                renderCell: (params: GridCellParams) => (
                  <>{dayjs(params.row.updatedAt).format("M/D/YYYY")}</>
                ),
              }, {
                field: "visibility",
                headerName: "Visibility",
                width: 150,
              }
            ]}
            pageSize={5}
            checkboxSelection={false}
            className="bg-white p-0"
          />
        </Row>
      </Loader>
    </PageLayout>
  );
}

export default RingsPage;