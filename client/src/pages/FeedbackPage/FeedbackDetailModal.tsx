import React from "react";
import ModalContainer from "components/Modals/ModalContainer";

type FeedbackDetailModalT = {
  feedbackDetail: string;
  closeModal: (arg: null) => void;
};

const FeedbackDetailModal = ({
  closeModal,
  feedbackDetail,
}: FeedbackDetailModalT) => {
  return (
    <ModalContainer open onClose={() => closeModal(null)}>
      <span>{feedbackDetail}</span>
    </ModalContainer>
  );
};

export default FeedbackDetailModal;
