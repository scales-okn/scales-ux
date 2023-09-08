import React, { FunctionComponent, useState, useEffect } from "react";
import { useParams } from "react-router";
import { authSelector } from "src/store/auth";
import { authorizationHeader } from "src/helpers/authorizationHeader";
import { useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { useEffectOnce } from "react-use";
import { makeRequest } from "src/helpers/makeRequest";

type Params = {
  ringId: string | null;
  ringVersion: string | null;
  entityType: string | null;
  docId: string | null;
};

const DocumentPage: FunctionComponent = () => {
  const {
    ringId = null,
    ringVersion = null,
    entityType = null,
    docId = null,
  } = useParams<Params>();
  const [html, setHtml] = useState("");
  const { token } = useSelector(authSelector);
  const authHeader = authorizationHeader(token);
  const docUrl = `/proxy/document/${ringId}/${ringVersion}/${entityType}/${docId}`;
  const receiptStart1 = `<table width="400"`,
    receiptStart2 = `<table border="1"`,
    receiptStart3 = `<table bgcolor="white"`;

  const fetchDocument = async () => {
    try {
      const response = await makeRequest.get(docUrl, { responseType: "text" });

      if (response) {
        const html =
          response
            .replaceAll("onclick", "onclick-removed-by-satyrn")
            .split("</script>")
            .slice(-1)[0]
            .split(receiptStart1)[0]
            .split(receiptStart2)[0]
            .split(receiptStart3)[0] + "<br><br>";

        return setHtml(html);
      } else {
        return "<div>There was an error retrieving this document.</div>";
      }
    } catch (error) {
      return "<div>There was an error retrieving this document.</div>";
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [docId]);

  return (
    <Loader isVisible={!html}>
      <div dangerouslySetInnerHTML={{ __html: html }}></div>
    </Loader>
  );
};

export default DocumentPage;
