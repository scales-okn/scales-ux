import React, { FunctionComponent, useState } from "react";

import { makeRequest } from "src/helpers/makeRequest";

import { useNotify } from "src/components/Notifications";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import StandardButton from "src/components/Buttons/StandardButton";

type Props = {
  userId: number;
  disabled?: boolean;
};

const DeleteUser: FunctionComponent<Props> = ({ userId, disabled = false }) => {
  const { notify } = useNotify();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const deleteUser = async () => {
    const response = await makeRequest.delete(`/api/users/${userId}`);

    if (response.code === 200) {
      notify(response.message, "success");
      window.location.reload();
    } else {
      notify(response.message, "error");
    }
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
