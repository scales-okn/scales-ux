import React, { FunctionComponent, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import { useEffectOnce } from "react-use";
import Loader from "components/Loader";
import { styles } from "./styles";

const EmailVerificationPage: FunctionComponent = () => {
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
      const { code } = await response.json();

      if (code === 200) {
        setTimer();
      }

      setIsLoading(false);
      setStatus(code);
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

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
