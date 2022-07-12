import React, { useEffect } from "react";
import PageLayout from "components/PageLayout";
import Loader from "components/Loader";
import { useRings } from "store/rings";
import { DataGrid } from "@material-ui/data-grid";
import { Row, OverlayTrigger, Tooltip, Button } from "react-bootstrap";
import dayjs from "dayjs";
import { GridCellParams } from "@material-ui/data-grid";
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
        <Button variant="primary" className="mb-3 text-white float-end me-3"
        style={{
          minWidth: "200px",
        }}>
          <Link
            to="/rings/create"
            className="text-white text-decoration-none">
            Create Ring
          </Link>
        </Button>
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
              },
              {
                field: "delete",
                headerName: "Actions",
                width: 50,
                renderCell: (params: GridCellParams) => (
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-top">
                        <strong>Delete</strong>
                      </Tooltip>
                    }
                  >
                    <Button
                      variant="danger"
                      className="text-white text-decoration-none"
                      onClick={() => {
                        console.log("delete");
                      }
                      }
                    >
                      <i className="fas fa-trash-alt"></i>
                    </Button>
                  </OverlayTrigger>
                )
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