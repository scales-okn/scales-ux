import React, { ChangeEvent, FunctionComponent } from "react";
import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  CssBaseline,
  FormControlLabel,
  Grid,
  Link,
  TextField,
  Typography,
  FormHelperText,
} from "@material-ui/core";
import useStyles from "./styles";
import Logo from "../Logo";
import Copyright from "../Copyright";
import { useSnackbar } from "notistack";

interface ForgotPasswordFields {
  email: string;
}

const ForgotPasswordValidationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
});

const ForgotPassword: FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: ForgotPasswordValidationSchema,
    onSubmit: (values: ForgotPasswordFields, { setErrors }) => {
      fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/users/password/forgot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
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
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
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

export default ForgotPassword;
