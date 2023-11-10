import React from "react";
import { TextField, Grid, Button } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";

import { useAuth } from "src/store/auth";

import ModalContainer from "src/components/Modals/ModalContainer";

type UserFields = {
  firstName: string;
  lastName: string;
  email: string;
  usage?: string;
};

type UserT = {
  approved: boolean;
  blocked: boolean;
  email: string;
  firstName: string;
  id: number;
  lastName: string;
  role: string;
  usage?: string;
};

type ProfileModalT = {
  visible: boolean;
  setVisible: (arg: boolean) => void;
  user: Omit<UserT, "password">;
};

const ProfileModal = ({ visible, setVisible, user }: ProfileModalT) => {
  const { updateSessionUser } = useAuth();

  const onClose = () => {
    setVisible(false);
    formik.resetForm();
  };

  const validationSchema = yup.object({
    firstName: yup.string(),
    lastName: yup.string(),
    email: yup.string().email("Enter a valid email"),
    usage: yup.string(),
  });

  const filterChangedValues = (currentValues, initialValues) => {
    const changedValues = {};
    for (const key in currentValues) {
      if (currentValues[key] !== initialValues[key]) {
        changedValues[key] = currentValues[key];
      }
    }
    return changedValues;
  };

  const formik = useFormik({
    initialValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      usage: user.usage,
    },
    validationSchema,
    onSubmit: (values: UserFields) => {
      const changedValues = filterChangedValues(values, formik.initialValues);

      if (Object.keys(changedValues).length > 0) {
        updateSessionUser(user.id, changedValues);
      }
    },
  });

  return (
    <>
      <ModalContainer
        open={visible}
        onClose={onClose}
        title="Update Information"
      >
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={6} sx={{ marginBottom: "12px" }}>
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
            <Grid item xs={12} sx={{ marginBottom: "12px" }}>
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
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                type="submit"
                variant="contained"
                sx={{ height: "36px" }}
                // disabled={!formValuesChanged}
              >
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
