import React, { FunctionComponent, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Form, ListGroup } from "react-bootstrap";
import Notebook from "../NotebookPage";
import NotebookContextProvider from "../Notebook/NotebookContext";
import PageLayout from "../PageLayout";
import { useAuthHeader, useAuthUser } from "react-auth-kit";
import Loader from "../Loader";

const NotebookPage = () => {
  return (
    <PageLayout>
      <Loader animation="border" isVisible={false}>
        <>
          <NotebookContextProvider>
            <Notebook />
          </NotebookContextProvider>
        </>
      </Loader>
    </PageLayout>
  );
};

export default NotebookPage;
