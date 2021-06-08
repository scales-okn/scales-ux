import React, { FunctionComponent, useState, ChangeEvent } from "react";
import { useAuthHeader, useAuthUser } from "react-auth-kit";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
type Props = {
  userId: number;
  fieldName: string;
  label?: string;
  value: boolean;
};

const UserFieldToggle: FunctionComponent<Props> = ({
  userId,
  fieldName,
  label,
  value,
}) => {
  const [checked, setChecked] = useState(value);
  const authHeader = useAuthHeader();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked !== checked) {
      fetch(`${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({
          [fieldName]: !checked,
        }),
        headers: {
          Authorization: authHeader(),
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          try {
            if (response?.code === 200) {
              setChecked(response.data.user[fieldName]);
            }
          } catch (error) {
            console.log(error);
          }
        })
        .catch((error) => console.log(error));
    }
  };

  return (
    <FormGroup row>
      <FormControlLabel
        control={
          <Switch
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
