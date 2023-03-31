import React, { FunctionComponent } from "react";
import Modal from "react-bootstrap/Modal";

type FeedbackDetailModalT = {
  feedbackDetail: string;
  closeModal: (arg: null) => void;
};

const FeedbackDetailModal: FunctionComponent<FeedbackDetailModalT> = ({
  closeModal,
  feedbackDetail,
}) => {
  return (
    <Modal show onHide={() => closeModal(null)}>
      <Modal.Body>
        <div style={{ wordWrap: "break-word" }}>{feedbackDetail}</div>
      </Modal.Body>
    </Modal>
  );
};

export default FeedbackDetailModal;
