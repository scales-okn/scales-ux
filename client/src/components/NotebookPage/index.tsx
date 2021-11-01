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
  const [selectedRing, setSelectedRing] = useState<Ring>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchRings());
  }, []);

  console.log({ selectedRing });

  return (
    <PageLayout>
      <Loader animation="border" isVisible={loadingRings}>
        {selectedRing ? (
          <NotebookContextProvider
            ring={selectedRing}
            notebookId={Number(notebookId) ? notebookId : null}
          >
            <Notebook />
          </NotebookContextProvider>
        ) : (
          <Row className="mb-3 p-3 bg-light">
            <Form.Group as={Col} controlId="ringState">
              <Form.Label>Select a Ring</Form.Label>
              <Form.Select
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  setSelectedRing(
                    rings.find((ring) => ring.id === event.target.value)
                  )
                }
              >
                {rings?.map((ring) => (
                  <option key={ring.name} value={ring.id}>
                    {ring.name} - {ring.id}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Row>
        )}
      </Loader>
    </PageLayout>
  );
};

export default NotebookPage;
