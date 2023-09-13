import React, { FunctionComponent, useEffect, useState } from "react";
import * as yup from "yup";
import {
  Container,
  Typography,
  TextField,
  Grid,
  FormControlLabel,
  Button,
  Checkbox,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { authSelector, login } from "src/store/auth";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";

import { signInPageStyles } from "./styles";

export interface UserSignInFields {
  email: string;
  password: string;
}

export const UserSignInValidationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

const SignInPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { user, errors } = useSelector(authSelector);
  const dispatch = useDispatch();
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: UserSignInValidationSchema,
    onSubmit: async (values: UserSignInFields, { setErrors }) => {
      dispatch(login(values.email, values.password, rememberMe));
      if (errors) {
        setErrors(errors);
      }
    },
  });

  return (
    <Container className={`signInPageStyles ${signInPageStyles}`}>
      <Grid container className="gridRow">
        <Grid item lg={6} xs={10}>
          <Typography
            variant="h6"
            style={{
              color: "crimson",
              fontStyle: "italic",
              marginBottom: "16px",
            }}
          >
            This Application is currently in beta development. Official launch
            scheduled for fall 2023.
          </Typography>
          <form noValidate onSubmit={formik.handleSubmit}>
            <div
              className="form-floating"
              style={{ marginTop: "50px", marginBottom: "16px" }}
            >
              <TextField
                fullWidth
                type="email"
                name="email"
                label="Email address"
                variant="outlined"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors?.email)}
                helperText={formik.touched.email && formik.errors?.email}
                className="input"
              />
            </div>
            <div className="form-floating mb-3">
              <TextField
                fullWidth
                type="password"
                name="password"
                label="Password"
                variant="outlined"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={
                  formik.touched.password && Boolean(formik.errors?.password)
                }
                helperText={formik.touched.password && formik.errors?.password}
                className="input"
              />
            </div>

            <div className="buttonRow">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    name="rememberMe"
                    color="primary"
                  />
                }
                label="Remember Me"
                className="text-start"
              />
              <Button
                color="success"
                variant="contained"
                size="medium"
                type="submit"
              >
                Sign in
              </Button>
            </div>
            <Grid container justifyContent="space-between" className="mb-5">
              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  component="a"
                  href="/forgot-password"
                  style={{ color: "var(--details-blue)" }}
                >
                  Forgot password?
                </Typography>
              </Grid>
              <Grid item xs={6} style={{ textAlign: "end" }}>
                <Typography
                  variant="body2"
                  component="a"
                  href="/sign-up"
                  style={{ color: "var(--details-blue)" }}
                >
                  {`Don't have an account? Sign Up`}
                </Typography>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SignInPage;
