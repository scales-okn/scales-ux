import React, { FunctionComponent, useState } from "react";
import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
// import { useNotify } from "../../components/Notifications";
import { Container, Row, Col } from "react-bootstrap";
import Loader from "components/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBalanceScale } from "@fortawesome/free-solid-svg-icons";
import renderHTML from "helpers/renderHTML";

const EmailVerificationPage: FunctionComponent = () => {
  const { token } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const verifyEmail = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
        }),
      });
      const { message } = await response.json();
      setIsLoading(false);
      setMessage(message);
      // TODO: forward to sign in page with success message
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
    }
  }, [token]);

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  return (
    <Container className="h-100">
      <Row className="h-100 justify-content-center align-items-center text-center">
        <Col md="9">
          <FontAwesomeIcon icon={faBalanceScale} size="3x" className="mb-4" />
          <h1 className="h3 mb-5 fw-normal">Email Verification</h1>
          <Loader animation="border" isVisible={isLoading}>
            <p>{renderHTML(message)}</p>
          </Loader>
        </Col>
      </Row>
    </Container>
  );
};

export default EmailVerificationPage;
