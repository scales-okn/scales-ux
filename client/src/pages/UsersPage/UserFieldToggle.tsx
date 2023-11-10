import React, { useState, ChangeEvent } from "react";
import { Switch } from "@mui/material";
import { useNotify } from "src/components/Notifications";
import { makeRequest } from "src/helpers/makeRequest";

type UserFieldToggleT = {
  userId: number;
  fieldName: string;
  label?: string;
  value: boolean;
  disabled?: boolean;
};

const UserFieldToggle = ({
  userId,
  fieldName,
  value,
  disabled,
}: UserFieldToggleT) => {
  const [checked, setChecked] = useState(value);
  const { notify } = useNotify();

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked !== checked) {
      const fieldValue =
        fieldName === "role"
          ? event.target.checked
            ? "admin"
            : "user"
          : !checked;

      const response = await makeRequest.put(`/api/users/${userId}`, {
        [fieldName]: fieldValue,
      });

      if (response?.code === 200) {
        if (fieldName === "role") {
          setChecked(response.data.user[fieldName] === "admin");
        } else {
          setChecked(response.data.user[fieldName]);
        }
        notify(response.message, "success");
      } else {
        notify(response.message, "error");
      }
    }
  };

  return (
    <Switch
      disabled={disabled}
      checked={checked}
      onChange={handleChange}
      color="primary"
      name={fieldName}
      sx={{ cursor: disabled ? "not-allowed" : "pointer" }}
    />
  );
};

export default UserFieldToggle;
