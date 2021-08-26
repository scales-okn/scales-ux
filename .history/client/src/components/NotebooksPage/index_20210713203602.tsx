import React, { FunctionComponent, useEffect } from "react";
import PageLayout from "../PageLayout";
import NotebookContextProvider from "./NotebookContext";
import NewNotebook from "./NewNotebook";

const NotebooksPage: FunctionComponent = () => {
  return (
    <PageLayout>
      <h4 className="mb-4">Notebooks</h4>
      <NotebookContextProvider>
        <NewNotebook />
      </NotebookContextProvider>
    </PageLayout>
  );
};

export default NotebooksPage;
