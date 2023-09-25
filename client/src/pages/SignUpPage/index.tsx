import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useFormik } from "formik";

import {
  Container,
  Typography,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  Box,
  Button,
} from "@mui/material";

import useEscapeKeyListener from "src/hooks/useEscapeKeyListener";
import { makeRequest } from "src/helpers/makeRequest";

import Loader from "src/components/Loader";
import { UserSignInFields } from "../SignInPage";
import { UserSignUpValidationSchema } from "./schema";
import { signUpPageStyles } from "./styles";

interface UserSignUpFields extends UserSignInFields {
  firstName: string;
  lastName: string;
  usage: string;
  tos: boolean;
}

const SignUpPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEscapeKeyListener(() => {
    navigate("/sign-in");
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      usage: "",
      tos: true,
    },
    validationSchema: UserSignUpValidationSchema,
    onSubmit: async (values: UserSignUpFields, { setErrors }) => {
      setIsLoading(true);

      const response = await makeRequest.post(`/api/users/create`, values);

      if (response.status === "OK") {
        setIsLoading(false);
        setMessage(response.message);
      } else {
        setIsLoading(false);
        if (response.errors) {
          setErrors(response.errors);
        }
      }
    },
  });

  return (
    <Container className={`signUpPageStyles ${signUpPageStyles}`}>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        className="gridRow"
      >
        <Grid item md={7}>
          <Typography variant="h4" className="mb-3 fw-normal">
            {message
              ? "Registered Successfully"
              : "Please register for beta access"}
          </Typography>
          {message ? (
            <img
              src="https://scales-okn.org/wp-content/uploads/2021/02/PreLoader.png"
              height="50px"
              width="50px"
              alt="scales-logo"
              style={{ marginBottom: "24px" }}
            />
          ) : (
            <Typography
              variant="h6"
              className="mb-5"
              style={{ color: "crimson", fontStyle: "italic" }}
            >
              This Application is currently in beta development. Official launch
              scheduled for Fall 2023.
            </Typography>
          )}

          <Loader isVisible={isLoading}>
            {message ? (
              <Typography variant="body1">{message}</Typography>
            ) : (
              <form noValidate onSubmit={formik.handleSubmit}>
                <Grid container spacing={2} sx={{ marginBottom: "16px" }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="text"
                      name="firstName"
                      label="First Name"
                      variant="outlined"
                      fullWidth
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.firstName &&
                        Boolean(formik.errors?.firstName)
                      }
                      helperText={
                        formik.touched.firstName && formik.errors?.firstName
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="text"
                      name="lastName"
                      label="Last Name"
                      variant="outlined"
                      fullWidth
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.lastName &&
                        Boolean(formik.errors?.lastName)
                      }
                      helperText={
                        formik.touched.lastName && formik.errors?.lastName
                      }
                    />
                  </Grid>
                </Grid>

                <TextField
                  type="email"
                  name="email"
                  label="Email address"
                  variant="outlined"
                  fullWidth
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors?.email)}
                  helperText={formik.touched.email && formik.errors?.email}
                  sx={{ marginBottom: "16px" }}
                />
                <TextField
                  type="password"
                  name="password"
                  label="Password"
                  variant="outlined"
                  fullWidth
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.password && Boolean(formik.errors?.password)
                  }
                  helperText={
                    formik.touched.password && formik.errors?.password
                  }
                  sx={{ marginBottom: "16px" }}
                />
                <TextField
                  type="text"
                  name="usage"
                  label="Account Usage"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  value={formik.values.usage}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.usage && Boolean(formik.errors?.usage)}
                  helperText={formik.touched.usage && formik.errors?.usage}
                />
                {formik.touched.tos && formik.errors.tos && (
                  <Typography
                    variant="body2"
                    color="error"
                    className="float-start mb-3"
                  >
                    {formik.errors.tos}
                  </Typography>
                )}
                <div className="buttonRow">
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="tos"
                        checked={formik.values.tos}
                        onChange={formik.handleChange}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        Accept{" "}
                        <a
                          href="https://docs.google.com/document/d/1Bdta3CTuS0hKoDdWQoO_FdVOELHfnVGs4rjSq0531TQ/edit"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "rgb(33, 37, 41)" }}
                        >
                          Terms of Service
                        </a>
                      </Box>
                    }
                    className="tos"
                  />
                  <Button
                    type="submit"
                    size="large"
                    color="success"
                    variant="contained"
                  >
                    Register
                  </Button>
                </div>

                <Grid container className="mb-5">
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" className="text-start">
                      <a
                        href="/sign-in"
                        style={{ color: "var(--details-blue)" }}
                      >
                        Already have an account? Sign in
                      </a>
                    </Typography>
                  </Grid>
                </Grid>
              </form>
            )}
          </Loader>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SignUpPage;
