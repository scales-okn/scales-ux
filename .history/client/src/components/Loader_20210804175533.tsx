import React, { FunctionComponent, ReactNode, JSX } from "react";
import { SpinnerProps, Spinner } from "react-bootstrap";

interface Props {
  isVisible: boolean;
  children: JSX.Element;
}

const Loader: FunctionComponent<Props> = ({
  isVisible = false,

  children,
}: Props) => {
  if (isVisible) {
    return;
  }

  return children;
};

export default Loader;
