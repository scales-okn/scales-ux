/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FunctionComponent, useState } from "react";
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
  Button,
} from "@mui/material";

import { useEffectOnce } from "react-use";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";

import { userSelector } from "src/store/auth";
import { useNotebook } from "src/store/notebook";

import Loader from "src/components/Loader";
import ColumnHeader from "src/components/ColumnHeader";

import "./NotebooksPage.scss";
import DeleteNotebook from "./DeleteNotebook";

const NotebooksPage: FunctionComponent = () => {
  const user = useSelector(userSelector);
  const [showNotebooks, setShowNotebooks] = useState("my-notebooks");
  const [filterNotebooks, setFilterNotebooks] = useState("");
  const { fetchNotebooks, loadingNotebooks, notebooks } = useNotebook();

  useEffectOnce(() => {
    fetchNotebooks();
  });

  const notebooksData = notebooks
    .filter((notebook) => {
      if (showNotebooks === "my-notebooks") {
        return notebook.userId === user.id;
      }
      if (showNotebooks === "shared-notebooks") {
        return notebook.collaborators.includes(user.id);
      }
      if (showNotebooks === "public-notebooks") {
        return (
          !notebook.collaborators.includes(user.id) &&
          notebook.userId !== user.id
        );
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
    {
      field: "visibility",
      headerName: "Visibility",
      width: 130,
      editable: false,
      renderHeader,
    },
    {
      field: "userId",
      headerName: "Owned By",
      width: 150,
      sortable: false,
      renderHeader,
      renderCell: (params: GridCellParams) => {
        if (params.row.userId === user.id) {
          return <>You</>;
        }
        // TODO: Users Initials call.
      },
    },

    {
      field: "collaborators",
      headerName: "Shared With",
      width: 150,
      editable: true,
      sortable: false,
      renderHeader,
      renderCell: (params: GridCellParams) => {
        if (params.row.collaborators.length === 0) {
          return <>Nobody</>;
        }
        if (params.row.collaborators.includes(1)) {
          return <span className="user-initials-pill">AT</span>;
        }
        if (params.row.collaborators.includes(user.id)) {
          return <>You</>;
        }
        return <>{params.row.collaborators}</>;
      },
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 75,
      renderCell: (params: GridCellParams) => {
        return (
          <div style={{ paddingLeft: "5px" }}>
            <DeleteNotebook notebookId={params.row.id} />
          </div>
        );
      },
      renderHeader,
    },
  ];

  return (
    <Loader isVisible={loadingNotebooks}>
      <>
        <Grid
          container
          spacing={2}
          sx={{ alignItems: "center", marginTop: "80px" }}
        >
          <Grid item md={4}>
            <FormControl fullWidth>
              <Select
                MenuProps={{
                  disableScrollLock: true,
                }}
                value={showNotebooks}
                onChange={(event) =>
                  setShowNotebooks(event.target.value as string)
                }
                sx={{ background: "white", borderRadius: "4px" }}
              >
                <MenuItem value="my-notebooks">My Notebooks</MenuItem>
                <MenuItem value="shared-notebooks">Shared with me</MenuItem>
                <MenuItem value="public-notebooks">Public Notebooks</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item md={4}>
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
                background: "white",
                borderRadius: "4px",
                "& .MuiFormControl-root": { border: "none" },
              }}
            />
          </Grid>
          <Grid
            item
            md={4}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Link
              to="/notebooks/new"
              className="text-white text-decoration-none"
            >
              <Button color="success" variant="contained">
                Create Notebook
              </Button>
            </Link>
          </Grid>
        </Grid>

        <div style={{ height: "60vh", width: "100%" }} className="mt-4">
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
