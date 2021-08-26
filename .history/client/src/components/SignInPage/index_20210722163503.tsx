import * as yup from "yup";

import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import React, { FunctionComponent, SyntheticEvent, useState } from "react";

import Copyright from "../Copyright";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBalanceScale } from "@fortawesome/free-solid-svg-icons";
import jwt_decode from "jwt-decode";
import { useFormik } from "formik";
import { useSignIn } from "react-auth-kit";
import { useSnackbar } from "notistack";

export interface UserSignInFields {
  email: string;
  password: string;
}

export interface DecodedToken {
  iat: number;
  exp: number;
  id: number;
  role: string;
  email: string;
  firstName: string;
  lastName: string;
  blocked: boolean;
  approved: boolean;
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
  const signIn = useSignIn();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: UserSignInValidationSchema,
    onSubmit: async (values: UserSignInFields, { setErrors }) => {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const data = await response.json();

      fetch(`${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/users/login`, {
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
                const decodedToken: DecodedToken = jwt_decode(
                  response.data.token
                );
                const {
                  exp,
                  id,
                  email,
                  role,
                  firstName,
                  lastName,
                  blocked,
                  approved,
                } = decodedToken;
                if (
                  signIn({
                    token: response.data.token,
                    expiresIn: exp,
                    tokenType: "Bearer",
                    authState: {
                      user: {
                        id,
                        role,
                        email,
                        firstName,
                        lastName,
                        blocked,
                        approved,
                      },
                    },
                  })
                ) {
                  enqueueSnackbar(response.message, {
                    variant: "success",
                    anchorOrigin: {
                      vertical: "top",
                      horizontal: "center",
                    },
                  });

                  history.push("/");
                } else {
                  console.log("JWT Failed!");
                }
                break;
              }
              case 403: {
                enqueueSnackbar(response.message, {
                  variant: "warning",
                  anchorOrigin: {
                    vertical: "top",
                    horizontal: "center",
                  },
                });
                break;
              }
              default: {
                enqueueSnackbar("Something went wrong. Please try again.", {
                  variant: "error",
                  anchorOrigin: {
                    vertical: "top",
                    horizontal: "center",
                  },
                });
                setErrors(response.errors);
                break;
              }
            }
          } catch (error) {
            console.log(error);
          }
        });
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
                isInvalid={formik.touched.email && Boolean(formik.errors.email)}
              />
              <Form.Label>Email address</Form.Label>
            </div>
            <div className="form-floating mb-3">
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                className="rounded-0 rounded-bottom border-top-0"
                value={formik.values.password}
                onChange={formik.handleChange}
                isInvalid={
                  formik.touched.password && Boolean(formik.errors.password)
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
