import React, {
  ChangeEventHandler,
  FunctionComponent,
  useEffect,
  useState,
} from "react";
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
  FloatingLabel,
  InputGroup,
} from "react-bootstrap";
// import ReactTags from "react-tag-autocomplete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import { WithContext as ReactTags } from "react-tag-input";
import "./NotebooksPage.scss";
import dayjs from "dayjs";

import ReactDataGrid from "react-data-grid";
const columns = [
  { key: "id", name: "ID" },
  { key: "title", name: "Title" },
];

const rows = [
  { id: 0, title: "Example" },
  { id: 1, title: "Demo" },
];

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

const NotebooksPage: FunctionComponent = () => {
  const [notebooks, setNotebooks] = useState([]);
  const [loadingNotebooks, setLoadingNotebooks] = useState(false);
  const authHeader = useAuthHeader();
  const authUser = useAuthUser();
  const user = authUser().user;
  const isAdmin = user.role === "admin";
  const [showNotebooks, setShowNotebooks] = useState("my-notebooks");
  const [filterNotebooks, setFilterNotebooks] = useState("");

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
          .search(filterNotebooks.toLocaleLowerCase()) > -1
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
                  backgroundColor: "#7DC142",
                  borderColor: "#7DC142",
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
                onEditCellChangeCommitted={handleOnEditCellChangeCommitted}
                columns={[
                  {
                    field: "title",
                    headerName: "Name",
                    width: 270,
                    editable: true,
                    renderCell: (params: GridCellParams) => (
                      <Link
                        to={`/notebooks/${params.row.title}`}
                        className="ms-2"
                      >
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
                    width: 210,
                  },
                  {
                    field: "userId",
                    headerName: "Owned By",
                    width: 150,
                    renderCell: (params: GridCellParams) => {
                      if (params.row.userId === user.id) {
                        return <>You</>;
                      }

                      if (params.row.userId === 1) {
                        return <span className="user-initials-pill">AT</span>;
                      }
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
                      if (params.row.collaborators.includes(2)) {
                        return <>You</>;
                      }
                      return <>{params.row.collaborators}</>;
                    },
                  },
                  {
                    field: "",
                    headerName: " ",
                    width: 100,
                    sortable: false,
                    renderCell: (params: GridCellParams) => <span>...</span>,
                  },
                ]}
                pageSize={10}
                hideFooter={notebooks.length <= 10 ? true : false}
                rowCount={notebooks.length}
                checkboxSelection={false}
                className="bg-white border-0 rounded-0"
              />
            </div>
          </Row>
        </>
      </Loader>
    </PageLayout>
  );
};

export default NotebooksPage;
