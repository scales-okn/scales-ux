import React, { FunctionComponent } from "react";
import { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import PageLayout from "../PageLayout";
import { useSnackbar } from "notistack";

interface ParamTypes {
  token: string;
}

const EmailVerificationPage: FunctionComponent = () => {
  const { token } = useParams<ParamTypes>();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (token) {
      fetch(
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
      )
        .then((response) => response.json())
        .then((response) => {
          try {
            switch (response.code) {
              case 200: {
                enqueueSnackbar(response.message, {
                  variant: "success",
                  anchorOrigin: {
                    vertical: "top",
                    horizontal: "center",
                  },
                });
                break;
              }
              default: {
                enqueueSnackbar(response.message, {
                  variant: "error",
                  anchorOrigin: {
                    vertical: "top",
                    horizontal: "center",
                  },
                });
                break;
              }
            }

            history.push("/sign-in");
          } catch (error) {
            console.log(error);
          }
        });
    }
  }, [token]);

  return null;
};

export default EmailVerificationPage;
