import React, { useState } from "react";
import PageLayout from "components/PageLayout";
import Loader from "components/Loader";
import { useFormik } from "formik";
import * as yup from "yup";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useAuthHeader, useUser } from "store/auth";
import { useNotify } from "components/Notifications";
import { useNavigate, useParams } from "react-router-dom";
import { useRing } from "store/rings";
import ConfirmModal from "components/Modals/ConfirmModal";
import Editor from "components/Editor";
import "./jsoneditor-react-dark-mode.css";
import { Container } from "@mui/material";
import BackButton from "components/Buttons/BackButton";

type Params = {
  ringId: string | null;
};

const Ring: React.FC = () => {
  const { ringId = null } = useParams<Params>();
  const { ring } = useRing(Number(ringId));
  const [loading, setLoading] = useState(false);
  const authHeader = useAuthHeader();
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
      fetch(`/api/rings/${ringId || "create"}`, {
        method: ringId ? "PUT" : "POST",
        body: JSON.stringify(values),
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          try {
            if (response?.code === 200) {
              notify(response.message, "success");
              navigate("/admin/rings");
            }
          } catch (error) {
            console.warn(error); // eslint-disable-line no-console
            notify(error.message, "error");
          }
        })
        .catch((error) => console.warn(error)) // eslint-disable-line no-console
        .finally(() => setLoading(false));
    },
  });

  const deleteRing = async (rid) => {
    setLoading(true);
    fetch(`/api/rings/${rid}`, {
      method: "DELETE",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        try {
          switch (response?.code) {
            case 200:
              notify(response.message, "success");
              navigate("/admin/rings");
              break;
            default:
              notify(response.message, "error");
              break;
          }
        } catch (error) {
          console.warn(error); // eslint-disable-line no-console
          notify(error.message, "error");
        }
      })
      .catch((error) => console.warn(error)) // eslint-disable-line no-console
      .finally(() => setLoading(false));
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
    <PageLayout>
      <BackButton onClick={() => navigate("/admin/rings")} />

      <Container sx={{ padding: "86px 0" }}>
        <Loader animation="border" isVisible={loading}>
          <Form onSubmit={formik.handleSubmit}>
            <Row className="mb-3">
              <Col>
                <h3 className="mb-3">{ring ? "Edit Ring" : "Create Ring"}</h3>
              </Col>
              <Col>
                <Button
                  variant="primary"
                  type="submit"
                  className="text-white float-end ms-2"
                  style={{
                    background: "var(--sea-green)",
                    border: "none",
                  }}
                >
                  Submit
                </Button>
                {ring && (
                  <Button
                    variant="danger"
                    type="button"
                    onClick={() => setConfirmVisible(true)}
                    className="float-end"
                    style={{
                      border: "none",
                    }}
                  >
                    Delete Ring
                  </Button>
                )}
              </Col>
            </Row>
            <Row>
              <Form.Group controlId="formName" className="mb-2" as={Col}>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.name && formik.errors.name ? (
                  <Form.Text className="text-danger">
                    {formik.errors.name}
                  </Form.Text>
                ) : null}
              </Form.Group>
              <Form.Group controlId="formRID" className="mb-2" as={Col}>
                <Form.Label>RID</Form.Label>
                <Form.Control
                  type="text"
                  name="rid"
                  placeholder="Ring Id"
                  value={formik.values.rid}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.rid && formik.errors.rid ? (
                  <Form.Text className="text-danger">
                    {formik.errors.rid}
                  </Form.Text>
                ) : null}
              </Form.Group>
            </Row>
            <Form.Group controlId="formDescription" className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.description && formik.errors.description ? (
                <Form.Text className="text-danger">
                  {formik.errors.description}
                </Form.Text>
              ) : null}
            </Form.Group>
            <Row>
              <Form.Group controlId="formVersion" className="mb-2" as={Col}>
                <Form.Label>Version</Form.Label>
                <Form.Control
                  type="number"
                  name="version"
                  placeholder="Version"
                  value={formik.values.version}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.version && formik.errors.version ? (
                  <Form.Text className="text-danger">
                    {formik.errors.version}
                  </Form.Text>
                ) : null}
              </Form.Group>
              <Form.Group
                controlId="formSchemaVersion"
                className="mb-2"
                as={Col}
              >
                <Form.Label>Schema Version</Form.Label>
                <Form.Control
                  type="number"
                  name="schemaVersion"
                  placeholder="Schema Version"
                  value={formik.values.schemaVersion}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.schemaVersion && formik.errors.schemaVersion ? (
                  <Form.Text className="text-danger">
                    {formik.errors.schemaVersion}
                  </Form.Text>
                ) : null}
              </Form.Group>
              <Form.Group controlId="formVisibility" className="mb-3" as={Col}>
                <Form.Label>Visibility</Form.Label>
                <Form.Control
                  as="select"
                  name="visibility"
                  value={formik.values.visibility}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </Form.Control>
                {formik.touched.visibility && formik.errors.visibility ? (
                  <Form.Text className="text-danger">
                    {formik.errors.visibility}
                  </Form.Text>
                ) : null}
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group controlId="formDataSource" className="mb-2" as={Col}>
                <Form.Label>Data Source</Form.Label>
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
                  <Form.Text className="text-danger">
                    {formik.errors.dataSource as string}
                  </Form.Text>
                ) : null}
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group controlId="formOntology" className="mb-2" as={Col}>
                <Form.Label>Ontology</Form.Label>
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
                  <Form.Text className="text-danger">
                    {formik.errors.ontology as string}
                  </Form.Text>
                ) : null}
              </Form.Group>
            </Row>
          </Form>
        </Loader>
      </Container>
      <ConfirmModal
        itemName="ring"
        open={confirmVisible}
        setOpen={setConfirmVisible}
        onConfirm={() => deleteRing(ring.rid)}
      />
    </PageLayout>
  );
};

export default Ring;
