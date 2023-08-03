/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { FunctionComponent, ReactNode } from "react";
import { SpinnerProps, Spinner } from "react-bootstrap";

interface ILoaderProps extends SpinnerProps {
  isVisible: boolean;
  children?: any;
  loaderContent?: ReactNode;
  contentHeight?: string;
}

const Loader: FunctionComponent<ILoaderProps> = ({
  isVisible = false,
  animation = "border",
  variant,
  size = null,
  children,
  contentHeight,
  loaderContent,
}) => {
  if (isVisible) {
    return (
      <>
        {loaderContent ? (
          loaderContent
        ) : (
          <div
            className="d-flex justify-content-center p-2"
            style={{
              height: contentHeight || "100%",
            }}
          >
            <Spinner
              className="align-self-center"
              animation={animation}
              variant={variant}
              size={size}
            />
          </div>
        )}
      </>
    );
  }

  return children;
};

export default Loader;
