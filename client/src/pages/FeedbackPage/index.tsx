import React, { FunctionComponent, useState } from "react";
import { DataGrid, GridCellParams, GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useEffectOnce } from "react-use";
import NotAuthorized from "components/NotAuthorized";
import FeedbackDetailModal from "./FeedbackDetailModal";
import { Row } from "react-bootstrap";
import { useAuthHeader, userSelector } from "store/auth";
import { useSelector } from "react-redux";
import DeleteFeedback from "./DeleteFeedback";
import ColumnHeader from "components/ColumnHeader";

const AdminFeedbackPage: FunctionComponent = () => {
  const [rows, setRows] = useState([]);

  const [feedbackDetail, setFeedbackDetail] = useState(null);
  const authorizationHeader = useAuthHeader();

  const { role } = useSelector(userSelector);
  const isAdmin = role === "admin";

  useEffectOnce(() => {
    fetch(`/api/feedback`, {
      headers: {
        ...authorizationHeader,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setRows(response.data.feedback);
      });
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
      field: "body",
      headerName: "Feedback",
      description: "This column has a value getter and is not sortable.",
      sortable: false,
      minWidth: 200,
      flex: 1,
      renderHeader,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      description: "This column has a value getter and is not sortable.",
      sortable: false,
      minWidth: 200,
      flex: 1,
      renderCell: (params: GridCellParams) => {
        return (
          <div>{dayjs(params.row.createdAt).format("dddd, MMMM D YYYY")}</div>
        );
      },
      renderHeader,
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 150,
      renderCell: (params: GridCellParams) => {
        return <DeleteFeedback feedbackId={params.row.id} />;
      },
      renderHeader,
    },
  ];

  return (
    <>
      {feedbackDetail && (
        <FeedbackDetailModal
          feedbackDetail={feedbackDetail.row.body}
          closeModal={setFeedbackDetail}
        />
      )}
      {!isAdmin ? (
        <NotAuthorized />
      ) : (
        <Row style={{ height: "60vh", width: "100%", margin: "0 auto" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            onRowClick={(row) => setFeedbackDetail(row)}
            hideFooterPagination
            checkboxSelection={false}
            className="bg-white p-0"
          />
        </Row>
      )}
    </>
  );
};

export default AdminFeedbackPage;
