import React, { FunctionComponent, useState } from "react";
import { useSelector } from "react-redux";
import { userSelector } from "src/store/auth";

import { DataGrid, GridCellParams, GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useEffectOnce } from "react-use";

import { makeRequest } from "src/helpers/makeRequest";

import NotAuthorized from "src/components/NotAuthorized";
import ColumnHeader from "src/components/ColumnHeader";
import FeedbackDetailModal from "./FeedbackDetailModal";
import DeleteFeedback from "./DeleteFeedback";

const AdminFeedbackPage: FunctionComponent = () => {
  const [rows, setRows] = useState([]);

  const [feedbackDetail, setFeedbackDetail] = useState(null);

  const { role } = useSelector(userSelector);
  const isAdmin = role === "admin";

  useEffectOnce(() => {
    const fetchFeedback = async () => {
      const response = await makeRequest.get(`/api/feedback`);

      if (response.status === "OK") {
        setRows(response.data.feedback);
      }
    };
    fetchFeedback();
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
      sortable: false,
      width: 300,
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
        <div style={{ height: "60vh", width: "100%", margin: "0 auto" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            onCellClick={(cell) => {
              if (cell.field !== "delete") {
                setFeedbackDetail(cell);
              }
            }}
            hideFooterPagination
            checkboxSelection={false}
            className="bg-white p-0"
          />
        </div>
      )}
    </>
  );
};

export default AdminFeedbackPage;
