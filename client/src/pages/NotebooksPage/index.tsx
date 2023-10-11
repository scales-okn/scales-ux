/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { DataGrid, GridCellParams } from "@mui/x-data-grid";
import {
  FormControl,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Switch,
  Typography,
  Button,
} from "@mui/material";

import { useEffectOnce } from "react-use";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";

import { sessionUserSelector } from "src/store/auth";
import { useNotebook } from "src/store/notebook";
import { useUser } from "src/store/user";

import Pagination from "src/components/Pagination";
import Loader from "src/components/Loader";
import ColumnHeader from "src/components/ColumnHeader";

import "./NotebooksPage.scss";
import DeleteNotebook from "./DeleteNotebook";

const NotebooksPage = () => {
  const user = useSelector(sessionUserSelector);
  const { role } = useSelector(sessionUserSelector);
  const isAdmin = role === "admin";

  const [notebooksType, setNotebooksType] = useState("my-notebooks");
  const [filterNotebooks, setFilterNotebooks] = useState("");
  const { fetchNotebooks, loadingNotebooks, updateNotebook, notebooks } =
    useNotebook();
  const { fetchUsers, users } = useUser();

  useEffectOnce(() => {
    if (isAdmin) {
      // TODO: Refactor this out
      fetchUsers({ page: 1, limit: 1000 });
    }
  });

  useEffect(() => {
    fetchNotebooks({ type: notebooksType });
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
    .filter(
      (notebook) =>
        notebook.title
          .toLowerCase()
          .search(filterNotebooks.toLocaleLowerCase()) > -1,
    );

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
            <Button color="success" variant="contained">
              Create Notebook
            </Button>
          </Link>
        </Grid>

        <div style={{ height: "60vh", width: "100%" }} className="mt-4">
          <Pagination
            leftContent={
              <Grid container>
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
                    width: "180px",
                  }}
                >
                  <MenuItem value="my-notebooks">My Notebooks</MenuItem>
                  <MenuItem value="public">Public Notebooks</MenuItem>
                </Select>

                <TextField
                  fullWidth
                  id="filter-notebooks"
                  placeholder="Filter Notebooks"
                  value={filterNotebooks}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setFilterNotebooks(event.target.value)
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
                    marginLeft: "12px",
                    width: "240px",
                  }}
                />
              </Grid>
            }
            paging={{
              totalUsers: 1,
              totalPages: 1,
              currentPage: 1,
            }}
            fetchData={() => null}
          />
          <DataGrid
            rows={notebooksData}
            columns={columns}
            disableColumnMenu
            disableColumnFilter
            hideFooterPagination
            hideFooter={notebooks?.length <= 10 ? true : false}
            rowCount={notebooks?.length}
            checkboxSelection={false}
            className="bg-white"
          />
        </div>
      </>
    </Loader>
  );
};

export default NotebooksPage;
