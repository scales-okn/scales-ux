import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHelpTexts } from "src/store/helpTexts";
import { userSelector } from "src/store/auth";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useParams, useNavigate } from "react-router-dom";

import ColumnHeader from "src/components/ColumnHeader";
import NotAuthorized from "src/components/NotAuthorized";
import FeedbackDetailModal from "./HelpTextDetailModal";
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
      field: "slug",
      headerName: "Slug",
      width: 150,
      sortable: false,
      renderHeader,
    },
    {
      field: "description",
      headerName: "Description",
      minWidth: 300,
      sortable: false,
      flex: 1,
      renderHeader,
    },
    {
      field: "examples",
      headerName: "Examples",
      minWidth: 200,
      sortable: false,
      flex: 1,
      renderHeader,
    },
    {
      field: "options",
      headerName: "Options",
      minWidth: 200,
      sortable: false,
      flex: 1,
      renderHeader,
    },
    {
      field: "links",
      headerName: "Links",
      minWidth: 200,
      sortable: false,
      flex: 1,
      renderHeader,
    },
  ];

  return (
    <>
      <NewHelpText />
      {helpTextSlug && (
        <FeedbackDetailModal
          feedbackDetail={feedbackDetail}
          closeModal={() => navigate("/admin/help-texts")}
        />
      )}
      {!isAdmin ? (
        <NotAuthorized />
      ) : (
        <div style={{ height: "60vh", width: "100%", margin: "0 auto" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableColumnMenu
            disableColumnFilter
            onRowClick={({ row }) => navigate(`/admin/help-texts/${row.slug}`)}
            checkboxSelection={false}
            className="bg-white p-0"
            hideFooterPagination
          />
        </div>
      )}
    </>
  );
};

export default HelpTextsPage;
