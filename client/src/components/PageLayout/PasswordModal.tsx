import React from "react";

import ResetPasswordForm from "src/pages/ResetPasswordPage/ResetPasswordForm";
import ModalContainer from "src/components/Modals/ModalContainer";
import { useSessionUser } from "src/store/auth";

type PasswordModalT = {
  visible: boolean;
  setVisible: (arg: boolean) => void;
};

const PasswordModal = ({ visible, setVisible }: PasswordModalT) => {
  const sessionUser = useSessionUser();

  return (
    <ModalContainer
      open={visible}
      onClose={() => setVisible(false)}
      title="Change Password"
      paperStyles={{ maxWidth: "500px" }}
    >
      <ResetPasswordForm sessionUserId={sessionUser.id} />
    </ModalContainer>
  );
};

export default PasswordModal;
