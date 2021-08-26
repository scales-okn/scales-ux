import React, { FunctionComponent, useEffect, useState } from "react";
import { useParams } from "react-router";

// import Notebook from "../NotebookPage";
// import NotebookContextProvider from "../Notebook/NotebookContext";
import PageLayout from "../PageLayout";
import { useAuthHeader, useAuthUser } from "react-auth-kit";
import Loader from "../Loader";
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
  GridCellParams,
} from "@material-ui/data-grid";
import { Link } from "react-router-dom";

const NotebooksPage: FunctionComponent = () => {
  // @ts-ignore
  const { id = "" } = useParams();
  const [notebooks, setNotebooks] = useState([]);
  const [loadingNotebooks, setLoadingNotebooks] = useState(false);

  const authHeader = useAuthHeader();

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

  useEffect(() => {
    fetchNotebooks();
  }, []);

  return (
    <PageLayout>
      <Loader animation="border" isVisible={loadingNotebooks}>
        <>
          <h3 className="mb-4">My Notebooks</h3>
          <div style={{ height: 400, width: "100%" }} className="mb-4">
            <DataGrid
              rows={notebooks}
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
                { field: "title", headerName: "title", width: 150 },
                { field: "contents", headerName: "contents", width: 300 },
                { field: "createdAt", headerName: "createdAt", width: 150 },
                { field: "updatedAt", headerName: "updatedAt", width: 150 },
                // { field: "parent", headerName: "parent", width: 150 },
                { field: "userId", headerName: "userId", width: 100 },
                { field: "visibility", headerName: "visibility", width: 150 },
                { field: "deleted", headerName: "deleted", width: 150 },
              ]}
              pageSize={10}
              rowCount={notebooks.length}
              checkboxSelection={false}
              className="bg-white border-0 rounded-0"
            />
          </div>
        </>
      </Loader>

      {/* <Loader animation="border" isVisible={loadingNotebook}>
        <ListGroup>
          {notebook?.versions.map((notebook, index) => {
            <ListGroup.Item key={index}>
              {JSON.stringify(notebook)}
            </ListGroup.Item>;
          })}
        </ListGroup>
      </Loader> */}
    </PageLayout>
  );
};

export default NotebooksPage;
