import React from "react";
import { Button } from "@mui/material";

const DeleteButton = (props) => {
  return (
    <Button
      variant="outlined"
      color="error"
      size={props.size || "small"}
      onClick={props.onClick}
      {...props}
    >
      Delete
    </Button>
  );
};

export default DeleteButton;
