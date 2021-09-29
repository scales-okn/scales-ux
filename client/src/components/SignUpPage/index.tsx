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
  TextareaAutosize,
  Typography,
  FormHelperText,
} from "@material-ui/core";
import useStyles from "./styles";
import Logo from "../Logo";
import Copyright from "../Copyright";
import { UserSignInFields, UserSignInValidationSchema } from "../SignInPage";
import { useSnackbar } from "notistack";

interface UserSignUpFields extends UserSignInFields {
  firstName: string;
  lastName: string;
  usage: string;
  tos: boolean;
}

const UserSignUpValidationSchema = UserSignInValidationSchema.concat(
  yup.object({
    firstName: yup.string().required("First Name is required"),
    lastName: yup.string().required("Last Name is required"),
    usage: yup
      .string()
      .max(255, "Must be maximum 255 characters.")
      .required("Usage Field is required"),
    password: yup
      .string()
      .required()
      .matches(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
        "Password must contain at least 8 characters, one uppercase, one number and one special case character"
      ),
    tos: yup
      .boolean()
      .required("The terms and conditions must be accepted.")
      .oneOf([true], "The terms and conditions must be accepted."),
  })
);

const SignUpPage: FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      usage: "",
      tos: false,
    },
    validationSchema: UserSignUpValidationSchema,
    onSubmit: (values: UserSignUpFields, { setErrors }) => {
      fetch(`${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
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
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="fname"
                name="firstName"
                variant="outlined"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={
                  formik.touched.firstName && Boolean(formik.errors.firstName)
                }
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="lname"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={
                  formik.touched.lastName && Boolean(formik.errors.lastName)
                }
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Grid>
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
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
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
                multiline
                rows={1}
                rowsMax={4}
                variant="outlined"
                required
                fullWidth
                id="usage"
                label="Account Usage"
                name="usage"
                value={formik.values.usage}
                onChange={formik.handleChange}
                error={formik.touched.usage && Boolean(formik.errors.usage)}
                helperText={formik.touched.usage && formik.errors.usage}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    value="tos"
                    color="primary"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      formik.setFieldValue("tos", event.target.checked)
                    }
                    required
                  />
                }
                label="I agree with the TOS."
              />
              {formik.touched.tos && formik.errors.tos && (
                <FormHelperText className={classes.error}>
                  {formik.errors.tos}
                </FormHelperText>
              )}
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign Up
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link href="/sign-in" variant="body2">
                Already have an account? Sign in
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

export default SignUpPage;
