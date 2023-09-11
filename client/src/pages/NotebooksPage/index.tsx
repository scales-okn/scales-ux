/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FunctionComponent, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { DataGrid, GridCellParams } from "@mui/x-data-grid";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
} from "@mui/material";

import { useEffectOnce } from "react-use";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";

import { userSelector } from "src/store/auth";
import { useNotebooks } from "src/store/notebooks";

import StandardButton from "src/components/Buttons/StandardButton";
import Loader from "src/components/Loader";
import ColumnHeader from "src/components/ColumnHeader";

import "./NotebooksPage.scss";

const NotebooksPage: FunctionComponent = () => {
  const user = useSelector(userSelector);
  const [showNotebooks, setShowNotebooks] = useState("my-notebooks");
  const [filterNotebooks, setFilterNotebooks] = useState("");
  const { fetchNotebooks, notebooks, loadingNotebooks } = useNotebooks();

  // const handleOnEditCellChangeCommitted = async (values, event) => {
  //   await updateNotebook(values.id, {
  //     [values.field]:
  //       values.field === "collaborators"
  //         ? //@ts-ignore
  //         values.props?.value?.split(",")
  //         : values.props.value,
  //   });
  // };

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
      width: 250,
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
  ];

  return (
    <Loader isVisible={loadingNotebooks}>
      <>
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid item md={4}>
            <FormControl fullWidth>
              <InputLabel>Show:</InputLabel>
              <Select
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
              label="Filter Notebooks"
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
          <Grid item md={4}>
            <Link
              to="/notebooks/new"
              className="text-white text-decoration-none"
            >
              <StandardButton
                className="text-white float-end px-5"
                variant="primary"
                style={{
                  background: "var(--sea-green)",
                  border: "none",
                }}
              >
                Create Notebook
              </StandardButton>
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
