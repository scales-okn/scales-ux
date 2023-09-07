import React, { FunctionComponent, useState } from "react";

import { useAuthHeader } from "src/store/auth";

import { useNotify } from "src/components/Notifications";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import StandardButton from "src/components/Buttons/StandardButton";

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
              window.location.reload();
              break;
            default:
              notify(response.message, "error");
          }
        } catch (error) {
          console.warn(error); // eslint-disable-line no-console
        }
      })
      .catch((error) => console.warn(error)); // eslint-disable-line no-console
  };

  return (
    <>
      <StandardButton
        className="text-white float-end me-2"
        variant="danger"
        onClick={() => setConfirmVisible(true)}
        disabled={disabled}
        size="sm"
      >
        Delete
      </StandardButton>
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
