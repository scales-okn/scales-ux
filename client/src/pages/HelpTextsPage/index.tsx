import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@material-ui/data-grid";
import { useParams, useNavigate } from "react-router-dom";
import { useHelpTexts } from "store/helpTexts";
import PageLayout from "../../components/PageLayout";
import NotAuthorized from "../../components/NotAuthorized";
import FeedbackDetailModal from "./FeedbackDetailModal";
import { Row } from "react-bootstrap";
import { userSelector } from "store/auth";
import { useSelector } from "react-redux";
import NewHelpText from "./NewHelpText";

const HelpTextsPage = () => {
  const navigate = useNavigate();
  const { helpTexts } = useHelpTexts();
  const { helpTextSlug } = useParams();

  const [rows, setRows] = useState([]);

  const feedbackDetail = rows.find((row) => row.slug === helpTextSlug);

  const { role } = useSelector(userSelector);
  const isAdmin = role === "admin";

  useEffect(() => {
    setRows(helpTexts);
  }, [helpTexts]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 100, sortable: false },
    { field: "slug", headerName: "Slug", width: 150, sortable: false },
    {
      field: "description",
      headerName: "Description",
      minWidth: 200,
      sortable: false,
      flex: 1,
    },
    {
      field: "examples",
      headerName: "Examples",
      minWidth: 200,
      sortable: false,
      flex: 1,
    },
    {
      field: "options",
      headerName: "Options",
      minWidth: 200,
      sortable: false,
      flex: 1,
    },
    {
      field: "links",
      headerName: "Links",
      minWidth: 200,
      sortable: false,
      flex: 1,
    },
  ];

  return (
    <PageLayout>
      <NewHelpText />
      {helpTextSlug && (
        <FeedbackDetailModal
          feedbackDetail={feedbackDetail}
          closeModal={() => navigate("/help-texts")}
        />
      )}
      {!isAdmin ? (
        <NotAuthorized />
      ) : (
        <Row style={{ height: 400, width: "100%", margin: "0 auto" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableColumnMenu
            disableColumnFilter
            onRowClick={({ row }) => navigate(`/help-texts/${row.slug}`)}
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
