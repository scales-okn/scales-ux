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
  Box,
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

const Ring = () => {
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

  const [currentVersion, setCurrentVersion] = useState(0);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const currentRing = ringVersions?.find(
    (version) => version.version === currentVersion,
  );

  useEffect(() => {
    if (ringVersions.length && !rid) {
      navigate(`/admin/rings/${ringVersions[0].rid}`);
    }
  }, [ringVersions]); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [rid]); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [ringVersions, currentVersion]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const setEditorField = (value, fields) => {
    fields.forEach((field) => {
      formik.setFieldValue(
        field,
        sanitizeData(
          ringVersions.find((version) => version.version === value)[field],
        ),
      );
    });
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
                        setCurrentVersion(0);
                        setEditorField(e.target.value, [
                          "dataSource",
                          "ontology",
                        ]);
                        setTimeout(() => {
                          setCurrentVersion(e.target.value as number);
                        }, 100);
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
              <Grid
                item
                xs={12}
                sm={3}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  paddingBottom: "24px",
                }}
              >
                <Typography>Public</Typography>
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
              <Grid item xs={12}>
                <Typography variant="h6" mb={2}>
                  Data Source
                </Typography>
                {/* Workaround for JSON editor's quirks. Only load the editor if we're creating a ring (no RID) or after we get ring data if we're editing a ring. Same below for ontology. */}
                {(!rid || formik.values.rid) && currentVersion > 0 ? (
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
                ) : (
                  <Box
                    sx={{
                      height: "361px",
                      width: "100%",
                      background: "rgb(102, 102, 102)",
                    }}
                  >
                    <Loader isVisible={true} />
                  </Box>
                )}
                {formik.touched.dataSource && formik.errors.dataSource ? (
                  <Typography variant="body2" color="error">
                    {formik.errors.dataSource as string}
                  </Typography>
                ) : null}
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" mb={2} mt={4}>
                  Ontology
                </Typography>
                {(!rid || formik.values.rid) && currentVersion > 0 ? (
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
                ) : (
                  <Box
                    sx={{
                      height: "361px",
                      width: "100%",
                      background: "rgb(102, 102, 102)",
                    }}
                  >
                    <Loader isVisible={true} />
                  </Box>
                )}
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
