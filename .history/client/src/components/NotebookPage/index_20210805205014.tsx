import React, { FunctionComponent, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Form, ListGroup } from "react-bootstrap";
import Notebook from "../Notebook";
import NotebookContextProvider from "../Notebook/NotebookContext";
import PageLayout from "../PageLayout";
import { useAuthHeader, useAuthUser } from "react-auth-kit";
import Loader from "../Loader";

type Params = {
  id: string | null;
};

const NotebookPage: FunctionComponent = () => {
  const { id } = useParams<Params>();
  return (
    <PageLayout>
      <Loader animation="border" isVisible={false}>
        <>
          <NotebookContextProvider id={id}>
            <Notebook />
          </NotebookContextProvider>
        </>
      </Loader>
    </PageLayout>
  );
};

export default NotebookPage;
