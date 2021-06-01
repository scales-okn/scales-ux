import React, { FunctionComponent } from "react";
import { Link, Typography } from "@material-ui/core";

const Copyright: FunctionComponent = () => (
  <Typography variant="body2" color="textSecondary" align="center">
    {"Copyright © "}
    <Link color="inherit" href="https://satyrn.com">
      Satyrn
    </Link>{" "}
    {new Date().getFullYear()}.
  </Typography>
);

export default Copyright;
