import React, { FunctionComponent, useState } from "react";

import { Button } from "@mui/material";

import { makeRequest } from "src/helpers/makeRequest";

import { useNotify } from "src/components/Notifications";
import ConfirmModal from "src/components/Modals/ConfirmModal";

type Props = {
  userId: number;
  disabled?: boolean;
};

const DeleteUser: FunctionComponent<Props> = ({ userId, disabled = false }) => {
  const { notify } = useNotify();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const deleteUser = async () => {
    const response = await makeRequest.delete(`/api/users/${userId}`);

    if (response.status === "OK") {
      notify(response.message, "success");
      window.location.reload();
    } else {
      notify(response.message, "error");
    }
  };

  return (
    <>
      <Button
        color="error"
        variant="outlined"
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setConfirmVisible(true);
        }}
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
