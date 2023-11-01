import React, { useState } from "react";
import { useNotebook } from "src/store/notebook";
import ConfirmModal from "src/components/Modals/ConfirmModal";
import DeleteButton from "src/components/Buttons/DeleteButton";

type DeleteNotebookT = {
  notebookId: string;
  disabled?: boolean;
};

const DeleteNotebook = ({ notebookId, disabled = false }: DeleteNotebookT) => {
  const [confirmVisible, setConfirmVisible] = useState(false);

  const { deleteNotebook } = useNotebook();

  const handleDelete = () => {
    deleteNotebook(notebookId);
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
      {!disabled && confirmVisible && (
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
