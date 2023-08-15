import React, { FunctionComponent, useEffect } from "react";
import { useParams } from "react-router";
import Notebook from "../../components/Notebook";
import PageLayout from "../../components/PageLayout";
import Loader from "../../components/Loader";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotebook,
  notebookSelector,
  notebookActions,
} from "../../store/notebook";

type Params = {
  notebookId: string | null;
};

const NotebookPage: FunctionComponent = () => {
  const { notebookId = null } = useParams<Params>();
  const { loadingNotebook } = useSelector(notebookSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(notebookActions.clearNotebook());
    if (notebookId !== "new") {
      dispatch(fetchNotebook(notebookId));
    }
  }, [notebookId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PageLayout>
      <Loader animation="border" isVisible={loadingNotebook}>
        <Notebook />
      </Loader>
    </PageLayout>
  );
};

export default NotebookPage;
