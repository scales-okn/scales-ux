/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { CircularProgress, Box } from "@mui/material";

interface LoaderT {
  isVisible: boolean;
  children?: any;
  contentHeight?: string;
  size?: number;
}

const Loader = ({ isVisible = false, size = 60, children }: LoaderT) => {
  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        width: "100%",
        minHeight: isVisible ? "120px" : "0px",
        transition: ".2s all",
      }}
    >
      {isVisible && (
        <Box
          sx={{
            position: "absolute",
            zIndex: 1000,
            top: "40%",
            left: "50%",
          }}
        >
          <CircularProgress
            sx={{
              alignSelf: "center",
            }}
            size={size}
            thickness={5}
          />
        </Box>
      )}
      {children}
    </Box>
  );

  return children;
};

export default Loader;
