import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteNotebook } from "src/store/notebook";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import { Button } from "@mui/material";

type Props = {
  notebookId: string;
};

const DeleteNotebook = ({ notebookId }: Props) => {
  const dispatch = useDispatch();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleDelete = () => {
    dispatch(deleteNotebook(notebookId));
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
        itemName="notebook"
        open={confirmVisible}
        setOpen={setConfirmVisible}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default DeleteNotebook;
