import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import { useEffectOnce } from "react-use";

import { makeRequest } from "src/helpers/makeRequest";

import Loader from "src/components/Loader";
import { styles } from "./styles";

const EmailVerificationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5);

  const setTimer = () => {
    let time = 5;
    const timer = setInterval(() => {
      if (time > 1) {
        setTimeLeft((prev) => prev - 1);
        time--;
      } else {
        clearInterval(timer);
        navigate("/sign-in");
      }
    }, 1000);
  };

  const verifyEmail = async () => {
    try {
      const response = await makeRequest.post(`/api/users/verify-email`, {
        token,
      });
      if (response.status === "OK") {
        setTimer();
      }
      setIsLoading(false);
      setStatus(response.code);
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
    }
  }; // eslint-disable-line react-hooks/exhaustive-deps

  useEffectOnce(() => {
    verifyEmail();
  });

  const messages = {
    400: (
      <div>
        <p>Invalid email verification code, or email is already verified.</p>
        <p>
          Please <Link to="/">sign in</Link> to continue or contact{" "}
          <Link
            to="#"
            onClick={(e) => {
              window.location.href = "mailto:admin@scales-okn.org";
              e.preventDefault();
            }}
          >
            admin@scales-okn.org
          </Link>{" "}
          for support.
        </p>
      </div>
    ),
    200: (
      <div>
        <p>
          Your account has been approved and you can now access Satyrn! You will
          be forwarded to the login page in <strong>{timeLeft}</strong> seconds.
        </p>
      </div>
    ),
  };

  return (
    <div className={styles}>
      <div className="container">
        <img
          src="https://scales-okn.org/wp-content/uploads/2021/02/PreLoader.png"
          height="120px"
          width="120px"
          alt="scales-logo"
        />
        <h1 className="title">Welcome to SCALES!</h1>
        <Loader isVisible={isLoading}>
          <p>{messages[status]}</p>
        </Loader>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
