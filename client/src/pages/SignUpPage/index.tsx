import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useFormik } from "formik";

import { Container, Form, Button, Col, Row } from "react-bootstrap";

import { UserSignInFields } from "../SignInPage";
import PageLayout from "../../components/PageLayout";
import Loader from "components/Loader";
import { UserSignUpValidationSchema } from "./schema";
interface UserSignUpFields extends UserSignInFields {
  firstName: string;
  lastName: string;
  usage: string;
  tos: boolean;
}

const SignUpPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        navigate("/sign-in");
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      usage: "",
      tos: true,
    },
    validationSchema: UserSignUpValidationSchema,
    onSubmit: (values: UserSignUpFields, { setErrors }) => {
      setIsLoading(true);
      fetch(`/api/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
        .then((response) => response.json())
        .then((response) => {
          setIsLoading(false);
          try {
            switch (response.code) {
              case 200: {
                setMessage(response.message);
                break;
              }
              default: {
                if (response.errors) {
                  setErrors(response.errors);
                }
                break;
              }
            }
          } catch (error) {
            console.warn(error); // eslint-disable-line no-console
          }
        })
        .catch((error) => {
          console.warn(error); // eslint-disable-line no-console
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
  });

  return (
    <PageLayout>
      <Container className="h-100">
        <Row className="h-100 justify-content-center align-items-center text-center">
          <Col md="7">
            <h1 className="h3 mb-3 fw-normal">
              {message
                ? "Registered Successfully"
                : "Please register for beta access"}
            </h1>
            {message ? (
              <img
                src="https://scales-okn.org/wp-content/uploads/2021/02/PreLoader.png"
                height="50px"
                width="50px"
                alt="scales-logo"
                style={{ marginBottom: "24px" }}
              />
            ) : (
              <h6
                className="h6 mb-5"
                style={{ color: "crimson", fontStyle: "italic" }}
              >
                This Application is currently in beta development. Official
                launch scheduled for September 2023.
              </h6>
            )}

            <Loader
              animation="border"
              isVisible={isLoading}
              contentHeight="700px"
            >
              {message ? (
                <p>{message}</p>
              ) : (
                <Form noValidate onSubmit={formik.handleSubmit}>
                  <Row className="mb-3">
                    <Col>
                      <div className="form-floating">
                        <Form.Control
                          type="text"
                          name="firstName"
                          placeholder="First Name"
                          value={formik.values.firstName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={
                            formik.touched.firstName &&
                            Boolean(formik.errors?.firstName)
                          }
                        />
                        <Form.Label>First Name</Form.Label>
                        {formik.touched.firstName &&
                          Boolean(formik.errors?.firstName) && (
                            <Form.Control.Feedback
                              type="invalid"
                              className="text-start d-block"
                            >
                              {formik.errors.firstName}
                            </Form.Control.Feedback>
                          )}
                      </div>
                    </Col>
                    <Col>
                      <div className="form-floating">
                        <Form.Control
                          type="text"
                          name="lastName"
                          placeholder="First Name"
                          value={formik.values.lastName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={
                            formik.touched.lastName &&
                            Boolean(formik.errors?.lastName)
                          }
                        />
                        <Form.Label>Last Name</Form.Label>
                        {formik.touched.lastName &&
                          Boolean(formik.errors?.lastName) && (
                            <Form.Control.Feedback
                              type="invalid"
                              className="text-start d-block"
                            >
                              {formik.errors.lastName}
                            </Form.Control.Feedback>
                          )}
                      </div>
                    </Col>
                  </Row>

                  <div className="form-floating mb-3">
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={
                        formik.touched.email && Boolean(formik.errors?.email)
                      }
                    />
                    <Form.Label>Email address</Form.Label>
                    {formik.touched.email && Boolean(formik.errors?.email) && (
                      <Form.Control.Feedback
                        type="invalid"
                        className="text-start d-block"
                      >
                        {formik.errors.email}
                      </Form.Control.Feedback>
                    )}
                  </div>
                  <div className="form-floating mb-3">
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={
                        formik.touched.password &&
                        Boolean(formik.errors?.password)
                      }
                    />
                    <Form.Label>Password</Form.Label>
                    {formik.touched.password &&
                      Boolean(formik.errors?.password) && (
                        <Form.Control.Feedback
                          type="invalid"
                          className="text-start d-block"
                        >
                          {formik.errors.password}
                        </Form.Control.Feedback>
                      )}
                  </div>
                  <div className="form-floating mb-3">
                    <p className="text-start">
                      In a sentence or two, let us know the types of research
                      you intend to explore with the SCALES dataset within the
                      Satyrn platform:
                    </p>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="usage"
                      placeholder="Account Usage"
                      value={formik.values.usage}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      style={{ height: "100px" }}
                      isInvalid={
                        formik.touched.usage && Boolean(formik.errors?.usage)
                      }
                    />
                    <Form.Label></Form.Label>
                    {formik.touched.usage && Boolean(formik.errors?.usage) && (
                      <Form.Control.Feedback
                        type="invalid"
                        className="text-start d-block"
                      >
                        {formik.errors.usage}
                      </Form.Control.Feedback>
                    )}
                  </div>
                  <Form.Group className="mb-4">
                    <Form.Check
                      type="switch"
                      label={
                        <div>
                          Accept{" "}
                          <a
                            href="https://docs.google.com/document/d/1Bdta3CTuS0hKoDdWQoO_FdVOELHfnVGs4rjSq0531TQ/edit"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "rgb(33, 37, 41)" }}
                          >
                            Terms of Service
                          </a>
                        </div>
                      }
                      className="text-start"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        formik.setFieldValue("tos", event.target.checked)
                      }
                    />
                    {formik.touched.tos && formik.errors.tos && (
                      <Form.Text className="text-danger float-start mb-3">
                        {formik.errors.tos}
                      </Form.Text>
                    )}
                  </Form.Group>
                  <Button
                    type="submit"
                    className="w-100 mb-3 text-white"
                    size="lg"
                    style={{
                      background: "var(--main-purple-light)",
                      border: "none",
                    }}
                  >
                    Register
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
              )}
            </Loader>
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
};

export default SignUpPage;
