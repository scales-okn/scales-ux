import React, { FunctionComponent, useEffect, useState } from "react";

import * as yup from "yup";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { authSelector, login } from "store/auth";
import { useDispatch, useSelector } from "react-redux";

import PageLayout from "../../components/PageLayout";
import { useFormik } from "formik";

export interface UserSignInFields {
  email: string;
  password: string;
}

export const UserSignInValidationSchema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const SignInPage: FunctionComponent = () => {
  const history = useHistory();
  const { user, errors } = useSelector(authSelector);
  // const { loading, user, hasErrors, errors } = useSelector(authSelector);
  const dispatch = useDispatch();
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (user) {
      history.push("/");
    }
  }, [user, history]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: UserSignInValidationSchema,
    onSubmit: async (values: UserSignInFields, { setErrors }) => {
      dispatch(login(values.email, values.password, rememberMe));
      if (errors) {
        setErrors(errors);
      }
    },
  });

  return (
    <PageLayout>
      <Container className="h-100">
        <Row className="h-100 justify-content-center align-items-center text-center">
          <Col lg="6" xs="10">
            <h6 className="h6" style={{ color: "crimson", fontStyle: "italic" }}>
              Official launch in fall 2023, beta user onboarding begins mid-June.
            </h6>
            <Form noValidate onSubmit={formik.handleSubmit}>
              <div className="form-floating" style={{ marginTop: "50px", marginBottom: "16px" }}>
                <Form.Control type="email" name="email" placeholder="name@example.com" className="rounded-0 rounded-top" value={formik.values.email} onChange={formik.handleChange} isInvalid={formik.touched.email && Boolean(formik.errors?.email)} />
                <Form.Label>Email address</Form.Label>
              </div>
              <div className="form-floating mb-3">
                <Form.Control type="password" name="password" placeholder="Password" className="rounded-0 rounded-bottom" value={formik.values.password} onChange={formik.handleChange} isInvalid={formik.touched.password && Boolean(formik.errors?.password)} />
                <Form.Label>Password</Form.Label>
              </div>
              {/* remember-me functionality is buggy; hiding this option until it's fixed */}
              {/* <Form.Group className="mb-4">
                <Form.Check type="checkbox" label="Remember Me" name="rememberMe" onChange={() => setRememberMe(!rememberMe)} className="text-start" />
              </Form.Group> */}

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
                Sign in
              </Button>
              <Row className="mb-5">
                <Col className="text-start" md="5">
                  <a href="/forgot-password" className="small" style={{ color: "var(--details-blue)" }}>
                    Forgot password?
                  </a>
                </Col>
                <Col className="text-end">
                  <a href="/sign-up" className="small" style={{ color: "var(--details-blue)" }}>{`Don't have an account? Sign Up`}</a>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
};

export default SignInPage;
