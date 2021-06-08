import React, { FunctionComponent } from "react";
import { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import PageLayout from "../PageLayout";
import { useSnackbar } from "notistack";

interface ParamTypes {
  code: string;
}

const EmailVerificationPage: FunctionComponent = () => {
  const { code } = useParams<ParamTypes>();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (code) {
      fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/users/verify/email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
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
  }, [code]);

  return null;
};

export default EmailVerificationPage;
