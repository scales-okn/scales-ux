import StandardButton from "components/Buttons/StandardButton";
import React, { FC } from "react";
import { Modal } from "react-bootstrap";

type ConfirmModalProps = {
  open: boolean;
  setOpen: (arg: boolean) => void;
  onConfirm: () => void;
  itemName: string;
};

const ConfirmModal: FC<ConfirmModalProps> = ({
  open,
  setOpen,
  onConfirm,
  itemName,
}) => {
  const handleClose = () => setOpen(false);

  return (
    <Modal show={open} onHide={handleClose} animation sx={{ xIndex: "134000" }}>
      <Modal.Body>Are you sure you want to delete this {itemName}?</Modal.Body>
      <Modal.Footer>
        <StandardButton
          variant="secondary"
          className="text-white me-2 btn"
          onClick={handleClose}
        >
          Cancel
        </StandardButton>
        <StandardButton
          className="text-white me-2 btn btn-danger"
          onClick={onConfirm}
        >
          Delete
        </StandardButton>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
