import React from "react";

const renderHTML = (rawHTML: string) =>
  React.createElement("div", {
    dangerouslySetInnerHTML: { __html: rawHTML },
  });

export default renderHTML;
