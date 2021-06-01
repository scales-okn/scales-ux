import React, { useState, FunctionComponent, SyntheticEvent } from "react";
import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { useSignIn } from "react-auth-kit";
import jwt_decode from "jwt-decode";
import {
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Box,
  Typography,
  Container,
} from "@material-ui/core";
import Copyright from "../Copyright";
import Logo from "../Logo";
import useStyles from "./styles";

export interface UserSignInFields {
  email: string;
  password: string;
}

export interface DecodedToken {
  iat: number;
  exp: number;
  id: number;
  role: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const UserSignInValidationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

const SignInPage: FunctionComponent = () => {
  const history = useHistory();
  const classes = useStyles();
  const signIn = useSignIn();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: UserSignInValidationSchema,
    onSubmit: (values: UserSignInFields) => {
      fetch(`${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
        .then((response) => response.json())
        .then((response) => {
          try {
            if (response.code === 200) {
              const decodedToken: DecodedToken = jwt_decode(
                response.data.token
              );
              const {
                exp,
                id,
                email,
                role,
                firstName,
                lastName,
                blocked,
                approved,
              } = decodedToken;
              if (
                signIn({
                  token: response.data.token,
                  expiresIn: exp,
                  tokenType: "Bearer",
                  authState: {
                    user: {
                      id,
                      role,
                      email,
                      firstName,
                      lastName,
                      blocked,
                      approved,
                    },
                  },
                })
              ) {
                history.push("/");
              } else {
                console.log("JWT Failed!");
              }
            }
          } catch (error) {
            console.log(error);
          }
        });
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Logo />
        <Typography component="h3" variant="h5">
          Sign in
        </Typography>
        <form
          className={classes.form}
          onSubmit={formik.handleSubmit}
          noValidate
        >
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="/sign-up" variant="body2">
                {`Don't have an account? Sign Up`}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
};

export default SignInPage;
