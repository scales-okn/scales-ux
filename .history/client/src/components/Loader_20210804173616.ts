import React, { FunctionComponent, ReactChild, ReactChildren, ReactNode } from "react";
import Spinner, { SpinnerProps } from "react-bootstrap";

interface Props extends SpinnerProps {
  isVisible: boolean;
  children: ReactNode;
}

const Loader: FunctionComponent = (props: Props) => {
  const {
    isVisible = false,
    animation = "border",
    variant = "dark",
    size = "",
    children,
  } = props;

  return isVisible ? <><Spinner {...props} /><> : children;
};

export default Loader;
