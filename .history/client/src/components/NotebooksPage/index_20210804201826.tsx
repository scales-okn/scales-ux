import React, { FunctionComponent, useEffect, useState } from "react";

import { Form, ListGroup } from "react-bootstrap";
import NewNotebook from "./NewNotebook";
import NotebookContextProvider from "./NotebookContext";
import PageLayout from "../PageLayout";
import { useAuthHeader, useAuthUser } from "react-auth-kit";
import Loader from "../Loader";

const NotebooksPage: FunctionComponent = () => {
  const [notebooks, setNotebooks] = useState([]);
  const [loadingNotebooks, setLoadingNotebooks] = useState(false);
  const [notebookTitle, setNotebookTitle] = useState("New Notebook");
  const authHeader = useAuthHeader();

  const fetchNotebooks = async () => {
    setLoadingNotebooks(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/notebooks`,
        {
          method: "GET",
          headers: {
            Authorization: authHeader(),
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      setNotebooks(data);
      setLoadingNotebooks(false);
    } catch (error) {
      // TODO: Implement Error handling
    }
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  return (
    <PageLayout>
      <Loader animation="border" isVisible={loadingNotebooks}>
        <ListGroup>
          <ListGroup.Item>Cras justo odio</ListGroup.Item>
          <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
          <ListGroup.Item>Morbi leo risus</ListGroup.Item>
          <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
          <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
        </ListGroup>
      </Loader>
      <NotebookContextProvider>
        <h4 className="mb-4">
          <Form.Control
            size="lg"
            type="text"
            placeholder="Your Notebook Title Here"
            onChange={(event) => {
              setNotebookTitle(event.target.value);
            }}
            value={notebookTitle}
            className="border-0 bg-transparent ps-0 notebook-title"
          />
        </h4>
        <NewNotebook />
      </NotebookContextProvider>
    </PageLayout>
  );
};

export default NotebooksPage;
