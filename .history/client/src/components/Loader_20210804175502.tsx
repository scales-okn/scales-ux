import React, { FunctionComponent, ReactNode } from "react";
import { SpinnerProps, Spinner } from "react-bootstrap";

interface Props {
  isVisible: boolean;
  children: ReactNode;
}

const Loader: FunctionComponent<Props> = ({
  isVisible = false,

  children,
}: Props) => {
  if (isVisible) {
    return;
  }
};

export default Loader;
