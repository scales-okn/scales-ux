import React, { FunctionComponent, useState } from "react";

import { makeRequest } from "src/helpers/makeRequest";

import { Button } from "@mui/material";
import { useNotify } from "src/components/Notifications";
import ConfirmModal from "src/components/Modals/ConfirmModal";

type Props = {
  feedbackId: number;
};

const DeleteFeedback: FunctionComponent<Props> = ({ feedbackId }) => {
  const { notify } = useNotify();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const DeleteFeedback = async () => {
    const response = await makeRequest.delete(`/api/feedback/${feedbackId}`);

    if (response.status === "OK") {
      notify("Feedback deleted successfully", "success");
    } else {
      notify(response.message, "error");
    }
  };

  return (
    <>
      <Button
        color="error"
        variant="outlined"
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setConfirmVisible(true);
        }}
      >
        Delete
      </Button>
      <ConfirmModal
        itemName="feedback"
        open={confirmVisible}
        setOpen={setConfirmVisible}
        onConfirm={DeleteFeedback}
      />
    </>
  );
};

export default DeleteFeedback;
