import React, { useEffect } from "react";
import { TextField, Grid, Button, Typography } from "@mui/material";
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
  // password: string;
  // usage: string;
};

type UserT = {
  approved: boolean;
  blocked: boolean;
  email: string;
  firstName: string;
  id: number;
  lastName: string;
  role: string;
};

type ProfileModalT = {
  visible: boolean;
  setVisible: (arg: boolean) => void;
  user: Omit<UserT, "password">;
};

const ProfileModal = ({ visible, setVisible, user }: ProfileModalT) => {
  const { updateUser } = useUser();

  const theme = useTheme();

  const onClose = () => {
    setVisible(false);
    formik.resetForm();
  };

  const validationSchema = yup.object({
    firstName: yup.string(),
    lastName: yup.string(),
    email: yup.string().email("Enter a valid email"),
    // password: yup
    //   .string()
    //   .matches(
    //     /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
    //     "Password must contain at least 8 characters, one uppercase, one number and one special case character",
    //   ),
  });

  const formik = useFormik({
    initialValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      // password: "",
    },
    validationSchema,
    onSubmit: (values: UserFields) => {
      updateUser(user.id, values);
      onClose();
    },
  });

  const setRandomPassword = () => {
    formik.setFieldValue("password", generateRandomPassword());
  };

  useEffect(() => {
    if (visible) {
      setRandomPassword();
    }
  }, [visible]);

  return (
    <>
      <ModalContainer open={visible} onClose={onClose}>
        <Typography
          sx={{
            fontSize: "32px",
            textAlign: "center",
            marginBottom: "48px",
            color: theme.palette.primary.main,
          }}
        >
          Update Information
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
            {/* <Grid item xs={12}>
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
            </Grid> */}
            {/* <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "6px !important",
              }}
            >
              <Button onClick={setRandomPassword} sx={{ fontSize: "12px" }}>
                Generate Secure Password
              </Button>
            </Grid> */}
            {/* <Grid item xs={12}>
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
            </Grid> */}
            <Grid
              item
              xs={12}
              sx={{
                marginTop: "24px",
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

export default ProfileModal;
