import React, { FunctionComponent, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Form, ListGroup } from "react-bootstrap";
import Notebook from "../Notebook";
import NotebookContextProvider from "../Notebook/NotebookContext";
import PageLayout from "../PageLayout";
import { useAuthHeader, useAuthUser } from "react-auth-kit";
import Loader from "../Loader";
import { fetchRings, ringsSelector } from "../../store/rings";
import { useDispatch, useSelector } from "react-redux";

type Params = {
  notebookId: string | null;
};

const NotebookPage: FunctionComponent = () => {
  const { notebookId } = useParams<Params>();
  const { rings, loadingRings, hasErrors } = useSelector(ringsSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchRings());
  }, []);

  console.log(rings, loadingRings, hasErrors);

  const getRing = () => {
    try {
      return Object.entries(rings)[0][1];
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <PageLayout>
      <Loader animation="border" isVisible={false}>
        <>
          {loadingRings ? (
            <Loader animation="border" isVisible={true} />
          ) : (
            <NotebookContextProvider
              ring={getRing()}
              notebookId={Number(notebookId) ? notebookId : null}
            >
              <Notebook />
            </NotebookContextProvider>
          )}
        </>
      </Loader>
    </PageLayout>
  );
};

export default NotebookPage;
