import React, { FunctionComponent, useEffect } from "react";

import NewNotebook from "./NewNotebook";
import NotebookContextProvider from "./NotebookContext";
import PageLayout from "../PageLayout";

const NotebooksPage: FunctionComponent = () => {
  return (
    <PageLayout>
      <h4 className="mb-4">New Notebook</h4>
      <NotebookContextProvider>
        <NewNotebook />
      </NotebookContextProvider>
    </PageLayout>
  );
};

export default NotebooksPage;
