import React, { FunctionComponent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";

import { Container, Typography, TextField, Grid } from "@mui/material";

import { makeRequest } from "src/helpers/makeRequest";

import { useNotify } from "src/components/Notifications";
import { Button } from "@mui/material";
interface ResetPasswordFields {
  password: string;
  repassword: string;
}

const ResetPasswordValidationSchema = yup.object({
  password: yup
    .string()
    .required()
    .matches(
      /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
      "Password must contain at least 8 characters, one uppercase, one number, and one special character",
    ),
  repassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

const ResetPassword: FunctionComponent = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const { token } = useParams();

  const formik = useFormik({
    initialValues: {
      password: "",
      repassword: "",
    },
    validationSchema: ResetPasswordValidationSchema,
    onSubmit: async (values: ResetPasswordFields, { setErrors }) => {
      try {
        const response = await makeRequest.post(`/api/users/password/reset`, {
          ...values,
          token,
        });

        if (response.status === "OK") {
          notify(response.message, "success");
          setTimeout(() => {
            navigate("/sign-in");
          }, 1000);
        } else {
          if (response.errors) {
            setErrors(response.errors);
          }
          notify(response.message, "error");
        }
      } catch (error) {
        console.error(error);
        notify("An error occurred", "error");
      }
    },
  });

  return (
    <Container className="h-100">
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        className="h-100 text-center"
      >
        <Grid item md={5}>
          <form noValidate onSubmit={formik.handleSubmit}>
            <Typography variant="h4" className="mb-5 mt-5">
              Set a New Password
            </Typography>
            <TextField
              type="password"
              name="password"
              label="Password"
              variant="outlined"
              fullWidth
              value={formik.values.password}
              onChange={formik.handleChange}
              error={
                formik.touched.password && Boolean(formik.errors?.password)
              }
              helperText={formik.touched.password && formik.errors?.password}
              sx={{ marginBottom: "12px", background: "white" }}
            />
            <TextField
              type="password"
              name="repassword"
              label="Confirm Password"
              variant="outlined"
              fullWidth
              value={formik.values.repassword}
              onChange={formik.handleChange}
              error={
                formik.touched.repassword && Boolean(formik.errors?.repassword)
              }
              helperText={
                formik.touched.repassword && formik.errors?.repassword
              }
              sx={{ marginBottom: "24px", background: "white" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button color="primary" variant="contained">
                Reset Password
              </Button>
            </div>
          </form>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ResetPassword;
