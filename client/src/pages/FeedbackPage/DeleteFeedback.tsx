import React, { useState } from "react";
import { makeRequest } from "src/helpers/makeRequest";

import { useNotify } from "src/components/Notifications";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import DeleteButton from "src/components/Buttons/DeleteButton";

type Props = {
  feedbackId: number;
};

const DeleteFeedback = ({ feedbackId }: Props) => {
  const { notify } = useNotify();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleDelete = async () => {
    const response = await makeRequest.delete(`/api/feedback/${feedbackId}`);

    if (response.status === "OK") {
      window.location.reload();
    } else {
      notify(response.message, "error");
    }
  };

  return (
    <>
      <DeleteButton
        variant="text"
        onClick={() => {
          setConfirmVisible(true);
        }}
      />
      <ConfirmModal
        itemName="feedback"
        open={confirmVisible}
        setOpen={setConfirmVisible}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default DeleteFeedback;
