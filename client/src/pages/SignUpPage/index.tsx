import React, { ChangeEvent, FunctionComponent, useState } from "react";
import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import Copyright from "components/Copyright";
import { UserSignInFields, UserSignInValidationSchema } from "../SignInPage";
import { Container, Form, Button, Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBalanceScale } from "@fortawesome/free-solid-svg-icons";
import { useNotify } from "components/Notifications";
import Loader from "components/Loader";

interface UserSignUpFields extends UserSignInFields {
  firstName: string;
  lastName: string;
  usage: string;
  tos: boolean;
}

export const UserSignUpValidationSchema = UserSignInValidationSchema.concat(
  yup.object({
    firstName: yup.string().required("First Name is required"),
    lastName: yup.string().required("Last Name is required"),
    usage: yup
      .string()
      .max(255, "Must be maximum 255 characters.")
      .required("Usage Field is required"),
    password: yup
      .string()
      .required("Password is required")
      .matches(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
        "Password must contain at least 8 characters, one uppercase, one number and one special case character",
      ),
    tos: yup
      .boolean()
      .required("The terms and conditions must be accepted.")
      .oneOf([true], "The terms and conditions must be accepted."),
  }),
);

const SignUpPage: FunctionComponent = () => {
  const history = useHistory();
  const { notify } = useNotify();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

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
                // notify(response.message, "success");
                // history.push("/sign-in");
                setMessage(response.message);
                break;
              }
              default: {
                if (response.errors) {
                  setErrors(response.errors);
                }
                // notify(response.message, "error");
                break;
              }
            }
          } catch (error) {
            console.warn(error);
          }
        })
        .catch((error) => {
          console.warn(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
  });

  return (
    <Container className="h-100">
      <Row className="h-100 justify-content-center align-items-center text-center">
        <Col md="7">
          <FontAwesomeIcon icon={faBalanceScale} size="3x" className="mb-4" />
          <h1 className="h3 mb-5 fw-normal">
            {message
              ? "Registered Successfully"
              : "Please register for beta access"}
          </h1>

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
                  {formik.touched.password && Boolean(formik.errors?.password) && (
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
                    In a sentence or two, let us know the types of research you
                    intend to explore with the SCALES dataset within the Satyrn
                    platform:
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
                {/* <Form.Group className="mb-4">
              <Form.Check
                type="switch"
                label="I agree with the TOS."
                className="text-start"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  formik.setFieldValue("tos", event.target.checked)
                }
              />
              {formik.touched.tos && formik.errors.tos && (
                <Form.Text className="text-danger float-start mb-3">
                  {formik.errors.tos}
                </Form.Text>
              )}
            </Form.Group> */}
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3 text-white"
                  size="lg"
                >
                  Register
                </Button>
                {/* <Row className="mb-5">
              <Col className="text-end">
                <a href="/sign-in" className="small">
                  Already have an account? Sign in
                </a>
              </Col>
            </Row> */}
              </Form>
            )}
          </Loader>
        </Col>
        <Copyright />
      </Row>
    </Container>
  );
};

export default SignUpPage;
