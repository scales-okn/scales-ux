import React, { FunctionComponent, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Form, ListGroup } from "react-bootstrap";
// import Notebook from "../NotebookPage";
// import NotebookContextProvider from "../Notebook/NotebookContext";
import PageLayout from "../PageLayout";
import { useAuthHeader, useAuthUser } from "react-auth-kit";
import Loader from "../Loader";

const NotebookPage: FunctionComponent = () => {
  return (
    <PageLayout>
      <Loader animation="border" isVisible={false}>
        <>
          <h3 className="mb-4">My Notebooks</h3>
          <div style={{ height: 400, width: "100%" }} className="mb-4">
            <DataGrid
              rows={notebooks}
              columns={[
                { field: "id", headerName: "ID", width: 100 },
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

      {/* <NotebookContextProvider>
    <Notebook />
  </NotebookContextProvider> */}
    </PageLayout>
  );
};

export default NotebookPage;
