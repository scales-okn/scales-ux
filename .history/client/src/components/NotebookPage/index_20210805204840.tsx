import React, { FunctionComponent, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Form, ListGroup } from "react-bootstrap";
import Notebook from "../Notebook";
import NotebookContextProvider from "../Notebook/NotebookContext";
import PageLayout from "../PageLayout";
import { useAuthHeader, useAuthUser } from "react-auth-kit";
import Loader from "../Loader";
import { useParams } from "react-router";

const NotebookPage: FunctionComponent = () => {
  const { id = "" } = useParams();
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
