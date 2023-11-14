import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSessionUser } from "src/store/auth";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Switch,
} from "@mui/material";

import { useFormik } from "formik";
import * as yup from "yup";
import { pick } from "lodash";

import useWindowSize from "src/hooks/useWindowSize";

import Loader from "src/components/Loader";
import { useRing } from "src/store/rings";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import Editor from "src/components/Editor";
import BackButton from "src/components/Buttons/BackButton";
import "./jsoneditor-react-dark-mode.css";

const Ring: React.FC = () => {
  const { rid = null } = useParams<{ rid: string | null }>();
  const {
    ringVersions,
    createRing,
    getRingVersions,
    deleteRing,
    clearRingVersions,
    loadingRing,
  } = useRing(Number(rid));

  const navigate = useNavigate();
  const sessionUser = useSessionUser();

  const { width } = useWindowSize();
  const isTablet = width < 768;

  const [currentVersion, setCurrentVersion] = useState(1);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const currentRing = ringVersions?.find(
    (version) => version.version === currentVersion,
  );

  useEffect(() => {
    if (ringVersions.length) {
      setCurrentVersion(ringVersions[0].version);
    }
  }, [ringVersions]);

  useEffect(() => {
    if (rid) {
      getRingVersions(rid);
    }

    return () => {
      clearRingVersions();
    };
  }, [rid]);

  const formik = useFormik({
    initialValues: {
      rid: "",
      name: "",
      description: "",
      schemaVersion: 1.0,
      dataSource: {},
      ontology: {},
      visibility: "public",
      userId: sessionUser.id,
    },
    validationSchema: yup.object({
      rid: yup.string(),
      name: yup.string().required("Name is required"),
      description: yup.string().required("Description is required"),
      schemaVersion: yup.number().required("Schema version is required"),
      dataSource: yup.object().required("Data source is required"),
      ontology: yup.object().required("Ontology is required"),
      visibility: yup.string().required("Visibility is required"),
    }),
    onSubmit: async (values) => {
      createRing(values);
      if (!rid) {
        navigate("/admin/rings");
      }
    },
  });

  // set values on ring load
  useEffect(() => {
    const targetVersion = ringVersions?.find(
      (version) => version.version === currentVersion,
    );

    if (targetVersion) {
      const existingValues = pick(targetVersion, [
        "userId",
        "rid",
        "name",
        "description",
        "schemaVersion",
        "dataSource",
        "ontology",
        "visibility",
      ]);

      formik.setValues(existingValues);
    }
  }, [ringVersions, currentVersion]);

  const onDeleteRingConfirm = () => {
    deleteRing(ringVersions[0].rid);

    navigate("/admin/rings");
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
      <Container sx={{ padding: isTablet ? "86px 12px" : "86px 0" }}>
        <Loader isVisible={loadingRing}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3} mb={3}>
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Grid>
                  {ringVersions.length ? (
                    <Select
                      value={currentVersion}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setCurrentVersion(e.target.value as number);
                      }}
                      MenuProps={{
                        disableScrollLock: true,
                      }}
                      sx={{
                        minWidth: "140px",
                        marginBottom: "24px",
                        height: "42px",
                        background: "white",
                      }}
                    >
                      {ringVersions.map((version) => (
                        <MenuItem key={version.id} value={version.version}>
                          Version {version.version}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : null}{" "}
                  <Typography
                    sx={{
                      color: "GrayText",
                      fontStyle: "italic",
                      display: "inline",
                    }}
                  >
                    {currentRing
                      ? new Date(currentRing.createdAt).toLocaleString()
                      : null}{" "}
                    - {currentRing?.user?.firstName}{" "}
                    {currentRing?.user?.lastName}
                  </Typography>
                </Grid>
                <Grid>
                  {ringVersions.length ? (
                    <Button
                      variant="contained"
                      color="error"
                      type="button"
                      onClick={() => setConfirmVisible(true)}
                      sx={{ marginRight: "12px" }}
                    >
                      Delete
                    </Button>
                  ) : null}

                  <Button variant="contained" color="primary" type="submit">
                    {ringVersions.length ? "Add Version" : "Create"}
                  </Button>
                </Grid>
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
              <Grid item xs={12} sm={3}>
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
              <Grid item xs={12} sm={3}>
                <Switch
                  checked={formik.values.visibility === "public"}
                  color="primary"
                  onChange={(e) => {
                    formik.setFieldValue(
                      "visibility",
                      e.target.checked ? "public" : "private",
                    );
                  }}
                />
                <Typography>Public</Typography>
              </Grid>
              {/* <Grid item xs={12} sm={3}>
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
              </Grid> */}
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
            <Grid container>
              {/* <Grid item xs={12} sm={4}>
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
              </Grid> */}

              <Grid
                item
                sm={12}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                  marginBottom: "24px",
                }}
              >
                {/* <TextField
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
                ) : null} */}
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
        onConfirm={onDeleteRingConfirm}
      />
    </>
  );
};

export default Ring;
