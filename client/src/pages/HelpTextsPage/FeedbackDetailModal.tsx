import React, { FunctionComponent } from "react";
import { detailStyles } from "./styles";
import ModalContainer from "components/Modals/ModalContainer";

type FeedbackDetailModalT = {
  feedbackDetail: Record<string, unknown>;
  closeModal: (arg: null) => void;
};

const FeedbackDetailModal: FunctionComponent<FeedbackDetailModalT> = ({
  closeModal,
  feedbackDetail,
}) => {
  const { slug, description, examples, options, links } = feedbackDetail || {};
  if (!slug) return null;

  return (
    <ModalContainer open onClose={() => closeModal(null)}>
      <div className={`tooltip-title ${detailStyles}`}>
        <section>
          <h5>Slug:</h5>
          <p>{slug}</p>
        </section>

        <section>
          <h5>Description:</h5>
          <p>{description}</p>
        </section>

        <section>
          <h5>Examples:</h5>
          <p>{examples}</p>
        </section>

        <section>
          <h5>Options:</h5>
          <p>{options}</p>
        </section>

        <section>
          <h5>Links:</h5>
          <p>{links}</p>
        </section>
      </div>
    </ModalContainer>
  );
};

export default FeedbackDetailModal;
