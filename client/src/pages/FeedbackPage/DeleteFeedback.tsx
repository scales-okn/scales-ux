import React, { useState } from "react";
import { makeRequest } from "src/helpers/makeRequest";

import { useNotify } from "src/components/Notifications";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import StandardButton from "src/components/Buttons/StandardButton";

type Props = {
  feedbackId: number;
};

const DeleteFeedback = ({ feedbackId }: Props) => {
  const { notify } = useNotify();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const DeleteFeedback = async () => {
    const response = await makeRequest.delete(`/api/feedback/${feedbackId}`);

    if (response.code === 200) {
      window.location.reload();
    } else {
      notify(response.message, "error");
    }
  };

  return (
    <>
      <StandardButton
        className="text-white float-end me-2"
        variant="danger"
        onClick={(e) => {
          e.stopPropagation();
          setConfirmVisible(true);
        }}
        size="sm"
      >
        Delete
      </StandardButton>
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
