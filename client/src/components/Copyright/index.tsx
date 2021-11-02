import React, { FunctionComponent } from "react";
import { Link, Typography } from "@material-ui/core";

const Copyright: FunctionComponent = () => (
  <Typography variant="body2" color="textSecondary" align="center">
    {"Copyright © "}
    <Link color="inherit" href="https://satyrn.nulab.org/">
      Satyrn {new Date().getFullYear()}.
    </Link>
  </Typography>
);

export default Copyright;
