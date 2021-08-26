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

  useEffect(() => {
    fetchNotebooks();
  }, []);

  return (
    <PageLayout>
      <Loader animation="border" isVisible={loadingNotebooks}>
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={notebooks}
            columns={[
              { field: "id", headerName: "ID", width: 150 },
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
