import React, { FunctionComponent, useEffect } from "react";
import { useParams } from "react-router";
import Notebook from "../../components/Notebook";
import PageLayout from "../../components/PageLayout";
import { useDispatch } from "react-redux";
import { fetchNotebook, notebookActions } from "../../store/notebook";

type Params = {
  notebookId: string | null;
};

const NotebookPage: FunctionComponent = () => {
  const { notebookId = null } = useParams<Params>();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(notebookActions.clearNotebook());
    if (notebookId !== "new") {
      dispatch(fetchNotebook(notebookId));
    }
  }, [notebookId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PageLayout>
      <Notebook />
    </PageLayout>
  );
};

export default NotebookPage;
