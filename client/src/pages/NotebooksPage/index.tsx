/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FunctionComponent, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { DataGrid, GridCellParams } from "@mui/x-data-grid";
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import { useEffectOnce } from "react-use";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";

import { userSelector } from "@store/auth";
import { useNotebooks } from "@store/notebooks";

import StandardButton from "@components/Buttons/StandardButton";
import PageLayout from "@components/PageLayout";
import Loader from "@components/Loader";
import ColumnHeader from "@components/ColumnHeader";

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
    <PageLayout>
      <Loader isVisible={loadingNotebooks}>
        <>
          <Row>
            <Col md>
              <InputGroup>
                <InputGroup.Text className="bg-white">Show:</InputGroup.Text>
                <Form.Select
                  className="border-start-0 ps-0"
                  value={showNotebooks}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                    setShowNotebooks(event.target.value)
                  }
                >
                  <option value="my-notebooks">My Notebooks</option>
                  <option value="shared-notebooks">Shared with me</option>
                  <option value="public-notebooks">Public Notebooks</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md>
              <InputGroup>
                <InputGroup.Text className="bg-white">
                  <SearchIcon />
                </InputGroup.Text>
                <Form.Control
                  autoComplete="off"
                  className="border-start-0 ps-0"
                  id="filter-notebooks"
                  placeholder="Filter Notebooks"
                  onChange={(event: any) =>
                    setFilterNotebooks(event.target.value)
                  }
                />
              </InputGroup>
            </Col>
            <Col>
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
            </Col>
          </Row>
          <Row>
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
          </Row>
        </>
      </Loader>
    </PageLayout>
  );
};

export default NotebooksPage;
