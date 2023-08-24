import React, { useState } from "react";
import { Modal, TextField, Grid, Paper } from "@mui/material";
import { Button } from "react-bootstrap";
import { useFormik } from "formik";
import { useAuthHeader } from "store/auth";
import * as yup from "yup";

type HelpTextFields = {
  description: string;
  examples: string;
  options: string;
  links: string;
};

const NewHelpText = () => {
  const authorizationHeader = useAuthHeader();

  const [newHelpTextVisible, setNewHelpTextVisible] = useState(false);

  const validationSchema = yup.object({
    description: yup.string().required("Description is required"),
    examples: yup.string().required("Examples are required"),
    options: yup.string().required("Options are required"),
    links: yup.string().required("Links are required"),
  });

  const formik = useFormik({
    initialValues: {
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
  };

  return (
    <>
      <Button variant="primary" onClick={() => setNewHelpTextVisible(true)}>
        Add Help Text
      </Button>
      <Modal
        open={newHelpTextVisible}
        onClose={onClose}
        sx={{ "& .MuiPaper-root": { margin: "15% auto" } }}
      >
        <Paper sx={{ padding: "24px", maxWidth: 400 }}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
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
                  fullWidth
                  {...formik.getFieldProps("options")}
                  error={
                    formik.touched.options && Boolean(formik.errors.options)
                  }
                  helperText={formik.touched.options && formik.errors.options}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="links"
                  label="Links"
                  fullWidth
                  {...formik.getFieldProps("links")}
                  error={formik.touched.links && Boolean(formik.errors.links)}
                  helperText={formik.touched.links && formik.errors.links}
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="primary">
                  Add Row
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Modal>
    </>
  );
};

export default NewHelpText;
