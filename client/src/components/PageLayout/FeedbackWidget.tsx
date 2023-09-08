import React, { useState } from "react";

import { Modal, Form } from "react-bootstrap";
import { useFormik } from "formik";
import * as yup from "yup";

import { makeRequest } from "src/helpers/makeRequest";

import { useNotify } from "src/components/Notifications";
import StandardButton from "src/components/Buttons/StandardButton";

import { styles } from "./styles";
import "./PageLayout.scss";

type FeedbackFieldsT = {
  body: string;
};

const FeedbackWidget = () => {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const commentValidationSchema = yup.object({
    body: yup.string().required("Comment is required for submission"),
  });

  const { notify } = useNotify();
  const formik = useFormik({
    initialValues: {
      body: "",
    },
    validationSchema: commentValidationSchema,
    onSubmit: async (values: FeedbackFieldsT, { setErrors }) => {
      const response = await makeRequest.post(`/api/feedback`, values);

      if (response.code === 200) {
        notify(response.message, "success");
        setFeedbackModalOpen(false);
      } else {
        notify(response.message, "error");
      }
    },
  });

  return (
    <div className={styles}>
      <div
        className="feedback-widget"
        onClick={() => setFeedbackModalOpen(true)}
      >
        Feedback
      </div>
      <Modal
        show={feedbackModalOpen}
        onHide={() => setFeedbackModalOpen(false)}
      >
        <Form noValidate onSubmit={formik.handleSubmit}>
          <Modal.Header
            closeButton
            style={{ background: "var(--main-purple-light)" }}
          >
            <Modal.Title style={{ color: "white" }}>
              Let Us Know What You Think!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Control
                as="textarea"
                name="body"
                aria-label="With textarea"
                style={{ minHeight: "250px" }}
                onChange={formik.handleChange}
                isInvalid={formik.touched.body && Boolean(formik.errors?.body)}
              />
            </Form.Group>

            <div
              style={{
                fontSize: "12px",
                fontStyle: "italic",
                color: "grey",
              }}
            >
              Note: Specifics are very helpful: Who, What, Where, When, Why
            </div>
          </Modal.Body>
          <Modal.Footer>
            <StandardButton
              variant="primary"
              type="submit"
              style={{
                color: "white",
                background: "var(--main-purple-light)",
                border: "none",
              }}
            >
              Submit
            </StandardButton>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default FeedbackWidget;
