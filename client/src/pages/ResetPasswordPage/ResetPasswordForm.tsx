import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";

import { Box, TextField } from "@mui/material";

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

type ResetPasswordFormT = {
  sessionUserId?: number;
};

const ResetPasswordForm = ({ sessionUserId = null }: ResetPasswordFormT) => {
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
          ...(sessionUserId ? { sessionUserId } : {}),
        });

        if (response.status === "OK") {
          notify(response.message, "success");
          if (!sessionUserId) {
            setTimeout(() => {
              navigate("/sign-in");
            }, 1000);
          }
        } else {
          if (response.errors) {
            setErrors(response.errors);
          }
          notify(response.message, "error");
        }
      } catch (error) {
        console.error(error); // eslint-disable-line no-console
        notify("An error occurred", "error");
      }
    },
  });

  return (
    <form noValidate onSubmit={formik.handleSubmit}>
      <TextField
        type="password"
        name="password"
        label="Password"
        variant="outlined"
        fullWidth
        value={formik.values.password}
        onChange={formik.handleChange}
        error={formik.touched.password && Boolean(formik.errors?.password)}
        helperText={formik.touched.password && formik.errors?.password}
        sx={{ marginBottom: "24px", background: "white" }}
      />
      <TextField
        type="password"
        name="repassword"
        label="Confirm Password"
        variant="outlined"
        fullWidth
        value={formik.values.repassword}
        onChange={formik.handleChange}
        error={formik.touched.repassword && Boolean(formik.errors?.repassword)}
        helperText={formik.touched.repassword && formik.errors?.repassword}
        sx={{ marginBottom: "36px", background: "white" }}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button color="primary" variant="contained" type="submit">
          Reset Password
        </Button>
      </Box>
    </form>
  );
};

export default ResetPasswordForm;
