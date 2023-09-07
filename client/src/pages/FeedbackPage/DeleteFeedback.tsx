import React, { useState } from "react";
import { useAuthHeader } from "src/store/auth";
import { useNotify } from "src/components/Notifications";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import StandardButton from "src/components/Buttons/StandardButton";

type Props = {
  feedbackId: number;
};

const DeleteFeedback = ({ feedbackId }: Props) => {
  const authHeader = useAuthHeader();
  const { notify } = useNotify();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const DeleteFeedback = () => {
    fetch(`/api/feedback/${feedbackId}`, {
      method: "DELETE",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        try {
          switch (response.code) {
            case 200:
              window.location.reload();
              break;
            default:
              notify(response.message, "error");
          }
        } catch (error) {
          console.warn(error); // eslint-disable-line no-console
        }
      })
      .catch((error) => console.warn(error)); // eslint-disable-line no-console
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
