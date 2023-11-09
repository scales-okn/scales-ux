import React, { useState, useEffect } from "react";
import { TextField, Grid, Button, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useFormik } from "formik";
import * as yup from "yup";

import { useUser } from "src/store/user";

import { generateRandomPassword } from "src/helpers/generateRandomPassword";

import ModalContainer from "src/components/Modals/ModalContainer";

type UserFields = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const NewUser = () => {
  const { createUserAsAdmin } = useUser();

  const [newUserModalVisible, setNewUserModalVisible] = useState(false);

  const theme = useTheme();

  const onClose = () => {
    setNewUserModalVisible(false);
    formik.resetForm();
  };

  const validationSchema = yup.object({
    firstName: yup.string().required("First Name is required"),
    lastName: yup.string().required("Last Name is required"),
    email: yup
      .string()
      .email("Enter a valid email")
      .required("Email is required"),
    password: yup
      .string()
      .required("Password is required")
      .matches(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
        "Password must contain at least 8 characters, one uppercase, one number and one special case character",
      ),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values: UserFields) => {
      createUserAsAdmin({ ...values, usage: "Research" });
      onClose();
    },
  });

  const setRandomPassword = () => {
    formik.setFieldValue("password", generateRandomPassword());
  };

  useEffect(() => {
    if (newUserModalVisible) {
      setRandomPassword();
    }
  }, [newUserModalVisible]);

  return (
    <>
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{
            alignItems: "center",
            justifyContent: "flex-end",
            marginBottom: "24px",
          }}
        >
          <Button
            color="primary"
            variant="contained"
            onClick={() => setNewUserModalVisible(true)}
          >
            Add User
          </Button>
        </Grid>
      </Box>
      <ModalContainer open={newUserModalVisible} onClose={onClose}>
        <Typography
          sx={{
            fontSize: "32px",
            textAlign: "center",
            marginBottom: "24px",
            color: theme.palette.primary.main,
          }}
        >
          Add New User
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                name="firstName"
                label="First Name*"
                fullWidth
                {...formik.getFieldProps("firstName")}
                error={
                  formik.touched.firstName && Boolean(formik.errors.firstName)
                }
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="lastName"
                label="Last Name*"
                multiline
                fullWidth
                {...formik.getFieldProps("lastName")}
                error={
                  formik.touched.lastName && Boolean(formik.errors.lastName)
                }
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email*"
                multiline
                fullWidth
                {...formik.getFieldProps("email")}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="password"
                label="Password*"
                multiline
                fullWidth
                {...formik.getFieldProps("password")}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
                placeholder="Password"
              />
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "6px !important",
              }}
            >
              <Button onClick={setRandomPassword} sx={{ fontSize: "12px" }}>
                Regenerate Password
              </Button>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                marginTop: "12px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button type="submit" variant="contained" sx={{ height: "36px" }}>
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </ModalContainer>
    </>
  );
};

export default NewUser;
