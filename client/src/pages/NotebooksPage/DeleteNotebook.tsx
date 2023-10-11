import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteNotebook } from "src/store/notebook";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import DeleteButton from "src/components/Buttons/DeleteButton";

type DeleteNotebookT = {
  notebookId: string;
  disabled?: boolean;
};

const DeleteNotebook = ({ notebookId, disabled = false }: DeleteNotebookT) => {
  const dispatch = useDispatch();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleDelete = () => {
    dispatch(deleteNotebook(notebookId));
    setConfirmVisible(false);
  };

  return (
    <>
      <DeleteButton
        variant="text"
        disabled={disabled}
        onClick={() => {
          setConfirmVisible(true);
        }}
        titleAddon="Notebook"
      />
      {!disabled && (
        <ConfirmModal
          itemName="notebook"
          open={confirmVisible}
          setOpen={setConfirmVisible}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};

export default DeleteNotebook;
