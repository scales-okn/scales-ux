import React, { FunctionComponent } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";

import PageLayout from "../../components/PageLayout";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNotify } from "components/Notifications";

interface ForgotPasswordFields {
  email: string;
}

const ForgotPasswordValidationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
});

const ForgotPassword: FunctionComponent = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: ForgotPasswordValidationSchema,
    onSubmit: (values: ForgotPasswordFields, { setErrors }) => {
      fetch(`/api/users/password/forgot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
        .then((response) => response.json())
        .then((response) => {
          try {
            switch (response.code) {
              case 200: {
                notify(response.message, "success");
                navigate("/sign-in");
                break;
              }
              default: {
                if (response.errors) {
                  setErrors(response.errors);
                }
                notify(response.message, "error");
                break;
              }
            }
          } catch (error) {
            console.warn(error); // eslint-disable-line no-console
          }
        });
    },
  });

  return (
    <PageLayout>
      <Container className="h-100">
        <Row className="h-100 justify-content-center align-items-center text-center">
          <Col md="5">
            <Form noValidate onSubmit={formik.handleSubmit}>
              <h1 className="h3 mb-5 fw-normal">Forgot Password?</h1>
              <div className="form-floating mb-3">
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  isInvalid={
                    formik.touched.email && Boolean(formik.errors?.email)
                  }
                />
                <Form.Label>Email address</Form.Label>
              </div>

              <Button
                variant="primary"
                type="submit"
                className="w-100 mb-3 text-white "
                size="lg"
                style={{
                  background: "var(--main-purple-light)",
                  border: "none",
                }}
              >
                Submit
              </Button>
              <Row className="mb-5">
                <Col className="text-end">
                  <a
                    href="/sign-in"
                    className="small"
                    style={{ color: "var(--details-blue)" }}
                  >
                    Already have an account? Sign in
                  </a>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
};

export default ForgotPassword;
