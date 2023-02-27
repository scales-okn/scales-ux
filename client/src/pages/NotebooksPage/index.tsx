import React, { FunctionComponent, useState } from "react";
import PageLayout from "../../components/PageLayout";
import Loader from "../../components/Loader";
import { DataGrid, GridCellParams } from "@material-ui/data-grid";
import { Link } from "react-router-dom";
import { Form, Row, Col, Button, InputGroup } from "react-bootstrap";
import { useEffectOnce } from "react-use";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import { userSelector } from "../../store/auth";
import { useSelector } from "react-redux";
import { useNotebooks } from "../../store/notebooks";
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

  return (
    <PageLayout>
      <Loader animation="border" isVisible={loadingNotebooks}>
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
                  <FontAwesomeIcon icon={faSearch} className="text-muted" />
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
              <Button
                className="text-white float-end px-5"
                variant="primary"
                style={{
                  background: "var(--sea-green)",
                  border: "none",
                }}
              >
                <Link
                  to="/notebooks/new"
                  className="text-white text-decoration-none"
                >
                  Create Notebook
                </Link>
              </Button>
            </Col>
          </Row>
          <Row>
            <div style={{ height: 650, width: "100%" }} className="mt-4">
              <DataGrid
                rows={notebooksData}
                // onEditCellChangeCommitted={handleOnEditCellChangeCommitted}
                columns={[
                  {
                    field: "title",
                    headerName: "Name",
                    width: 250,
                    editable: true,
                    renderCell: (params: GridCellParams) => (
                      <Link to={`/notebooks/${params.row.id}`} className="ms-2">
                        {params.row.title}
                      </Link>
                    ),
                  },
                  {
                    field: "updatedAt",
                    headerName: "Last Modified",
                    width: 200,
                    editable: false,
                    renderCell: (params: GridCellParams) => (
                      <>{dayjs(params.row.createdAt).format("M/D/YYYY")}</>
                    ),
                  },
                  {
                    field: "createdAt",
                    headerName: "Created On",
                    width: 200,
                    editable: false,
                    renderCell: (params: GridCellParams) => (
                      <>{dayjs(params.row.createdAt).format("M/D/YYYY")}</>
                    ),
                  },
                  {
                    field: "visibility",
                    headerName: "Visibility",
                    width: 160,
                  },
                  {
                    field: "userId",
                    headerName: "Owned By",
                    width: 150,
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
                    width: 160,
                    editable: true,
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
                  // {
                  //   field: "",
                  //   headerName: " ",
                  //   width: 100,
                  //   sortable: false,
                  //   renderCell: (params: GridCellParams) => <span>...</span>,
                  // },
                ]}
                pageSize={10}
                rowsPerPageOptions={[10]}
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
