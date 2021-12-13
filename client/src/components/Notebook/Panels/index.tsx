import React, { FunctionComponent, useState } from "react";
import {
  Accordion,
  Container,
  Row,
  Col,
  Button,
  useAccordionButton,
  Form,
} from "react-bootstrap";
import { useNotebookContext } from "../NotebookContext";
import { DataGrid } from "@material-ui/data-grid";

import Loader from "../../Loader";
import Dataset from "../Dataset";
import AddPanel from "./AddPanel";
import Panel from "./Panel";

const Panels: FunctionComponent = () => {
  const { panels } = useNotebookContext();

  // debugger; // eslint-disable-line

  return (
    <>
      {panels.map((panel, index) => (
        <Panel key="index" panel={panel} />
      ))}

      <AddPanel />
    </>
  );
};

export default Panels;
