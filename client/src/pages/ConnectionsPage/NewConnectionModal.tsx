import React, { useState } from "react";
import { TextField, Grid, Button, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useFormik } from "formik";
import * as yup from "yup";

import { useConnection } from "src/store/connection";
import { useSessionUser } from "src/store/auth";

import ModalContainer from "src/components/Modals/ModalContainer";

type UserFields = {
  email: string;
  note: string;
};

const NewConnectionModal = () => {
  const [newUserModalVisible, setNewUserModalVisible] = useState(false);
  const { createConnection, connections } = useConnection();

  const invalidEmails = connections.reduce((acc, connection) => {
    if (!acc.includes(connection.receiverUser.email)) {
      acc.push(connection.receiverUser.email);
    }
    if (!acc.includes(connection.senderUser.email)) {
      acc.push(connection.senderUser.email);
    }
    return acc;
  }, []);

  const { id: sessionUserId, email } = useSessionUser();

  const theme = useTheme();

  const onClose = () => {
    setNewUserModalVisible(false);
    formik.resetForm();
  };

  const validationSchema = yup.object({
    email: yup
      .string()
      .email("Enter a valid email")
      .required("Email is required")
      .test(
        "is-not-invalid-email",
        "Email must not be a duplicate of an existing connection or your own",
        (value) => ![...invalidEmails, email].includes(value),
      ),
    note: yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      note: "",
    },
    validationSchema,
    onSubmit: (values: UserFields) => {
      const { email, note } = values;
      createConnection({ email, note, senderId: sessionUserId });
      onClose();
    },
  });

  return (
    <>
      <Box
        sx={{
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
            Add Connection
          </Button>
        </Grid>
      </Box>
      <ModalContainer
        open={newUserModalVisible}
        onClose={onClose}
        title="Add New Connection"
        subtitle="Enter a user's email to request a connection. They will receive an email with a link to accept the request."
      >
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
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
                name="note"
                label="Note (Optional)"
                multiline
                fullWidth
                {...formik.getFieldProps("note")}
                error={formik.touched.note && Boolean(formik.errors.note)}
                helperText={formik.touched.note && formik.errors.note}
              />
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

export default NewConnectionModal;
