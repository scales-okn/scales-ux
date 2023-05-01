import React, { FunctionComponent, useState, ChangeEvent } from "react";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { useAuthHeader } from "store/auth";
import { useNotify } from "components/Notifications";

type Props = {
  userId: number;
  fieldName: string;
  label?: string;
  value: boolean;
  disabled?: boolean;
};

const UserFieldToggle: FunctionComponent<Props> = ({ userId, fieldName, label, value, disabled }) => {
  const [checked, setChecked] = useState(value);
  const authHeader = useAuthHeader();
  const { notify } = useNotify();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked !== checked) {
      const fieldValue = fieldName === "role" ? (event.target.checked ? "admin" : "user") : !checked;
      fetch(`/api/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({
          [fieldName]: fieldValue,
        }),
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          try {
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
          } catch (error) {
            console.warn(error); // eslint-disable-line no-console
          }
        })
        .catch((error) => console.warn(error)); // eslint-disable-line no-console
    }
  };

  return (
    <FormGroup row>
      <FormControlLabel control={<Switch disabled={disabled} checked={checked} onChange={handleChange} color="primary" name={fieldName} />} label={label} />
    </FormGroup>
  );
};

export default UserFieldToggle;
