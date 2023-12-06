import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import Loader from "../../components/Loader";
import { makeRequest } from "src/helpers/makeRequest";
import { Box } from "@mui/material";

type Params = {
  ringId: string | null;
  ringVersion: string | null;
  entityType: string | null;
  docId: string | null;
};

const DocumentPage = () => {
  const {
    ringId = null,
    ringVersion = null,
    entityType = null,
    docId = null,
  } = useParams<Params>();
  const [html, setHtml] = useState("");
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
  }, [docId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Loader isVisible={!html}>
      <Box sx={{ paddingBottom: "140px" }}>
        <Box
          dangerouslySetInnerHTML={{ __html: html }}
          sx={{
            background: "white",
            padding: "48px",
            borderRadius: "4px",

            "& #cmecfMainContent": {
              height: "unset !important", // overwrite height: 100% from source html
            },
          }}
        ></Box>
      </Box>
    </Loader>
  );
};

export default DocumentPage;
