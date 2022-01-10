import React from "react";
import { Button } from "react-bootstrap";
import { createPanel } from "../../store/panels";
import { useDispatch } from "react-redux";
import "./AddPanel.scss";

const AddPanel = () => {
  const dispatch = useDispatch();

  return (
    <Button
      className="add-panel-btn w-100"
      size="lg"
      variant="link"
      onClick={() => dispatch(createPanel())}
    >
      Add Panel
    </Button>
  );
};

export default AddPanel;
