import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { sessionUserSelector } from "src/store/auth";

import SearchIcon from "@mui/icons-material/Search";
import { Box, TextField, InputAdornment, IconButton } from "@mui/material";
import { DataGrid, GridCellParams, GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useEffectOnce } from "react-use";

import { makeRequest } from "src/helpers/makeRequest";

import NotAuthorized from "src/components/NotAuthorized";
import ColumnHeader from "src/components/ColumnHeader";
import FeedbackDetailModal from "./FeedbackDetailModal";
import DeleteFeedback from "./DeleteFeedback";

const AdminFeedbackPage = () => {
  const [rows, setRows] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const [feedbackDetail, setFeedbackDetail] = useState(null);
  const [search, setSearch] = useState("");

  const { role } = useSelector(sessionUserSelector);
  const isAdmin = role === "admin";

  useEffectOnce(() => {
    const fetchFeedback = async () => {
      const response = await makeRequest.get(`/api/feedback`);

      if (response.status === "OK") {
        setFeedbacks(response.data.feedback);
      }
    };
    fetchFeedback();
  });

  useEffect(() => {
    if (search === "") {
      setRows(feedbacks);
    } else {
      const filteredRows = feedbacks.filter((row) => {
        const slug = (row.body as string) || "";
        return slug.toLowerCase().includes(search.toLowerCase());
      });
      setRows(filteredRows);
    }
  }, [search, feedbacks]);

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
      <Box
        sx={{
          width: "100%",
          background: "white",
          marginBottom: "12px",
          minHeight: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          borderRadius: "4px",
          boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.05)",
        }}
      >
        <TextField
          placeholder="Filter Help Texts"
          value={search}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(event.target.value)
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiInputBase-root": {
              border: "none",
              height: "42px",
              background: "white",
            },

            borderRadius: "4px",
          }}
        />
      </Box>
      {!isAdmin ? (
        <NotAuthorized />
      ) : (
        <div style={{ paddingBottom: "80px" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableColumnMenu
            disableColumnFilter
            hideFooter
            hideFooterPagination
            onCellClick={(cell) => {
              if (cell.field !== "delete") {
                setFeedbackDetail(cell);
              }
            }}
            checkboxSelection={false}
            sx={{
              bgcolor: "white",
              padding: 0,
            }}
            autoHeight
          />
        </div>
      )}
    </>
  );
};

export default AdminFeedbackPage;
