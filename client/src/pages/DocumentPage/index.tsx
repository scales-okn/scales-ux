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

  const badLinks = `<div class="bd"><img src="/graphics/logo-cmecf-sm.png" class="cmecfLogo" id="cmecfLogo" alt="CM/ECF" title="">
				<ul class="first-of-type">
<li class="yuimenubaritem first-of-type" id="yui-gen0" groupindex="0" index="0"><a class="yuimenubaritemlabel" href="/cgi-bin/iquery.pl"><u>Q</u>uery</a></li>
<li class="yuimenubaritem yuimenubaritem-hassubmenu" id="yui-gen1" groupindex="0" index="1"><a class="yuimenubaritemlabel yuimenubaritemlabel-hassubmenu" href="/cgi-bin/DisplayMenu.pl?Reports">Reports <div class="spritedownarrow"></div></a></li>
<li class="yuimenubaritem yuimenubaritem-hassubmenu" id="yui-gen2" groupindex="0" index="2"><a class="yuimenubaritemlabel yuimenubaritemlabel-hassubmenu" href="/cgi-bin/DisplayMenu.pl?Utilities"><u>U</u>tilities <div class="spritedownarrow"></div></a></li>
				<li class="yuimenubaritem" id="yui-gen3" groupindex="0" index="3">
				<a class="yuimenubaritemlabel" onclick="CMECF.MainMenu.showHelpPage(); return false">Help</a></li>
				
<li class="yuimenubaritem" id="yui-gen4" groupindex="0" index="4"><a class="yuimenubaritemlabel" href="/cgi-bin/login.pl?logout">Log Out</a></li></ul>`;

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
        return setHtml(html.replace(badLinks, ""));
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
