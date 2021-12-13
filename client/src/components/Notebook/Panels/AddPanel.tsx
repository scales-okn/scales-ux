import React from "react";
import { Button } from "react-bootstrap";
import "./AddPanel.scss";
import { useNotebookContext } from "../NotebookContext";
import { useAuthHeader, useAuthUser } from "react-auth-kit";

const AddPanel = () => {
  const { setPanels, notebook, panels } = useNotebookContext();
  const authHeader = useAuthHeader();
  const auth = useAuthUser();
  const user = auth();

  const addPanel = async (payload) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/panels`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const { data } = await response.json();
      const { panel } = data;
      setPanels([panel, ...panels]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Button
      className="add-panel-btn w-100"
      size="lg"
      variant="link"
      onClick={() =>
        addPanel({
          notebookId: notebook.id,
          userId: user.id,
        })
      }
    >
      Add Panel
    </Button>
  );
};

export default AddPanel;
