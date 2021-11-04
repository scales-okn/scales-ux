import React, { FunctionComponent, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Form, ListGroup, Row, Col } from "react-bootstrap";
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

type Ring = {
  id: string;
  name: string;
  description?: string | null;
};

const NotebookPage: FunctionComponent = () => {
  const { notebookId } = useParams<Params>();
  const { rings, loadingRings, hasErrors } = useSelector(ringsSelector);
  // const [selectedRing, setSelectedRing] = useState<Ring>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchRings());
  }, []);

  return (
    <PageLayout>
      <Loader animation="border" isVisible={loadingRings}>
        <NotebookContextProvider
          rings={rings}
          notebookId={Number(notebookId) ? notebookId : null}
        >
          <Notebook />
        </NotebookContextProvider>
      </Loader>
    </PageLayout>
  );
};

export default NotebookPage;
