import React, { FunctionComponent, useState } from "react";
import { Button } from "react-bootstrap";
import { useAuthHeader } from "store/auth";
import { useNotify } from "components/Notifications";
import ConfirmModal from "components/SharedElements/ConfirmModal";

type Props = {
  userId: number;
  disabled?: boolean;
};

const DeleteUser: FunctionComponent<Props> = ({ userId, disabled = false }) => {
  const authHeader = useAuthHeader();
  const { notify } = useNotify();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const deleteUser = () => {
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
              window.location.reload(); // TODO: No need to reload, right?
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
    <>
      <Button
        className="text-white float-end me-2"
        variant="danger"
        onClick={() => setConfirmVisible(true)}
        disabled={disabled}
        size="sm"
      >
        Delete
      </Button>
      <ConfirmModal
        itemName="user"
        open={confirmVisible}
        setOpen={setConfirmVisible}
        onConfirm={deleteUser}
      />
    </>
  );
};

export default DeleteUser;
