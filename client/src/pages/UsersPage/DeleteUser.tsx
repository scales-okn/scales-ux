import React, { FunctionComponent } from "react";
import { Button } from "react-bootstrap";
import { useAuthHeader } from "store/auth";
import { useNotify } from "components/Notifications";

type Props = {
  userId: number;
  disabled?: boolean;
};

const DeleteUser: FunctionComponent<Props> = ({ userId, disabled = false }) => {
  const authHeader = useAuthHeader();
  const { notify } = useNotify();

  const deleteUser = () => {
    window.confirm("Are you sure you want to delete this user?") &&
      fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          try {
            switch (response.code) {
              case 200:
                notify(response.message, "success");
                window.location.reload();
                break;
              default:
                notify(response.message, "error");
            }
          } catch (error) {
            console.warn(error);
          }
        })
        .catch((error) => console.warn(error));
  };

  return (
    <Button
      variant="outline-danger"
      size="sm"
      onClick={deleteUser}
      disabled={disabled}
    >
      Delete
    </Button>
  );
};

export default DeleteUser;
