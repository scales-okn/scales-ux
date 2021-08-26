import React, { FunctionComponent, useEffect, useState } from "react";

import { Form } from "react-bootstrap";
import NewNotebook from "./NewNotebook";
import NotebookContextProvider from "./NotebookContext";
import PageLayout from "../PageLayout";
import { useAuthHeader, useAuthUser } from "react-Log-kit";

const NotebooksPage: FunctionComponent = () => {
  const [notebookTitle, setNotebookTitle] = useState("New Notebook");
  const authHeader = useAuthHeader();

  const fetchNotebooks = async (filterInputs: [], page = 0, batchSize = 10) => {
    setLoadingNotebooks(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/users/login`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader(),
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      setNotebooks(data);
      setLoadingNotebooks(false);
    } catch (error) {
      // TODO: Implement Error handling
    }
  };

  return (
    <PageLayout>
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
