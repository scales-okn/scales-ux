import React, { useState } from "react";
import { TextField, Grid, Button, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useFormik } from "formik";
import * as yup from "yup";

import { useTeam } from "src/store/team";

import ModalContainer from "src/components/Modals/ModalContainer";

type UserFields = {
  teamName: string;
  description: string;
};

const NewTeamModal = () => {
  const [newTeamModalVisible, setNewTeamModalVisible] = useState(false);
  const { createTeam } = useTeam();

  const theme = useTheme();

  const onClose = () => {
    setNewTeamModalVisible(false);
    formik.resetForm();
  };

  const validationSchema = yup.object({
    teamName: yup.string().required("Name is required"),
    description: yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      teamName: "",
      description: "",
    },
    validationSchema,
    onSubmit: (values: UserFields) => {
      const { teamName, description } = values;
      createTeam({ name: teamName, description });
      onClose();
    },
  });

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
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            marginBottom: "48px",
          }}
        >
          <Button
            color="primary"
            variant="contained"
            onClick={() => setNewTeamModalVisible(true)}
          >
            Create Team
          </Button>
        </Grid>
      </Box>
      <ModalContainer open={newTeamModalVisible} onClose={onClose}>
        <Typography
          sx={{
            fontSize: "32px",
            textAlign: "center",
            color: theme.palette.primary.main,
            marginBottom: "36px",
          }}
        >
          Add New Team
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ marginBottom: "6px" }}>
              <TextField
                name="teamName"
                label="Team Name*"
                fullWidth
                {...formik.getFieldProps("teamName")}
                error={
                  formik.touched.teamName && Boolean(formik.errors.teamName)
                }
                helperText={formik.touched.teamName && formik.errors.teamName}
              />
            </Grid>
            <Grid item xs={12} sx={{ marginBottom: "12px" }}>
              <TextField
                name="description"
                label="Description"
                multiline
                rows={4}
                fullWidth
                {...formik.getFieldProps("description")}
                error={
                  formik.touched.description &&
                  Boolean(formik.errors.description)
                }
                helperText={
                  formik.touched.description && formik.errors.description
                }
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

export default NewTeamModal;
