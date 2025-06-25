import React, { useState } from "react";
import { TextField, Grid, Button, Box } from "@mui/material";

import { useFormik } from "formik";
import * as yup from "yup";

import ModalContainer from "src/components/Modals/ModalContainer";
import { useHelpTexts } from "src/store/helpTexts";

type HelpTextFields = {
  slug: string;
  description: string;
  examples: string;
  options: string;
  links: string;
};

const NewHelpText = () => {
  const { createHelpText } = useHelpTexts();

  const [newHelpTextVisible, setNewHelpTextVisible] = useState(false);

  const onClose = () => {
    setNewHelpTextVisible(false);
    formik.resetForm();
  };

  const validationSchema = yup.object({
    slug: yup.string().required("Slug is required"),
    description: yup.string().required("Description is required"),
    examples: yup.string(),
    options: yup.string(),
    links: yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      slug: "",
      description: "",
      examples: "",
      options: "",
      links: "",
    },
    validationSchema,
    onSubmit: (values: HelpTextFields) => {
      createHelpText(values);
      onClose();
    },
  });

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Button
          color="primary"
          variant="contained"
          onClick={() => setNewHelpTextVisible(true)}
          sx={{ marginBottom: "24px" }}
        >
          Add Help Text
        </Button>
      </Box>
      <ModalContainer
        open={newHelpTextVisible}
        onClose={onClose}
        title="Add New Help Text"
      >
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="slug"
                label="Slug"
                fullWidth
                {...formik.getFieldProps("slug")}
                error={formik.touched.slug && Boolean(formik.errors.slug)}
                helperText={formik.touched.slug && formik.errors.slug}
                placeholder="Unique identifier for the help text"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                multiline
                fullWidth
                {...formik.getFieldProps("description")}
                error={
                  formik.touched.description &&
                  Boolean(formik.errors.description)
                }
                helperText={
                  formik.touched.description && formik.errors.description
                }
                placeholder="Description of the help text"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="examples"
                label="Examples"
                multiline
                fullWidth
                {...formik.getFieldProps("examples")}
                error={
                  formik.touched.examples && Boolean(formik.errors.examples)
                }
                helperText={formik.touched.examples && formik.errors.examples}
                placeholder="Examples of use. Separate input items by !!"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="options"
                label="Options"
                multiline
                fullWidth
                {...formik.getFieldProps("options")}
                error={formik.touched.options && Boolean(formik.errors.options)}
                helperText={formik.touched.options && formik.errors.options}
                placeholder="First few available options in autocomplete. Separate input items by !!"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="links"
                label="Links"
                multiline
                fullWidth
                {...formik.getFieldProps("links")}
                error={formik.touched.links && Boolean(formik.errors.links)}
                helperText={formik.touched.links && formik.errors.links}
                placeholder="Links to relevant documentation. Separate input items by !!"
              />
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                marginTop: "12px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button type="submit" variant="contained">
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </ModalContainer>
    </>
  );
};

export default NewHelpText;
