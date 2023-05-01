import React, { FunctionComponent, useState } from "react";
import {
  DataGrid,
  GridColDef,
  // GridValueGetterParams,
  GridCellParams,
} from "@material-ui/data-grid";
import { useEffectOnce } from "react-use";
import PageLayout from "../../components/PageLayout";
import NotAuthorized from "../../components/NotAuthorized";
import FeedbackDetailModal from "./FeedbackDetailModal";
// import UserFieldToggle from "./UserFieldToggle";
import { Row } from "react-bootstrap";
import { useAuthHeader, userSelector } from "store/auth";
import { useSelector } from "react-redux";
import DeleteFeedback from "./DeleteFeedback";

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

  const columns: GridColDef[] = [
    // { field: "id", headerName: "ID", width: 100 },
    {
      field: "body",
      headerName: "Feedback",
      description: "This column has a value getter and is not sortable.",
      sortable: false,
      minWidth: 200,
      flex: 1,
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 150,
      renderCell: (params: GridCellParams) => {
        return <DeleteFeedback feedbackId={params.row.id} />;
      },
    },
  ];

  return (
    <PageLayout>
      {feedbackDetail && <FeedbackDetailModal feedbackDetail={feedbackDetail.row.body} closeModal={setFeedbackDetail} />}
      {!isAdmin ? (
        <NotAuthorized />
      ) : (
        <Row style={{ height: 400, width: "100%" }}>
          <DataGrid rows={rows} columns={columns} onRowClick={(row) => setFeedbackDetail(row)} pageSize={5} checkboxSelection={false} className="bg-white p-0" />
        </Row>
      )}
    </PageLayout>
  );
};

export default AdminFeedbackPage;
