import React, { FunctionComponent, useState } from "react";
import { useParams } from "react-router";
import { authSelector } from "store/auth";
import { authorizationHeader } from "utils";
import { useSelector } from "react-redux";
import PageLayout from "../../components/PageLayout";
import Loader from "../../components/Loader";
import { useEffectOnce } from "react-use";

type Params = {
  ringId: string | null;
  ringVersion: string | null;
  entityType: string | null;
  docId: string | null;
};

const DocumentPage: FunctionComponent = () => {
  const { ringId = null, ringVersion = null, entityType = null, docId = null } = useParams<Params>();
  const [html, setHtml] = useState("");
  const { token } = useSelector(authSelector);
  const authHeader = authorizationHeader(token);
  const docUrl = `/proxy/document/${ringId}/${ringVersion}/${entityType}/${docId}`;
  const receiptStart1 = `<table width="400"`,
    receiptStart2 = `<table border="1"`,
    receiptStart3 = `<table bgcolor="white"`;

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
        console.log(html);
        return setHtml(html.replaceAll("onclick", "onclick-removed-by-satyrn").split("</script>").slice(-1)[0].split(receiptStart1)[0].split(receiptStart2)[0].split(receiptStart3)[0] + "<br><br>");
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
      <Loader animation="border" isVisible={!html}>
        <div dangerouslySetInnerHTML={{ __html: html }}></div>
      </Loader>
    </PageLayout>
  );
};

export default DocumentPage;
