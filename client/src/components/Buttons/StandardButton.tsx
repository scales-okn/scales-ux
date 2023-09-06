import React from "react";
import { Button } from "react-bootstrap";

const StandardButton = (props) => {
  return <Button {...props}>{props.children}</Button>;
};

export default StandardButton;
