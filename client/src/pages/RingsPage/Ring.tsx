import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "src/store/auth";
import {
  Container,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";

import { useFormik } from "formik";
import * as yup from "yup";

import Loader from "src/components/Loader";
import { useNotify } from "src/components/Notifications";
import { useRing } from "src/store/rings";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import Editor from "src/components/Editor";
import BackButton from "src/components/Buttons/BackButton";
import "./jsoneditor-react-dark-mode.css";
import { makeRequest } from "src/helpers/makeRequest";

type Params = {
  ringId: string | null;
};

const Ring: React.FC = () => {
  const { ringId = null } = useParams<Params>();
  const { ring } = useRing(Number(ringId));
  const [loading, setLoading] = useState(false);
  const user = useUser();
  const { notify } = useNotify();
  const navigate = useNavigate();

  const [confirmVisible, setConfirmVisible] = useState(false);

  const formik = useFormik({
    initialValues: {
      rid: "",
      name: "",
      description: "",
      version: 1.0,
      schemaVersion: 1.0,
      dataSource: {},
      ontology: {},
      visibility: "public",
      userId: user.id,
      ...ring,
    },
    validationSchema: yup.object({
      rid: yup.string().required("RID is required"),
      name: yup.string().required("Name is required"),
      description: yup.string().required("Description is required"),
      version: yup.number().required("Version is required"),
      schemaVersion: yup.number().required("Schema version is required"),
      dataSource: yup.object().required("Data source is required"),
      ontology: yup.object().required("Ontology is required"),
      visibility: yup.string().required("Visibility is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      let response;
      if (ringId) {
        response = await makeRequest.put(`/api/rings/${ringId}`, values);
      } else {
        response = await makeRequest.post(`/api/rings/create`, values);
      }

      if (response?.code === 200) {
        notify(response.message, "success");
        navigate("/admin/rings");
      }
    },
  });

  const deleteRing = async (rid) => {
    setLoading(true);
    const response = await makeRequest.delete(`/api/rings/${rid}`);

    if (response?.code === 200) {
      notify(response.message, "success");
      navigate("/admin/rings");
    } else {
      notify(response.message, "error");
    }

    setLoading(false);
  };

  const sanitizeData = (data) => {
    let output = {};

    if (typeof data === "string") {
      output = JSON.parse(data);
    }

    if (typeof data === "object") {
      output = data;
    }

    return output;
  };

  return (
    <>
      <BackButton onClick={() => navigate("/admin/rings")} />

      <Container sx={{ padding: "86px 0" }}>
        <Loader isVisible={loading}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12}>
                <Typography variant="h5" mb={3}>
                  {ring ? "Edit Ring" : "Create Ring"}
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "flex-end" }}
              >
                {ring && (
                  <Button
                    variant="contained"
                    color="error"
                    type="button"
                    onClick={() => setConfirmVisible(true)}
                    sx={{ marginRight: "12px" }}
                  >
                    Delete Ring
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  sx={{
                    background: "var(--sea-green)",
                    "&:hover": {
                      backgroundColor: "var(--sea-green-highlight)",
                    },
                  }}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  sx={{ background: "white", marginBottom: "24px" }}
                  fullWidth
                  id="formName"
                  label="Name"
                  name="name"
                  variant="outlined"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.name && formik.errors.name ? (
                  <Typography variant="body2" color="error">
                    {formik.errors.name}
                  </Typography>
                ) : null}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  sx={{ background: "white", marginBottom: "24px" }}
                  fullWidth
                  id="formRID"
                  label="RID"
                  name="rid"
                  variant="outlined"
                  value={formik.values.rid}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.rid && formik.errors.rid ? (
                  <Typography variant="body2" color="error">
                    {formik.errors.rid}
                  </Typography>
                ) : null}
              </Grid>
            </Grid>
            <TextField
              sx={{ background: "white", marginBottom: "24px" }}
              fullWidth
              id="formDescription"
              label="Description"
              name="description"
              variant="outlined"
              multiline
              rows={3}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.description && formik.errors.description ? (
              <Typography variant="body2" color="error">
                {formik.errors.description}
              </Typography>
            ) : null}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  sx={{ background: "white", marginBottom: "24px" }}
                  fullWidth
                  id="formVersion"
                  label="Version"
                  name="version"
                  variant="outlined"
                  type="number"
                  value={formik.values.version}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.version && formik.errors.version ? (
                  <Typography variant="body2" color="error">
                    {formik.errors.version}
                  </Typography>
                ) : null}
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  sx={{ background: "white", marginBottom: "24px" }}
                  fullWidth
                  id="formSchemaVersion"
                  label="Schema Version"
                  name="schemaVersion"
                  variant="outlined"
                  type="number"
                  value={formik.values.schemaVersion}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.schemaVersion && formik.errors.schemaVersion ? (
                  <Typography variant="body2" color="error">
                    {formik.errors.schemaVersion}
                  </Typography>
                ) : null}
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  sx={{ background: "white", marginBottom: "24px" }}
                  fullWidth
                  id="formVisibility"
                  label="Visibility"
                  name="visibility"
                  variant="outlined"
                  select
                  value={formik.values.visibility}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </TextField>
                {formik.touched.visibility && formik.errors.visibility ? (
                  <Typography variant="body2" color="error">
                    {formik.errors.visibility}
                  </Typography>
                ) : null}
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" mb={2}>
                  Data Source
                </Typography>
                <Editor
                  mode="tree"
                  allowedModes={["code", "tree"]}
                  value={sanitizeData(formik.values.dataSource)}
                  onChange={(jsObject) => {
                    try {
                      formik.setFieldValue("dataSource", jsObject);
                    } catch (error) {
                      console.warn(error); // eslint-disable-line no-console
                    }
                  }}
                />
                {formik.touched.dataSource && formik.errors.dataSource ? (
                  <Typography variant="body2" color="error">
                    {formik.errors.dataSource as string}
                  </Typography>
                ) : null}
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" mb={2}>
                  Ontology
                </Typography>
                <Editor
                  mode="tree"
                  allowedModes={["code", "tree"]}
                  value={sanitizeData(formik.values.ontology)}
                  onChange={(jsObject) => {
                    try {
                      formik.setFieldValue("ontology", jsObject);
                    } catch (error) {
                      console.warn(error); // eslint-disable-line no-console
                    }
                  }}
                />
                {formik.touched.ontology && formik.errors.ontology ? (
                  <Typography variant="body2" color="error">
                    {formik.errors.ontology as string}
                  </Typography>
                ) : null}
              </Grid>
            </Grid>
          </form>
        </Loader>
      </Container>
      <ConfirmModal
        itemName="ring"
        open={confirmVisible}
        setOpen={setConfirmVisible}
        onConfirm={() => deleteRing(ring.rid)}
      />
    </>
  );
};

export default Ring;
