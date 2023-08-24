import React, { useState } from "react";
import { TextField, Grid } from "@mui/material";
import { Button } from "react-bootstrap";
import { useFormik } from "formik";
import { useAuthHeader } from "store/auth";
import * as yup from "yup";
import ModalContainer from "components/Modals/ModalContainer";

type HelpTextFields = {
  slug: string;
  description: string;
  examples: string;
  options: string;
  links: string;
};

const NewHelpText = () => {
  const authorizationHeader = useAuthHeader();

  const [newHelpTextVisible, setNewHelpTextVisible] = useState(false);

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
    onSubmit: (values: HelpTextFields, { setErrors }) => {
      fetch(`/api/helpTexts`, {
        method: "POST",
        headers: {
          ...authorizationHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
        .then((response) => response.json())
        .then((response) => {
          setNewHelpTextVisible(false);
          try {
            switch (response.code) {
              case 200: {
                // notify(response.message, "success");
                // navigate("/sign-in");
                break;
              }
              default: {
                if (response.errors) {
                  setErrors(response.errors);
                }
                // notify(response.message, "error");
                break;
              }
            }
          } catch (error) {
            console.warn(error); // eslint-disable-line no-console
          }
        });
    },
  });

  const onClose = () => {
    setNewHelpTextVisible(false);
    formik.resetForm();
  };

  return (
    <>
      <Button
        variant="success"
        onClick={() => setNewHelpTextVisible(true)}
        style={{ marginBottom: "24px" }}
      >
        Add Help Text
      </Button>
      <ModalContainer open={newHelpTextVisible} onClose={onClose}>
        <h4 style={{ margin: "12px 0 24px 0", color: "var(--main-purple)" }}>
          Add New Help Text
        </h4>
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
              />
            </Grid>
            <Grid item xs={12} sx={{ marginTop: "12px" }}>
              <Button type="submit" variant="success">
                Add Row
              </Button>
            </Grid>
          </Grid>
        </form>
      </ModalContainer>
    </>
  );
};

export default NewHelpText;
