import React, {
  FunctionComponent,
  useEffect,
  useState,
  useMemo
} from "react";
import PageLayout from "../../components/PageLayout";
import Loader from "../../components/Loader";
import { DataGrid, GridCellParams } from "@material-ui/data-grid";
import { Link } from "react-router-dom";
import { Form, Row, Col, Button, InputGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import { userSelector } from "../../store/auth";
import { useSelector } from "react-redux";
import { useNotebooks } from "../../store/notebooks";
import { useUsers } from "store/users";
import { useNotebook } from "store/notebook";
import ReactSelect from "react-select";
import "./NotebooksPage.scss";
import Avatar from "react-avatar";

export const ReactSelectFullWidthStyles = {
  container: (base: any) => ({
    ...base,
    width: "100%",
    "&:focus": {
      border: "none",
    },
  }),
  control: (base: any) => ({
    ...base,
    width: "100%",
    border: "none !important",
    backgroundColor: "transparent !important",
    boxShadow: 'none !important',
    borderColor: "transparent !important",
  }),
  menuPortal: base => ({ ...base, zIndex: 9999 })
};

const NotebooksPage: FunctionComponent = () => {
  const user = useSelector(userSelector);
  const [showNotebooks, setShowNotebooks] = useState("my-notebooks");
  const [filterNotebooks, setFilterNotebooks] = useState("");
  const { fetchNotebooks, notebooks, loadingNotebooks } = useNotebooks();
  const { updateNotebook } = useNotebook();
  const { fetchUsersList, usersList, loadingUsersList } = useUsers();
  const [update, setUpdate] = useState(true);

  // const handleOnEditCellChangeCommitted = async (values, event) => {
  //   console.log(values);
  //   await updateNotebook(values.id, {
  //     [values.field]:
  //       values.field === "collaborators"
  //         ? //@ts-ignore
  //         values.props?.value?.split(",")
  //         : values.props.value,
  //   });
  // };

  useEffect(() => {
    fetchNotebooks();
    fetchUsersList();
    setUpdate(false);
  }, [update]);

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
          notebook.visibility === "public"
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

  const getUserFromListById = (id: number) => usersList.find(userList => userList.id === id);
  const visibilityOptions = [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
  ];

  const columns = useMemo(() => {
    return [
      {
        field: "title",
        headerName: "Name",
        width: 250,
        editable: true,
        renderCell: (params: GridCellParams) => (
          <Link
            to={`/notebooks/${params.row.id}`}
            className="ms-2"
          >
            {params.row.title}
          </Link>
        ),
      },
      {
        field: "updatedAt",
        headerName: "Last Modified",
        width: 170,
        editable: false,
        renderCell: (params: GridCellParams) => (
          <>{dayjs(params.row.createdAt).format("M/D/YYYY")}</>
        ),
      },
      {
        field: "createdAt",
        headerName: "Created On",
        width: 170,
        editable: false,
        renderCell: (params: GridCellParams) => (
          <>{dayjs(params.row.createdAt).format("M/D/YYYY")}</>
        ),
      },
      {
        field: "visibility",
        headerName: "Visibility",
        width: 160,
        renderCell: (params: GridCellParams) => {
          if (params.row.userId !== user.id) {
            return <div className="ms-2">
              {
                visibilityOptions.find(
                  option => option.value === params.row.visibility
                )?.label
              }
            </div>;
          }

          return <ReactSelect
            isDisabled={params.row.userId !== user.id}
            id="visibility-selector"
            components={{
              IndicatorSeparator: () => null,
              Option: (props: any) => (
                <div className="ms-2" ref={props.innerRef} {...props.innerProps}>
                  {props.data.label}
                </div>
              ),
            }}
            styles={ReactSelectFullWidthStyles}
            options={visibilityOptions}
            defaultValue={visibilityOptions.find(
              (option) => option.value === params.row.visibility
            )}
            onChange={(event: any) => {
              updateNotebook(params.row.id, {
                visibility: event.value,
              }) && setUpdate(true);
            }}
          />
        },
      },
      {
        field: "userId",
        headerName: "Owned By",
        sortable: false,
        width: 150,
        renderCell: (params: GridCellParams) => {
          const userList = getUserFromListById(params.row.userId)
          return (
            <div className="owned-by">
              <Avatar name={`${userList?.firstName} ${userList?.lastName}`} size="28" round={true} email={userList?.email} />
              {params.row.userId === user.id ? "You" : `${userList?.firstName} ${userList?.lastName}`}
            </div>
          )
        },
      },
      {
        field: "collaborators",
        headerName: "Shared With",
        width: 400,
        editable: false,
        sortable: false,
        renderCell: (params: GridCellParams,) => {
          if (params.row.visibility === "public") {
            return <div className="ms-2">Everyone</div>;
          }

          if (params.row.userId !== user.id) {
            return usersList.filter(userList => params.row.collaborators.includes(userList.id)).map((userList, index) => (
              <div className="shared-with" key={index}>
                <Avatar name={`${userList.firstName} ${userList.lastName}`} size="28" round={true} email={userList?.email} />
                {userList.id === user.id && "You"}
              </div>
            ))
          }
          return <ReactSelect
            id="collaborators-selector"
            isMulti={true}
            isDisabled={params.row.userId !== user.id}
            components={{
              IndicatorSeparator: () => null,
              MultiValueLabel: (props: any) => {
                const userList = getUserFromListById(props.data.value)
                return <Avatar name={`${userList?.firstName} ${userList?.lastName}`} size="28" round={true} email={userList?.email} style={{
                  display: "flex"
                }} />
              },
              Option: (props: any) => {
                const userList = getUserFromListById(props.value)
                return (
                  <div className="collaborator-option" ref={props.innerRef} {...props.innerProps}>
                    <Avatar name={`${userList?.firstName} ${userList?.lastName}`} size="28" round={true} email={userList?.email} />
                    {`${userList?.firstName} ${userList?.lastName}`}
                  </div>
                )
              }
            }}
            styles={ReactSelectFullWidthStyles}
            placeholder="Nobody"
            options={usersList.filter(usersList => usersList.id !== user.id).map((user) => ({
              value: user.id,
              label: `${user.firstName} ${user.lastName}`,
            }))}
            defaultValue={usersList.filter((user) => params.row.collaborators.includes(user.id)).map((user) => ({
              value: user.id,
              label: `${user.firstName} ${user.lastName}`,
            }))}
            onChange={(value) =>
              updateNotebook(params.row.id, {
                collaborators: value.map((user) => user.value),
              })
            }
          />
        }
      },
    ];
  }, [update]);

  return (
    <PageLayout>
      <Loader animation="border" isVisible={loadingNotebooks}>
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
              variant="primary">
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
              columns={columns}
              pageSize={10}
              hideFooter={notebooks?.length <= 10 ? true : false}
              rowCount={notebooks?.length}
              checkboxSelection={false}
              className="bg-white notebooks-table"
            />
          </div>
        </Row>
      </Loader>
    </PageLayout>
  );
};

export default NotebooksPage;
