import React, { FunctionComponent } from "react";
import { useEffect, useCallback } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { notify } from "reapop";

interface Params {
  token: string;
}

const EmailVerificationPage: FunctionComponent = () => {
  const { token } = useParams<Params>();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const verifyEmail = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/users/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
          }),
        }
      );
      const { data, code, message, errors } = await response.json();
      switch (code) {
        case 200: {
           
          enqueueSnackbar(message, {
            variant: "success",
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            },
          });
          break;
        }
        default: {
          enqueueSnackbar(message, {
            variant: "error",
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            },
          });
          break;
        }
      }
    } catch (error) {
      console.log(error);
    }
    history.push("/sign-in");
  }, [token]);

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  return null;
};

export default EmailVerificationPage;
