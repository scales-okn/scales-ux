import React from "react";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";

import { useNotebook } from "src/store/notebook";
import { sessionUserSelector } from "src/store/auth";

import { TextField, Button, Box, Typography } from "@mui/material";
import ModalContainer from "src/components/Modals/ModalContainer";

const ShareLinkModal = ({ setOpen }) => {
  const { notebook, shareNotebookLink } = useNotebook();
  const sessionUser = useSelector(sessionUserSelector);

  const formik = useFormik({
    initialValues: {
      recipientName: "",
      recipientEmail: "",
      message: "",
    },
    validationSchema: Yup.object({
      recipientName: Yup.string().required("Name is required"),
      recipientEmail: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      message: Yup.string(),
    }),
    onSubmit: (values) => {
      shareNotebookLink({
        id: notebook.id,
        senderId: sessionUser.id,
        recipientEmail: values.recipientEmail,
        recipientName: values.recipientName,
        message: values.message,
      });
      setOpen(false);
    },
  });

  return (
    <ModalContainer open onClose={() => setOpen(false)}>
      <form onSubmit={formik.handleSubmit}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h4" sx={{ marginBottom: "12px" }}>
            Share Notebook
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontStyle: "italic",
              color: "GrayText",
              marginBottom: "24px",
            }}
          >
            Enter recipient details below to share a link to this notebook via
            email. The recipient will be able to view the notebook but not edit
            it. They will also be able to make their own copy, which will not be
            linked to this notebook.
          </Typography>

          <Typography sx={{ marginBottom: "8px" }}>Name*</Typography>
          <TextField
            name="recipientName"
            value={formik.values.recipientName}
            onChange={formik.handleChange}
            error={
              formik.touched.recipientName &&
              Boolean(formik.errors.recipientName)
            }
            helperText={
              formik.touched.recipientName && formik.errors.recipientName
            }
            sx={{ marginBottom: "18px" }}
          />

          <Typography sx={{ marginBottom: "8px" }}>Email*</Typography>
          <TextField
            name="recipientEmail"
            value={formik.values.recipientEmail}
            onChange={formik.handleChange}
            error={
              formik.touched.recipientEmail &&
              Boolean(formik.errors.recipientEmail)
            }
            helperText={
              formik.touched.recipientEmail && formik.errors.recipientEmail
            }
            sx={{ marginBottom: "18px" }}
          />

          <Typography sx={{ marginBottom: "8px" }}>
            Message (optional)
          </Typography>
          <TextField
            name="message"
            multiline
            rows={4}
            value={formik.values.message}
            onChange={formik.handleChange}
            error={formik.touched.message && Boolean(formik.errors.message)}
            helperText={formik.touched.message && formik.errors.message}
            sx={{ marginBottom: "48px" }}
          />

          <Button type="submit" variant="contained" color="success">
            Share Link
          </Button>
        </Box>
      </form>
    </ModalContainer>
  );
};

export default ShareLinkModal;
