import React, { FunctionComponent, useEffect, useState } from "react";

import { Form } from "react-bootstrap";
import NewNotebook from "./NewNotebook";
import NotebookContextProvider from "./NotebookContext";
import PageLayout from "../PageLayout";

const NotebooksPage: FunctionComponent = () => {
  const [notebookTitle, setNotebookTitle] = useState("New Notebook");
  return (
    <PageLayout>
      <h4 className="mb-4">
        <Form.Control
          size="lg"
          type="text"
          placeholder="Large text"
          onChange={(event) => {
            setNotebookTitle(event.target.value);
          }}
          value={notebookTitle}
          className="border-0 bg-transparent ps-0 notebook-title"
        />
      </h4>
      <NotebookContextProvider>
        <NewNotebook />
      </NotebookContextProvider>
    </PageLayout>
  );
};

export default NotebooksPage;
