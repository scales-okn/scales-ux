import React, { FunctionComponent, useEffect, useState } from "react";
import { useHelpTexts } from "src/store/helpTexts";

import * as yup from "yup";
import { useFormik } from "formik";
import {
  TextField,
  Button,
  Typography,
  Box,
  useTheme,
  Grid,
} from "@mui/material";

import ModalContainer from "src/components/Modals/ModalContainer";

type HelpTextDetailModalT = {
  feedbackDetail: Record<string, unknown>;
  closeModal: () => void;
};

const HelpTextDetailModal: FunctionComponent<HelpTextDetailModalT> = ({
  closeModal,
  feedbackDetail,
}) => {
  const theme = useTheme();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const { updateHelpText, deleteHelpText } = useHelpTexts();
  const {
    slug,
    description,
    examples,
    options,
    links,
  }: {
    slug?: string;
    description?: string;
    examples?: string;
    options?: string;
    links?: string;
  } = feedbackDetail || {};

  const validationSchema = yup.object({
    description: yup.string().required("Description is required"),
    examples: yup.string(),
    options: yup.string(),
    links: yup.string(),
  });

  const initialValues = {
    description: description || "",
    examples: examples || "",
    options: options || "",
    links: links || "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      updateHelpText(slug, values);
      closeModal();
      formik.resetForm();
    },
  });

  useEffect(() => {
    formik.setValues(initialValues);
  }, [feedbackDetail]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = () => {
    if (confirmVisible) {
      deleteHelpText(slug);
      setTimeout(() => {
        closeModal();
        setConfirmVisible(false);
      }, 500);
    } else {
      setConfirmVisible(true);
    }
  };

  if (!slug) return null;

  return (
    <ModalContainer
      open
      onClose={closeModal}
      title={`${slug} Details`}
      paperStyles={{ width: "90vw" }}
    >
      <Grid container sx={{}}>
        <Grid
          xs={6}
          sx={{ paddingRight: "12px", minWidth: "300px", marginBottom: "24px" }}
        >
          <Typography
            variant="h5"
            sx={{ color: theme.palette.primary.dark, marginBottom: "12px" }}
          >
            Description:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && !!formik.errors.description}
            helperText={formik.touched.description && formik.errors.description}
          />
        </Grid>
        <Grid xs={6} sx={{ marginBottom: "24px" }}>
          <Typography
            variant="h5"
            sx={{ color: theme.palette.primary.dark, marginBottom: "12px" }}
          >
            Examples:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            name="examples"
            value={formik.values.examples}
            onChange={formik.handleChange}
            error={formik.touched.examples && !!formik.errors.examples}
            helperText={"* Separate by !!"}
          />
        </Grid>

        <Grid
          xs={6}
          sx={{ paddingRight: "12px", minWidth: "300px", marginBottom: "24px" }}
        >
          <Typography
            variant="h5"
            sx={{ color: theme.palette.primary.dark, marginBottom: "12px" }}
          >
            Options:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            name="options"
            value={formik.values.options}
            onChange={formik.handleChange}
            error={formik.touched.options && !!formik.errors.options}
            helperText={"* Separate by !!"}
          />
        </Grid>

        <Grid xs={6}>
          <Typography
            variant="h5"
            sx={{ color: theme.palette.primary.dark, marginBottom: "12px" }}
          >
            Links:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            name="links"
            value={formik.values.links}
            onChange={formik.handleChange}
            error={formik.touched.links && !!formik.errors.links}
            helperText={"* Separate by !!"}
          />
        </Grid>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginTop: "48px",
          }}
        >
          <Button
            color="error"
            variant="outlined"
            onClick={handleDelete}
            sx={{
              marginRight: "12px",
            }}
          >
            {confirmVisible ? "Confirm Delete" : "Delete"}
          </Button>
          <Button variant="contained" onClick={() => formik.handleSubmit()}>
            Update
          </Button>
        </Box>
      </Grid>
    </ModalContainer>
  );
};

export default HelpTextDetailModal;
