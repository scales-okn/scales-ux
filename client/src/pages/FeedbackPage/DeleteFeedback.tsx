import React, { useState } from "react";
import { makeRequest } from "src/helpers/makeRequest";

import { useNotify } from "src/components/Notifications";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import { Button } from "@mui/material";

type Props = {
  feedbackId: number;
};

const DeleteFeedback = ({ feedbackId }: Props) => {
  const { notify } = useNotify();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const DeleteFeedback = async () => {
    const response = await makeRequest.delete(`/api/feedback/${feedbackId}`);

    if (response.status === "OK") {
      window.location.reload();
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
