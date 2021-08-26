import React, { FunctionComponent, useEffect, useState } from "react";

import { Form, ListGroup } from "react-bootstrap";
import NewNotebook from "./NewNotebook";
import NotebookContextProvider from "./NotebookContext";
import PageLayout from "../PageLayout";
import { useAuthHeader, useAuthUser } from "react-auth-kit";
import Loader from "../Loader";
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
  GridCellParams,
} from "@material-ui/data-grid";

const NotebooksPage: FunctionComponent = () => {
  const [notebooks, setNotebooks] = useState([]);
  const [loadingNotebooks, setLoadingNotebooks] = useState(false);
  const [notebookTitle, setNotebookTitle] = useState("New Notebook");
  const authHeader = useAuthHeader();

  const [notebook, setNotebook] = useState(null);
  const [loadingNotebook, setLoadingNotebook] = useState(false);

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

  const fetchNotebook = async (id) => {
    setLoadingNotebook(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/notebooks/${id}`,
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

      setLoadingNotebook(false);

      return setNotebook(data);
    } catch (error) {
      // TODO: Implement Error handling
    }
  };

  useEffect(() => {
    fetchNotebooks();
    fetchNotebook(53);
  }, []);

  return (
    <PageLayout>
      <Loader animation="border" isVisible={loadingNotebooks}>
        <>
          <h4 className="mb-4">My Notebooks</h4>
          <div style={{ height: 400, width: "100%" }} className="mb-4">
            <DataGrid
              rows={notebooks}
              columns={[
                { field: "id", headerName: "ID", width: 100 },
                { field: "title", headerName: "title", width: 150 },
                { field: "contents", headerName: "contents", width: 150 },
                { field: "createdAt", headerName: "createdAt", width: 150 },
                { field: "updatedAt", headerName: "updatedAt", width: 150 },
                { field: "parent", headerName: "parent", width: 150 },
                { field: "userId", headerName: "userId", width: 150 },
                { field: "visibility", headerName: "visibility", width: 150 },
                { field: "deleted", headerName: "deleted", width: 150 },
              ]}
              pageSize={10}
              rowCount={notebooks.length}
              checkboxSelection={false}
              className="bg-white"
            />
          </div>
        </>
      </Loader>

      <Loader animation="border" isVisible={loadingNotebook}>
        <ListGroup>
          {notebook?.versions.map((notebook, index) => {
            <ListGroup.Item key={index}>
              {JSON.stringify(notebook)}
            </ListGroup.Item>;
          })}
        </ListGroup>
      </Loader>

      <NotebookContextProvider>
        <h4 className="mb-4">
          <Form.Control
            size="lg"
            type="text"
            placeholder="Your Notebook Title Here"
            onChange={(event) => {
              setNotebookTitle(event.target.value);
            }}
            value={notebookTitle}
            className="border-0 bg-transparent ps-0 notebook-title"
          />
        </h4>
        <NewNotebook />
      </NotebookContextProvider>
    </PageLayout>
  );
};

export default NotebooksPage;
