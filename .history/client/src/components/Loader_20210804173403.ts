import React, { FunctionComponent, ReactChild, ReactChildren } from "react";
import { Spinner, SpinnerProps } from "react-bootstrap";

interface Props extends SpinnerProps {
  isVisible: boolean;
  children: ReactChildren
}

const Loader: FunctionComponent = (props: Props) => {
  const {isVisible = false, animation = "border", variant="dark", size=""} =  props;



  return isVisible ? <Spinner> : children;
};

export default Loader;
