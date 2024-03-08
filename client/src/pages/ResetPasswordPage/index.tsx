import React from "react";
import { Grid, Typography } from "@mui/material";
import ResetPasswordForm from "./ResetPasswordForm";

const ResetPassword = () => {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Grid item md={5}>
        <Typography
          variant="h4"
          sx={{
            marginBottom: (theme) => theme.spacing(5),
            marginTop: (theme) => theme.spacing(5),
          }}
        >
          Set a New Password
        </Typography>
        <ResetPasswordForm />
      </Grid>
    </Grid>
  );
};

export default ResetPassword;
