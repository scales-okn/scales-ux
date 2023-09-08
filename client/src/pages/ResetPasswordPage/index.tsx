import React, { FunctionComponent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";

import { useNotify } from "src/components/Notifications";

import { Col, Container, Form, Row } from "react-bootstrap";

import StandardButton from "src/components/Buttons/StandardButton";
import { makeRequest } from "src/helpers/makeRequest";
interface ResetPasswordFields {
  password: string;
  repassword: string;
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
  const navigate = useNavigate();
  const { notify } = useNotify();
  const { token } = useParams();

  const formik = useFormik({
    initialValues: {
      password: "",
      repassword: "",
    },
    validationSchema: ResetPasswordValidationSchema,
    onSubmit: async (values: ResetPasswordFields, { setErrors }) => {
      const response = await makeRequest.post(`/api/users/password/reset`, {
        ...values,
        token,
      });

      if (response.code === 200) {
        notify(response.message, "success");
        navigate("/sign-in");
      } else {
        if (response.errors) {
          setErrors(response.errors);
        }
        notify(response.message, "error");
      }
    },
  });

  return (
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
            <StandardButton
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
            </StandardButton>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
