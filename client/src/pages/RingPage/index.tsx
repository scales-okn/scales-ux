import React, {
  FunctionComponent,
  useEffect,
  useState,
} from "react";
import { Button, Table } from "react-bootstrap";
import PageLayout from "../../components/PageLayout";
import { useParams } from "react-router-dom";

import { useRing } from "store/rings";
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';

type Params = {
  ringId: string | null;
};


const RingPage = () => {
  const { ringId = null } = useParams<Params>();
  const { ring } = useRing(Number(ringId));
  const [ontology, setOntology] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  
  const updateRing = (ring) => {
    fetch(`/api/rings/${ring.id}`, {
      method: "PUT",
      body: JSON.stringify(ring),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        try {
          if (response?.code === 200) {
            setOntology(response.data.ring.ontology);
            setDataSource(response.data.ring.dataSource);
          }
        } catch (error) {
          console.log(error);
        }
      })
      .catch((error) => console.log(error));
  };


  return (
    <PageLayout>
      {ring && (<>
        <h5>Details</h5>
        <Table striped bordered hover className="bg-white mb-3">
          <tbody>
            <tr>
              <td> Ring Id</td>
              <td>{ring.id}</td>
            </tr>
            <tr>
              <td> Name</td>
              <td>{ring.name}</td>
            </tr>
            <tr>
              <td> Description</td>
              <td>{ring.description}</td>
            </tr>
            <tr>
              <td> Created At</td>
              <td>{ring.createdAt}</td>
            </tr>
            <tr>
              <td> Updated At</td>
              <td>{ring.updatedAt}</td>
            </tr>
          </tbody>
        </Table>
        <h5>Edit DataSource </h5>
        <JSONInput
          id='dataSource'
          placeholder={ring.dataSource}
          // colors="default"
          locale={locale}
          height='550px'
          width='100%'
          onChange={(e) => {
            setDataSource(e.jsObject);
          }}
        />

        <h5 className="mt-3">Edit ontology </h5>
        <JSONInput
          id='ontology'
          placeholder={ring.ontology}
          onChange={(e) => {
            setOntology(e.jsObject);
          }}
          locale={locale}
          height='550px'
          width='100%'
        />
        <Button variant="primary" className="mt-3 text-white mb-3 pull-right">
          Save
        </Button>
      </>
      )}
    </PageLayout>
  )
}


export default RingPage