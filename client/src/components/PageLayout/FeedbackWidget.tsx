import React, { useState } from "react";
import {
  Modal,
  TextareaAutosize,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";

import { makeRequest } from "src/helpers/makeRequest";

import { useNotify } from "src/components/Notifications";

import { styles } from "./styles";
import "./PageLayout.scss";

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
    onSubmit: async (values) => {
      try {
        const response = await makeRequest.post(`/api/feedback`, values);

        if (response.status === "OK") {
          notify(response.message, "success");
          setFeedbackModalOpen(false);
        } else {
          notify(response.message, "error");
        }
      } catch (error) {
        console.error(error); // eslint-disable-line no-console
        notify("An error occurred", "error");
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
        open={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        sx={{
          maxWidth: "500px",
          width: "100%",
          margin: "0 auto",
          marginTop: "160px",
        }}
      >
        <div style={{ background: "white" }}>
          <form onSubmit={formik.handleSubmit}>
            <Box
              sx={{ background: "var(--main-purple-light)", padding: "18px" }}
              color="white"
            >
              <Typography variant="h6">Let Us Know What You Think!</Typography>
            </Box>
            <Box sx={{ padding: "36px 18px" }}>
              <TextareaAutosize
                name="body"
                placeholder="Leave your feedback here..."
                onChange={formik.handleChange}
                value={formik.values.body}
                style={{ width: "100%", minHeight: "250px", padding: "12px" }}
              />
              {formik.touched.body && formik.errors.body && (
                <Typography color="error">{formik.errors.body}</Typography>
              )}
            </Box>
            <Box sx={{ padding: "0 18px" }}>
              <Typography variant="caption" style={{ color: "grey" }}>
                Note: Specifics are very helpful: Who, What, Where, When, Why
              </Typography>
            </Box>
            <Box sx={{ padding: "24px 18px" }} textAlign="right">
              <Button color="info" variant="contained">
                Submit
              </Button>
            </Box>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default FeedbackWidget;
