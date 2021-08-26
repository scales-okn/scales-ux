import React, { FunctionComponent, useEffect } from "react";

import { Form } from "react-bootstrap";
import NewNotebook from "./NewNotebook";
import NotebookContextProvider from "./NotebookContext";
import PageLayout from "../PageLayout";

const NotebooksPage: FunctionComponent = () => {
  return (
    <PageLayout>
      <h4 className="mb-4">
        <Form.Control size="lg" type="text" placeholder="Large text" />
      </h4>
      <NotebookContextProvider>
        <NewNotebook />
      </NotebookContextProvider>
    </PageLayout>
  );
};

export default NotebooksPage;
