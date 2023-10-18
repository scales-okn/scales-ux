/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { DataGrid, GridCellParams } from "@mui/x-data-grid";
import {
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Switch,
  Button,
} from "@mui/material";

import { useEffectOnce } from "react-use";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";

import { sessionUserSelector } from "src/store/auth";
import { useNotebook } from "src/store/notebook";
import { useUser } from "src/store/user";

import useWindowSize from "src/hooks/useWindowSize";
import useDebounce from "src/hooks/useDebounce";

import Pagination from "src/components/Pagination";
import Loader from "src/components/Loader";
import ColumnHeader from "src/components/ColumnHeader";

import "./NotebooksPage.scss";
import DeleteNotebook from "./DeleteNotebook";

const NotebooksPage = () => {
  const user = useSelector(sessionUserSelector);
  const { role } = useSelector(sessionUserSelector);
  const isAdmin = role === "admin";

  const { width } = useWindowSize();
  const isMobile = width < 500;

  const [notebooksType, setNotebooksType] = useState("my-notebooks");

  const {
    fetchNotebooks,
    loadingNotebooks,
    updateNotebook,
    notebooks,
    paging,
  } = useNotebook();

  const { fetchUsers, users } = useUser();

  const [rawSearch, setRawSearch] = useState(null);
  const debouncedSearch = useDebounce(rawSearch, 1000);

  useEffect(() => {
    fetchNotebooks({
      type: notebooksType,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffectOnce(() => {
    if (isAdmin) {
      // TODO: Refactor this out
      fetchUsers({ page: 1, limit: 1000 });
    }
  });

  useEffect(() => {
    fetchNotebooks({ type: notebooksType, page: 1 });
  }, [notebooksType]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateNotebookVisibility = (id, visibility) => {
    const out = visibility === "public" ? "private" : "public";

    updateNotebook(id, {
      visibility: out,
    });
  };

  const notebooksData = notebooks
    .filter((notebook) => {
      if (notebooksType === "my-notebooks") {
        return notebook.userId === user.id;
      }
      if (notebooksType === "public") {
        return notebook.visibility === "public";
      }

      return true;
    })
    .filter((notebook) => notebook.title.toLowerCase());

  const renderHeader = (params) => {
    return (
      <ColumnHeader
        title={params.colDef.headerName}
        dataKey={params.colDef.field}
      />
    );
  };

  const columns = [
    {
      field: "title",
      headerName: "Name",
      minWidth: 250,
      flex: 1,
      editable: true,
      sortable: false,
      renderHeader,
      renderCell: (params: GridCellParams) => (
        <Link to={`/notebooks/${params.row.id}`} className="ms-2">
          {params.row.title}
        </Link>
      ),
    },
    {
      field: "updatedAt",
      headerName: "Last Modified",
      width: 150,
      editable: false,
      sortable: false,
      renderHeader,
      renderCell: (params: GridCellParams) => (
        <>{dayjs(params.row.createdAt).format("M/D/YYYY")}</>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created On",
      width: 150,
      editable: false,
      sortable: false,
      renderHeader,
      renderCell: (params: GridCellParams) => (
        <>{dayjs(params.row.createdAt).format("M/D/YYYY")}</>
      ),
    },
    ...(notebooksType === "my-notebooks" || isAdmin
      ? [
          {
            field: "visibility",
            headerName: "Public",
            width: 130,
            editable: false,
            renderHeader,
            renderCell: (params: GridCellParams) => {
              return (
                <Switch
                  disabled={params.row.userId !== user.id}
                  checked={params.row.visibility === "public"}
                  onChange={() =>
                    updateNotebookVisibility(
                      params.row.id,
                      params.row.visibility,
                    )
                  }
                  color="primary"
                />
              );
            },
          },
        ]
      : []),
    ...(notebooksType === "my-notebooks" || isAdmin
      ? [
          {
            field: "userId",
            headerName: "Owner",
            width: 150,
            sortable: false,
            renderHeader,
            renderCell: (params: GridCellParams) => {
              if (params.row.userId === user.id) {
                return <>You</>;
              } else {
                // hacky workaround to accommodate existing db schema, should fix. Users should be populated in notebooks call
                const user = users.find((u) => u.id === params.row.userId);
                return isAdmin ? (
                  <Link to="/admin/users">
                    {user.firstName} {user.lastName}
                  </Link>
                ) : (
                  <span>
                    {user.firstName} {user.lastName}
                  </span>
                );
              }
            },
          },
        ]
      : []),
    ...(notebooksType === "my-notebooks" || isAdmin
      ? [
          {
            field: "delete",
            headerName: "Delete",
            width: 75,
            renderCell: (params: GridCellParams) => {
              const canDelete = params.row.userId === user.id;
              return (
                <div style={{ paddingLeft: "5px" }}>
                  <DeleteNotebook
                    notebookId={params.row.id}
                    disabled={!canDelete}
                  />
                </div>
              );
            },
            renderHeader,
          },
        ]
      : []),
  ];

  return (
    <Loader isVisible={loadingNotebooks}>
      <>
        <Grid
          container
          spacing={2}
          sx={{
            alignItems: "center",
            justifyContent: "flex-end",
            marginTop: "60px",
          }}
        >
          <Link to="/notebooks/new" className="text-white text-decoration-none">
            <Button color="primary" variant="contained">
              Create Notebook
            </Button>
          </Link>
        </Grid>

        <div
          style={{
            width: "100%",
            paddingBottom: "80px",
            marginTop: "24px",
          }}
        >
          <Pagination
            leftContent={
              <Grid
                container
                sx={{ flexDirection: isMobile ? "column" : "row" }}
              >
                <Select
                  MenuProps={{
                    disableScrollLock: true,
                  }}
                  value={notebooksType}
                  onChange={(event) =>
                    setNotebooksType(event.target.value as string)
                  }
                  sx={{
                    background: "white",
                    borderRadius: "4px",
                    height: "42px",
                    width: isMobile ? "100%" : "180px",
                  }}
                >
                  <MenuItem value="my-notebooks">My Notebooks</MenuItem>
                  <MenuItem value="public">Public Notebooks</MenuItem>
                </Select>

                <TextField
                  placeholder="Filter Notebooks"
                  value={rawSearch}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setRawSearch(event.target.value)
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
                    marginLeft: isMobile ? "0" : "12px",
                    marginTop: isMobile ? "12px" : "0",
                    width: isMobile ? "100%" : "240px",
                  }}
                />
              </Grid>
            }
            paging={paging}
            fetchData={(args) =>
              fetchNotebooks({ type: notebooksType, ...args })
            }
          />
          <DataGrid
            rows={notebooksData}
            columns={columns}
            disableColumnMenu
            disableColumnFilter
            hideFooter
            hideFooterPagination
            rowCount={notebooks?.length}
            checkboxSelection={false}
            className="bg-white"
            autoHeight
            paginationMode="server"
          />
        </div>
      </>
    </Loader>
  );
};

export default NotebooksPage;
