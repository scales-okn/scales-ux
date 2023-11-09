import React from "react";
import { Grid, Typography } from "@mui/material";
import ResetPasswordForm from "./ResetPasswordForm";

const ResetPassword = () => {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      className="h-100 text-center"
    >
      <Grid item md={5}>
        <Typography variant="h4" className="mb-5 mt-5">
          Set a New Password
        </Typography>
        <ResetPasswordForm />
      </Grid>
    </Grid>
  );
};

export default ResetPassword;
