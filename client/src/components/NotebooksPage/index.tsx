import React, { FunctionComponent, useEffect, useState } from "react";
import PageLayout from "../PageLayout";
import { useAuthHeader, useAuthUser } from "react-auth-kit";
import Loader from "../Loader";
import { DataGrid, GridCellParams } from "@material-ui/data-grid";
import { Link } from "react-router-dom";
import {
  Form,
  Row,
  Col,
  Button,
  Popover,
  OverlayTrigger,
} from "react-bootstrap";
// import ReactTags from "react-tag-autocomplete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";
import { WithContext as ReactTags } from "react-tag-input";
import "./NotebooksPage.scss";

const NotebooksPage: FunctionComponent = () => {
  const [notebooks, setNotebooks] = useState([]);
  const [loadingNotebooks, setLoadingNotebooks] = useState(false);
  const authHeader = useAuthHeader();
  const authUser = useAuthUser();
  const user = authUser().user;
  const isAdmin = user.role === "admin";

  const fetchNotebooks = async () => {
    setLoadingNotebooks(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/notebooks`,
        {
          method: "GET",
          headers: {
            Authorization: authHeader(),
            "Content-Type": "application/json",
          },
        }
      );
      const { data } = await response.json();
      console.log(data);

      setNotebooks(data.notebooks);
      setLoadingNotebooks(false);
    } catch (error) {
      // TODO: Implement Error handling
    }
  };

  const updateNotebook = async (notebookId, payload) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/notebooks/${notebookId}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
          headers: {
            Authorization: authHeader(),
            "Content-Type": "application/json",
          },
        }
      );
      const { data } = await response.json();
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleOnEditCellChangeCommitted = async (values, event) => {
    console.log(values);
    await updateNotebook(values.id, {
      [values.field]:
        values.field === "collaborators"
          ? //@ts-ignore
            values.props?.value?.split(",")
          : values.props.value,
    });
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const userNotebooks = notebooks.filter(({ userId }) => userId === user.id);
  const sharedWithUserNotebooks = notebooks.filter(({ collaborators }) =>
    collaborators.includes(user.id)
  );
  const publicNotebooks = notebooks.filter(
    ({ collaborators, userId }) =>
      !collaborators.includes(user.id) && userId !== user.id
  );

  const fieldDecorator = (params) => console.log(params);

  const KeyCodes = {
    comma: 188,
    enter: [10, 13],
  };

  const delimiters = [...KeyCodes.enter, KeyCodes.comma];

  const tags = [
    { id: "Thailand", text: "Thailand" },
    { id: "India", text: "India" },
  ];

  return (
    <PageLayout>
      <Loader animation="border" isVisible={loadingNotebooks}>
        <>
          {isAdmin ? (
            <>
              <Row className="align-items-center mb-4 mt-4">
                <Col lg="10">
                  <h3>All Notebooks</h3>
                </Col>
                <Col>
                  <Button className="text-white float-end" variant="primary">
                    <Link
                      to="/notebooks/new"
                      className="text-white text-decoration-none"
                    >
                      Create New
                    </Link>
                  </Button>
                </Col>
              </Row>
              <div style={{ height: 650, width: "100%" }} className="mb-4">
                <DataGrid
                  rows={notebooks}
                  onEditCellChangeCommitted={handleOnEditCellChangeCommitted}
                  columns={[
                    {
                      field: "id",
                      headerName: "ID",
                      width: 100,
                      renderCell: (params: GridCellParams) => (
                        <Link to={`/notebooks/${params.row.id}`}>
                          {params.row.id}
                        </Link>
                      ),
                    },
                    {
                      field: "title",
                      headerName: "title",
                      width: 150,
                      editable: true,
                    },
                    // {
                    //   field: "contents",
                    //   headerName: "contents",
                    //   width: 300,
                    //   renderCell: (params: GridCellParams) => (
                    //     <Form.Control
                    //       as="textarea"
                    //       value={JSON.stringify(params.row.contents)}
                    //     />
                    //   ),
                    // },
                    {
                      field: "createdAt",
                      headerName: "createdAt",
                      width: 150,
                      editable: true,
                    },
                    {
                      field: "updatedAt",
                      headerName: "updatedAt",
                      width: 150,
                      editable: true,
                    },
                    // { field: "parent", headerName: "parent", width: 150 },
                    {
                      field: "userId",
                      headerName: "userId",
                      width: 150,
                      editable: true,
                    },
                    {
                      field: "visibility",
                      headerName: "visibility",
                      width: 120,
                      editable: true,
                    },
                    {
                      field: "collaborators",
                      headerName: "collaborators",
                      width: 160,
                      editable: true,
                    },
                    {
                      field: "deleted",
                      headerName: "deleted",
                      width: 150,
                      editable: true,
                    },
                  ]}
                  pageSize={10}
                  hideFooter={notebooks.length <= 10 ? true : false}
                  rowCount={notebooks.length}
                  checkboxSelection={false}
                  className="bg-white border-0 rounded-0"
                />
              </div>
            </>
          ) : (
            <Row>
              <Col lg="4" className="pe-4">
                <Row className="align-items-center mb-4 mt-4">
                  <Col lg="8">
                    <h4>My Notebooks</h4>
                  </Col>
                  <Col>
                    <Button className="text-white float-end" variant="primary">
                      <Link
                        to="/notebooks/new"
                        className="text-white text-decoration-none"
                      >
                        Create New
                      </Link>
                    </Button>
                  </Col>
                </Row>
                <Row style={{ height: 650 }} className="mb-4">
                  <DataGrid
                    rows={userNotebooks}
                    onEditCellChangeCommitted={handleOnEditCellChangeCommitted}
                    columns={[
                      {
                        field: "id",
                        headerName: "ID",
                        width: 100,
                        renderCell: (params: GridCellParams) => (
                          <Link to={`/notebooks/${params.row.id}`}>
                            {params.row.id}
                          </Link>
                        ),
                      },
                      {
                        field: "title",
                        headerName: "title",
                        width: 140,
                        editable: true,
                      },
                      {
                        field: "collaborators",
                        headerName: "collaborators",
                        width: 160,
                        editable: false,
                        renderCell: (params: GridCellParams) => {
                          console.log(params);
                          return (
                            <OverlayTrigger
                              trigger="click"
                              placement="right"
                              overlay={
                                <Popover
                                  id={`collaborators-popover-${params.id}`}
                                >
                                  <Popover.Header as="h3">
                                    Collaborators
                                  </Popover.Header>
                                  <Popover.Body>
                                    <ReactTags
                                      tags={params.row.collaborators.map(
                                        (collaborator) => ({
                                          id: collaborator,
                                          text: collaborator,
                                        })
                                      )}
                                      // suggestions={suggestions}
                                      handleDelete={() => alert()}
                                      handleAddition={() => alert()}
                                      handleDrag={() => alert()}
                                      delimiters={delimiters}
                                    />
                                  </Popover.Body>
                                </Popover>
                              }
                            >
                              <div className="d-block w-100">
                                {" "}
                                {params.row.collaborators.length ? (
                                  <>
                                    {params.row.collaborators.join(",")}
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      className="text-white float-end  mt-2"
                                    >
                                      <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    No collaborators
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      className="text-white float-end mt-2"
                                    >
                                      <FontAwesomeIcon icon={faPlus} />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </OverlayTrigger>
                          );
                        },
                      },
                    ]}
                    pageSize={10}
                    rowCount={userNotebooks.length}
                    hideFooter={notebooks.length <= 10 ? true : false}
                    checkboxSelection={false}
                    className="bg-white border-0 rounded-0"
                  />
                </Row>
              </Col>
              <Col lg="4" className="pe-4">
                <Row className="align-items-center mb-4 mt-4">
                  <Col>
                    <h4>Shared with me</h4>
                  </Col>
                </Row>
                <Row style={{ height: 650 }} className="mb-4">
                  <DataGrid
                    rows={sharedWithUserNotebooks}
                    onEditCellChangeCommitted={handleOnEditCellChangeCommitted}
                    columns={[
                      {
                        field: "id",
                        headerName: "ID",
                        width: 100,
                        renderCell: (params: GridCellParams) => (
                          <Link to={`/notebooks/${params.row.id}`}>
                            {params.row.id}
                          </Link>
                        ),
                      },
                      {
                        field: "title",
                        headerName: "title",
                        width: 140,
                        editable: true,
                      },
                      {
                        field: "collaborators",
                        headerName: "collaborators",
                        width: 160,
                        editable: true,
                      },
                    ]}
                    pageSize={10}
                    rowCount={sharedWithUserNotebooks.length}
                    hideFooter={
                      sharedWithUserNotebooks.length <= 10 ? true : false
                    }
                    checkboxSelection={false}
                    className="bg-white border-0 rounded-0"
                  />
                </Row>
              </Col>
              <Col lg="4">
                <Row className="align-items-center mb-4 mt-4">
                  <Col>
                    <h4>Public Notebooks</h4>
                  </Col>
                </Row>
                <Row style={{ height: 650 }} className="mb-4">
                  <DataGrid
                    rows={publicNotebooks}
                    columns={[
                      {
                        field: "id",
                        headerName: "ID",
                        width: 100,
                        renderCell: (params: GridCellParams) => (
                          <Link to={`/notebooks/${params.row.id}`}>
                            {params.row.id}
                          </Link>
                        ),
                      },
                      { field: "title", headerName: "title", width: 140 },
                      {
                        field: "collaborators",
                        headerName: "collaborators",
                        width: 160,
                      },
                    ]}
                    pageSize={10}
                    rowCount={publicNotebooks.length}
                    hideFooter={publicNotebooks.length <= 10 ? true : false}
                    checkboxSelection={false}
                    className="bg-white border-0 rounded-0"
                  />
                </Row>
              </Col>
            </Row>
          )}
        </>
      </Loader>
    </PageLayout>
  );
};

export default NotebooksPage;
