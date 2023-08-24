import React, { useState } from "react";
import { DataGrid, GridColDef, GridCellParams } from "@material-ui/data-grid";
import dayjs from "dayjs";
import { useEffectOnce } from "react-use";
import PageLayout from "../../components/PageLayout";
import NotAuthorized from "../../components/NotAuthorized";
import FeedbackDetailModal from "./FeedbackDetailModal";
import { Row } from "react-bootstrap";
import { useAuthHeader, userSelector } from "store/auth";
import { useSelector } from "react-redux";
import NewHelpText from "./NewHelpText";

const HelpTextsPage = () => {
  const [rows, setRows] = useState([]);

  const [feedbackDetail, setFeedbackDetail] = useState(null);

  const authorizationHeader = useAuthHeader();

  const { role } = useSelector(userSelector);
  const isAdmin = role === "admin";

  useEffectOnce(() => {
    fetch(`/api/helpTexts`, {
      headers: {
        ...authorizationHeader,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setRows(response.data.helperTexts);
      });
  });

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "description",
      headerName: "Description",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "examples",
      headerName: "Examples",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "options",
      headerName: "Options",
      minWidth: 150,
    },
    {
      field: "links",
      headerName: "Links",
      minWidth: 150,
    },
  ];

  return (
    <PageLayout>
      <NewHelpText />
      {feedbackDetail && (
        <FeedbackDetailModal
          feedbackDetail={feedbackDetail.row.body}
          closeModal={setFeedbackDetail}
        />
      )}
      {!isAdmin ? (
        <NotAuthorized />
      ) : (
        <Row style={{ height: 400, width: "100%", margin: "0 auto" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            onRowClick={(row) => setFeedbackDetail(row)}
            pageSize={5}
            checkboxSelection={false}
            className="bg-white p-0"
          />
        </Row>
      )}
    </PageLayout>
  );
};

export default HelpTextsPage;
