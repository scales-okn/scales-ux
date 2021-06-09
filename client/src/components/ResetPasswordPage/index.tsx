import React, { FunctionComponent } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Grid,
  Link,
  TextField,
  Typography,
} from "@material-ui/core";
import useStyles from "../ForgotPasswordPage/styles";
import Logo from "../Logo";
import Copyright from "../Copyright";
import { useSnackbar } from "notistack";

interface ResetPasswordFields {
  password: string;
  repassword: string;
}

interface ParamTypes {
  token: string;
}

const ResetPasswordValidationSchema = yup.object({
  password: yup
    .string()
    .required()
    .matches(
      /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
      "Password must contain at least 8 characters, one uppercase, one number and one special case character"
    ),
  repassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

const ResetPassword: FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const { token } = useParams<ParamTypes>();

  const formik = useFormik({
    initialValues: {
      password: "",
      repassword: "",
    },
    validationSchema: ResetPasswordValidationSchema,
    onSubmit: (values: ResetPasswordFields, { setErrors }) => {
      fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/users/password/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...values, token }),
        }
      )
        .then((response) => response.json())
        .then((response) => {
          try {
            switch (response.code) {
              case 200: {
                enqueueSnackbar(response.message, {
                  variant: "success",
                  anchorOrigin: {
                    vertical: "top",
                    horizontal: "center",
                  },
                });
                history.push("/sign-in");
                break;
              }
              default: {
                if (response.errors) {
                  setErrors(response.errors);
                }
                enqueueSnackbar(response.message, {
                  variant: "warning",
                  anchorOrigin: {
                    vertical: "top",
                    horizontal: "center",
                  },
                });
                break;
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
        <Typography component="h1" variant="h5" className="mt-5">
          Sign up
        </Typography>
        <form
          className={classes.form}
          onSubmit={formik.handleSubmit}
          noValidate
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="repassword"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="repassword"
                label="Confirm Password"
                type="password"
                id="repassword"
                value={formik.values.repassword}
                onChange={formik.handleChange}
                error={
                  formik.touched.repassword && Boolean(formik.errors.repassword)
                }
                helperText={
                  formik.touched.repassword && formik.errors.repassword
                }
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Reset Password
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link href="/sign-in" variant="body2">
                Sign in
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
};

export default ResetPassword;
