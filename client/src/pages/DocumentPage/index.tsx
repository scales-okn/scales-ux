import React, { FunctionComponent, useEffect } from "react";
import { useParams } from "react-router";
import PageLayout from "../../components/PageLayout";
import Loader from "../../components/Loader";
import { fetchDocument } from "../../store/document";

type Params = {
  ringId: string | null;
  ringVersion: string | null;
  entityType: string | null;
  docId: string | null;
};

const DocumentPage: FunctionComponent = () => {
  const { ringId = null, ringVersion = null, entityType = null, docId = null } = useParams<Params>();

  const document = fetchDocument(ringId, ringVersion, entityType, docId)

  debugger; // eslint-disable-line no-debugger

  return (
    <PageLayout>
      <Loader animation="border" isVisible={false}>
        <iframe dangerouslySetInnerHTML={{ __html: "fffff" }}>
        </iframe>
      </Loader>
    </PageLayout>
  );
};

export default DocumentPage;
