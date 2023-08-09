import React, { FunctionComponent } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";

import { useNotify } from "components/Notifications";

import { Button, Col, Container, Form, Row } from "react-bootstrap";
import PageLayout from "../../components/PageLayout";

interface ResetPasswordFields {
  password: string;
  repassword: string;
}

interface ParamTypes {
  token: string;
}

const ResetPasswordValidationSchema = yup.object({
  password: yup
    .string()
    .required()
    .matches(
      /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
      "Password must contain at least 8 characters, one uppercase, one number and one special case character",
    ),
  repassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

const ResetPassword: FunctionComponent = () => {
  const history = useHistory();
  const { notify } = useNotify();
  const { token } = useParams<ParamTypes>();

  const formik = useFormik({
    initialValues: {
      password: "",
      repassword: "",
    },
    validationSchema: ResetPasswordValidationSchema,
    onSubmit: (values: ResetPasswordFields, { setErrors }) => {
      fetch(`/api/users/password/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, token }),
      })
        .then((response) => response.json())
        .then((response) => {
          try {
            switch (response.code) {
              case 200: {
                notify(response.message, "success");
                history.push("/sign-in");
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
              <h1 className="h3 mb-5 mt-4 fw-normal">Set a New Password</h1>
              <div className="form-floating">
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="rounded-0 rounded-top"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  isInvalid={
                    formik.touched.password && Boolean(formik.errors?.password)
                  }
                  style={{ marginBottom: "12px" }}
                />
                <Form.Label>Password</Form.Label>
              </div>
              <div className="form-floating mb-3">
                <Form.Control
                  type="password"
                  name="repassword"
                  placeholder="Confirm Password"
                  className="rounded-0 rounded-bottom border-top-0"
                  value={formik.values.repassword}
                  onChange={formik.handleChange}
                  isInvalid={
                    formik.touched.repassword &&
                    Boolean(formik.errors?.repassword)
                  }
                />
                <Form.Label>Confirm Password</Form.Label>
              </div>
              <Button
                type="submit"
                className="w-100 mb-3 text-white"
                size="lg"
                style={{
                  background: "var(--main-purple-light)",
                  border: "none",
                  marginTop: "20px",
                }}
              >
                Reset Password
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
};

export default ResetPassword;
