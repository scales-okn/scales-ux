import React from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Link,
} from "@mui/material";
import { useNotify } from "src/components/Notifications";
import { makeRequest } from "src/helpers/makeRequest";

interface ForgotPasswordFields {
  email: string;
}

const ForgotPasswordValidationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: ForgotPasswordValidationSchema,
    onSubmit: async (values: ForgotPasswordFields) => {
      try {
        const response = await makeRequest.post(
          `/api/users/password/forgot`,
          values,
        );

        if (response.status === "OK") {
          notify(response.message, "success");
          navigate("/sign-in");
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
    <Container className="h-100">
      <Grid
        container
        className="h-100 justify-content-center align-items-center text-center"
      >
        <Grid item xs={12} md={5}>
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Typography sx={{ fontSize: "24px", margin: "100px 0 24px 0" }}>
              Forgot Password?
            </Typography>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email address"
              variant="outlined"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors?.email)}
              helperText={formik.touched.email && formik.errors?.email}
              sx={{ marginBottom: "24px", background: "white" }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Link
                href="/sign-in"
                className="small"
                style={{ color: "var(--details-blue)" }}
              >
                Already have an account? Sign in
              </Link>
              <Button color="info" variant="contained">
                Submit
              </Button>
            </div>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ForgotPassword;
