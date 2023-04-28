import React, { FunctionComponent } from "react";
import { useParams } from "react-router";
import { authSelector } from "store/auth";
import { authorizationHeader } from "utils";
import { useSelector } from "react-redux";
import PageLayout from "../../components/PageLayout";
import Loader from "../../components/Loader";
import { useEffectOnce } from "react-use";
// import { fetchDocument } from "../../store/document";

type Params = {
  ringId: string | null;
  ringVersion: string | null;
  entityType: string | null;
  docId: string | null;
};

const DocumentPage: FunctionComponent = () => {
  const { ringId = null, ringVersion = null, entityType = null, docId = null } = useParams<Params>();
  const { token } = useSelector(authSelector);
  const authHeader = authorizationHeader(token);
  const docUrl = `/proxy/document/${ringId}/${ringVersion}/${entityType}/${docId}`;

  const fetchDocument = async () => {
    try {
      const response = await fetch(docUrl, {
        method: "GET",
        headers: {
          "Content-Type": "text/html",
          ...authHeader,
        },
      });

      if (response.status === 200) {
        const html = await response.text();
        return html;
      } else {
        return "<div>There was an error retrieving this document.</div>";
      }
    } catch (error) {
      return "<div>There was an error retrieving this document.</div>";
    }
  };

  useEffectOnce(() => {
    fetchDocument();
  });

  return (
    <PageLayout>
      <Loader animation="border" isVisible={false}>
        <iframe title="title" dangerouslySetInnerHTML={{ __html: "fffff" }}></iframe>
      </Loader>
    </PageLayout>
  );
};

export default DocumentPage;
