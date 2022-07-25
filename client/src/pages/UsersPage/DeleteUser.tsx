import React, { FunctionComponent, useState } from "react";
import { Button } from "react-bootstrap";
import { useAuthHeader } from "store/auth";
import { useNotify } from "components/Notifications";

type Props = {
  userId: number;
  disabled?: boolean;
}

const DeleteUser: FunctionComponent<Props> = ({ userId, disabled = false }) => {
  const [checked, setChecked] = useState(false);
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
            if (response?.code === 200) {
              notify(response.message, "success");
              window.location.reload();
            }
          } catch (error) {
            console.log(error);
          }
        })
        .catch((error) => console.log(error));
  }

  return (
    <Button variant="outline-danger" size="sm" onClick={deleteUser} disabled={disabled}>
      Delete
    </Button>
  );
}

export default DeleteUser;