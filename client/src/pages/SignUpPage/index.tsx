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
import { useTheme } from "@mui/material/styles";

import useEscapeKeyListener from "src/hooks/useEscapeKeyListener";
import { makeRequest } from "src/helpers/makeRequest";

import Loader from "src/components/Loader";
import { UserSignInFields } from "../SignInPage";
import { UserSignUpValidationSchema } from "./schema";
import colorVars from "src/styles/colorVars";

interface UserSignUpFields extends UserSignInFields {
  firstName: string;
  lastName: string;
  usage: string;
  tos: boolean;
  passwordConfirmation: string;
}

const SignUpPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const theme = useTheme();
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
      passwordConfirmation: "",
      usage: "",
      tos: true,
    },
    validationSchema: UserSignUpValidationSchema,
    onSubmit: async (values: UserSignUpFields, { setErrors }) => {
      setIsLoading(true);

      if (values.password !== values.passwordConfirmation) {
        setErrors({ passwordConfirmation: "Passwords do not match" });
        return;
      }

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
    <Box
      sx={{
        paddingTop: "30px",
        backgroundColor: "white",
        padding: "32px",
        borderRadius: "4px",
        maxWidth: "700px",
        width: "100%",
        margin: "0 auto",

        "& .MuiInputBase-root": {
          background: "white",
        },
      }}
    >
      <Box
        justifyContent="center"
        alignItems="center"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "20px",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "32px",
            textAlign: "center",
            marginBottom: "48px",
            color: theme.palette.primary.main,
          }}
        >
          {message ? "Registered Successfully" : "Please Register for Access"}
        </Typography>
        {message ? (
          <img
            src="https://scales-okn.org/wp-content/uploads/2021/02/PreLoader.png"
            height="50px"
            width="50px"
            alt="scales-logo"
            style={{ marginBottom: "24px" }}
          />
        ) : null}

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
                helperText={formik.touched.password && formik.errors?.password}
                sx={{ marginBottom: "16px" }}
              />
              <TextField
                type="password"
                name="passwordConfirmation" // Name should match the field name in initialValues
                label="Confirm Password" // Change label
                variant="outlined"
                fullWidth
                value={formik.values.passwordConfirmation} // Use passwordConfirmation value
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.passwordConfirmation &&
                  Boolean(formik.errors?.passwordConfirmation) // Update error handling
                }
                helperText={
                  formik.touched.passwordConfirmation &&
                  formik.errors?.passwordConfirmation // Update error handling
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
                rows={4}
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
                  sx={{
                    float: "left",
                    mb: 3,
                  }}
                >
                  {formik.errors.tos}
                </Typography>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "18px",
                  marginTop: "48px",

                  "& .tos": {
                    marginBottom: "0",
                  },
                }}
              >
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
                  color="primary"
                  variant="contained"
                >
                  Register
                </Button>
              </Box>

              <Typography variant="body2" sx={{ marginTop: "44px" }}>
                <a href="/sign-in" style={{ color: colorVars.detailsBlue }}>
                  Already have an account? Sign in
                </a>
              </Typography>
            </form>
          )}
        </Loader>
      </Box>
    </Box>
  );
};

export default SignUpPage;
