import React, { FunctionComponent, useState, ChangeEvent } from "react";
import { FormGroup, FormControlLabel, Switch } from "@mui/material";
import { useNotify } from "src/components/Notifications";
import { makeRequest } from "src/helpers/makeRequest";

type Props = {
  userId: number;
  fieldName: string;
  label?: string;
  value: boolean;
  disabled?: boolean;
};

const UserFieldToggle: FunctionComponent<Props> = ({
  userId,
  fieldName,
  label,
  value,
  disabled,
}) => {
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
    <FormGroup row>
      <FormControlLabel
        control={
          <Switch
            disabled={disabled}
            checked={checked}
            onChange={handleChange}
            color="primary"
            name={fieldName}
          />
        }
        label={label}
      />
    </FormGroup>
  );
};

export default UserFieldToggle;
