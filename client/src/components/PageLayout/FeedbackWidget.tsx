import React, { useState } from "react";
import { useFormik } from "formik";
import { useAuthHeader } from "store/auth";
import { useNotify } from "components/Notifications";
import * as yup from "yup";
import * as S from "./styles";
import { Modal, Button, Form } from "react-bootstrap";

import "./PageLayout.scss";

type FeedbackFieldsT = {
  body: string;
};

const FeedbackWidget = () => {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const authorizationHeader = useAuthHeader();
  const commentValidationSchema = yup.object({
    body: yup.string().required("Comment is required for submission"),
  });

  const { notify } = useNotify();
  const formik = useFormik({
    initialValues: {
      body: "",
    },
    validationSchema: commentValidationSchema,
    onSubmit: (values: FeedbackFieldsT, { setErrors }) => {
      fetch(`/api/feedback`, {
        method: "POST",
        headers: {
          ...authorizationHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
        .then((response) => response.json())
        .then((response) => {
          try {
            switch (response.code) {
              case 200: {
                notify(response.message, "success");
                setFeedbackModalOpen(false);
                break;
              }
              default: {
                if (response.errors) {
                  setErrors(response.errors);
                }
                notify(response.message, "error");
                break;
              }
            }
          } catch (error) {
            console.warn(error); // eslint-disable-line no-console
          }
        });
    },
  });

  return (
    <>
      <S.FeedbackWidget onClick={() => setFeedbackModalOpen(true)}>
        Feedback
      </S.FeedbackWidget>
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
            <Button
              variant="primary"
              type="submit"
              style={{
                color: "white",
                background: "var(--main-purple-light)",
                border: "none",
              }}
            >
              Submit
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default FeedbackWidget;
