import React, { FunctionComponent, useState, ChangeEvent } from "react";
import { useAuthHeader } from "store/auth";
import { useNotify } from "components/Notifications";
import { FormControl, Form } from 'react-bootstrap';

type Props = {
  userId: number;
  role: string;
};

const UserRoleChange: FunctionComponent<Props> = ({
  userId,
  role,
}) => {
  const authHeader = useAuthHeader();
  const { notify } = useNotify();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      fetch(`/api/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({
          role: role,
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
              notify(response.message, "success");
            }
          } catch (error) {
            console.log(error);
          }
        })
        .catch((error) => console.log(error));
  };

  return (
   <Form.Group className="mb-3">
    <Form.Label>Disabled select menu</Form.Label>
    <Form.Select disabled>
      <option>Disabled select</option>
    </Form.Select>
  </Form.Group>
  );
};

export default UserRoleChange;
