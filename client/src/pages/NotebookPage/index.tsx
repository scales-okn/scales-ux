import React, { FunctionComponent, useEffect } from "react";
import { useParams } from "react-router";
import Notebook from "../../components/Notebook";
import PageLayout from "../../components/PageLayout";
import Loader from "../../components/Loader";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotebook, notebookSelector, clearNotebook } from "../../store/notebook";

type Params = {
  notebookId: string | null;
};

type Ring = {
  id: string;
  name: string;
  description?: string | null;
};

const NotebookPage: FunctionComponent = () => {
  const { notebookId = null } = useParams<Params>();
  const { loadingNotebook } = useSelector(notebookSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    if (notebookId === "new") {
      dispatch(clearNotebook());
      return;
    }

    dispatch(fetchNotebook(notebookId));
  }, [notebookId]);

  return (
    <PageLayout>
      <Loader animation="border" isVisible={loadingNotebook}>
        <Notebook />
      </Loader>
    </PageLayout>
  );
};

export default NotebookPage;
