import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import * as yup from "yup";
import {
  Typography,
  TextField,
  Grid,
  FormControlLabel,
  Button,
  Checkbox,
  Box,
} from "@mui/material";
import { useFormik } from "formik";
import queryString from "query-string";

import { authSelector, login } from "src/store/auth";

import { useTheme } from "@mui/material/styles";
import colorVars from "src/styles/colorVars";

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

const SignInPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, errors } = useSelector(authSelector);
  const dispatch = useDispatch();
  const [rememberMe, setRememberMe] = useState(false);

  const location = useLocation();
  const search = queryString.parse(location.search);

  useEffect(() => {
    if (user) {
      if (search.alr) {
        navigate(search.alr.toString());
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]); // eslint-disable-line

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
    <Box
      sx={{
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
        marginTop: "200px",
        backgroundColor: "white",
        padding: "32px",
        borderRadius: "4px",
      }}
    >
      <Typography
        sx={{
          fontSize: "32px",
          textAlign: "center",
          marginBottom: "24px",
          color: theme.palette.primary.main,
        }}
      >
        Sign In
      </Typography>
      <Box sx={{ maxWidth: "700px", margin: "0 auto" }}>
        <form noValidate onSubmit={formik.handleSubmit}>
          <Box
            sx={{
              marginBottom: "16px",
            }}
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
          </Box>
          <Box
            sx={{
              position: "relative",
              marginBottom: "1rem",
            }}
          >
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
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "32px",
              marginTop: "24px",
            }}
          >
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
              color="primary"
              variant="contained"
              size="medium"
              type="submit"
            >
              Sign in
            </Button>
          </Box>
          <Grid
            container
            justifyContent="space-between"
            sx={{
              marginBottom: (theme) => theme.spacing(5),
            }}
          >
            <Grid item xs={6}>
              <Typography
                variant="body2"
                component="a"
                href="/forgot-password"
                sx={{ color: colorVars.detailsBlue }}
              >
                Forgot password?
              </Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: "end" }}>
              <Typography
                variant="body2"
                component="a"
                href="/sign-up"
                sx={{ color: colorVars.detailsBlue }}
              >
                {`Don't have an account? Sign Up`}
              </Typography>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default SignInPage;
