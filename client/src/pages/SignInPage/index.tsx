import * as yup from "yup";

import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import React, {
  FunctionComponent,
  SyntheticEvent,
  useState,
  useEffect,
} from "react";

import Copyright from "../../components/Copyright";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBalanceScale } from "@fortawesome/free-solid-svg-icons";
import { useFormik } from "formik";
import { login, authSelector, userSelector } from "../../store/auth";
import { useSelector, useDispatch } from "react-redux";

export interface UserSignInFields {
  email: string;
  password: string;
}

export const UserSignInValidationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

const SignInPage: FunctionComponent = () => {
  const history = useHistory();
  const { loading, user, hasErrors, errors } = useSelector(authSelector);
  const dispatch = useDispatch();

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
      dispatch(login(values.email, values.password));
      if (errors) {
        setErrors(errors);
      }
    },
  });

  return (
    <Container className="h-100">
      <Row className="h-100 justify-content-center align-items-center text-center">
        <Col md="4">
          <Form noValidate onSubmit={formik.handleSubmit}>
            <FontAwesomeIcon icon={faBalanceScale} size="3x" className="mb-4" />
            <h1 className="h3 mb-3 fw-normal">Please sign in</h1>
            <div className="form-floating">
              <Form.Control
                type="email"
                name="email"
                placeholder="name@example.com"
                className="rounded-0 rounded-top"
                value={formik.values.email}
                onChange={formik.handleChange}
                isInvalid={
                  formik.touched.email && Boolean(formik.errors?.email)
                }
              />
              <Form.Label>Email address</Form.Label>
            </div>
            <div className="form-floating mb-3">
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                className="rounded-0 rounded-bottom"
                value={formik.values.password}
                onChange={formik.handleChange}
                isInvalid={
                  formik.touched.password && Boolean(formik.errors?.password)
                }
              />
              <Form.Label>Password</Form.Label>
            </div>
            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                label="Remember me"
                className="text-start"
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100 mb-3 text-white"
              size="lg"
            >
              Sign in
            </Button>
            <Row className="mb-5">
              <Col className="text-start" md="5">
                <a href="/forgot-password" className="small">
                  Forgot password?
                </a>
              </Col>
              <Col className="text-end">
                <a
                  href="/sign-up"
                  className="small"
                >{`Don't have an account? Sign Up`}</a>
              </Col>
            </Row>
            <Copyright />
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default SignInPage;
