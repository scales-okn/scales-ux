import React, { useState } from "react";
import { TextField, Typography, Box, Button } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useFormik } from "formik";
import * as yup from "yup";

import { makeRequest } from "src/helpers/makeRequest";

import { useNotify } from "src/components/Notifications";

import { styles } from "./styles";

import colorVars from "src/styles/colorVars";
import ModalContainer from "../Modals/ModalContainer";

const FeedbackWidget = () => {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
      <Box
        onClick={() => setFeedbackModalOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "fixed",
          bottom: "8px",
          left: "8px",
          height: "32px",
          width: isHovered ? "120px" : "32px",
          background: colorVars.mainPurpleLight,
          color: "white",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "12px",
          transition: "0.2s ease-in-out",
          opacity: 0.8,
          zIndex: 2000,
        }}
      >
        {isHovered ? (
          <Typography
            sx={{ overflow: "hidden", whiteSpace: "nowrap" }}
            variant="body2"
          >
            Report Issue
          </Typography>
        ) : (
          <ErrorOutlineIcon />
        )}
      </Box>
      <ModalContainer
        open={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        paperStyles={{ maxWidth: "600px" }}
        title="Report Bug / Suggest Feature"
        subtitle="We'd love to hear from you! Please let us know what's on your mind. Specifics are very helpful: Who, What, Where, When, Why"
      >
        <>
          <form onSubmit={formik.handleSubmit}>
            <TextField
              name="body"
              placeholder="Type your feedback here"
              onChange={formik.handleChange}
              value={formik.values.body}
              multiline
              rows={8}
              sx={{
                width: "100%",
                padding: "12px",
                marginBottom: "24px",
              }}
            />
            {formik.touched.body && formik.errors.body && (
              <Typography color="error">{formik.errors.body}</Typography>
            )}

            <Box sx={{ padding: "0px 18px 24px 0px" }} textAlign="right">
              <Button color="info" variant="contained" type="submit">
                Submit
              </Button>
            </Box>
          </form>
        </>
      </ModalContainer>
    </div>
  );
};

export default FeedbackWidget;
